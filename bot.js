const bedrock = require('bedrock-protocol');

// إعدادات الاتصال بالسيرفر
const botOptions = {
  host: 'Bluelightmine.aternos.me', 
  port: 51069,                      
  username: 'RealPlayer_AFK',       
  offline: true,                    
  version: '1.21.130'               
};

let client = null;
let retryTimer = null;
let afkInterval = null;

let botRuntimeId = null;
let botPosition = { x: 0, y: 0, z: 0 };

function startBot() {
  if (retryTimer) clearTimeout(retryTimer);
  if (afkInterval) clearInterval(afkInterval);
  
  console.log(`[اتصال] جاري الدخول إلى سيرفر البدروك...`);

  try {
    client = bedrock.createClient(botOptions);

    client.on('start_game', (packet) => {
      const rawId = packet.runtime_id || packet.entity_id;
      botRuntimeId = typeof rawId === 'bigint' ? rawId : BigInt(rawId);
      
      if (packet.player_position) {
        botPosition = { ...packet.player_position };
      } else if (packet.position) {
        botPosition = { ...packet.position };
      }
      
      console.log(`[معلومات] تم التعرف على معرف البوت بنجاح: ${botRuntimeId.toString()}`);
    });

    client.on('move_player', (packet) => {
      if (botRuntimeId) {
        const pId = packet.runtime_id || packet.entity_id;
        const compareId = typeof pId === 'bigint' ? pId : BigInt(pId);
        if (compareId === botRuntimeId) {
          botPosition = packet.position;
        }
      }
    });

    client.on('spawn', () => {
      console.log(`[+] دخل ${botOptions.username} إلى السيرفر وهو الآن مستقر!`);
      
      setTimeout(() => {
        startLookAFKLoop();
      }, 8000);
    });

    client.on('error', (err) => {
      console.error(`[تنبيه] حدث خطأ في الاتصال (${err.message})`);
      triggerRetry();
    });

    client.on('close', () => {
      console.log(`[!] انقطع الاتصال بالسيرفر.`);
      triggerRetry();
    });

    client.on('kick', (packet) => {
      console.log(`[-] تم طرد البوت. السبب: ${packet.reason || JSON.stringify(packet)}`);
      triggerRetry();
    });

  } catch (error) {
    console.error(`[خطأ غير متوقع]:`, error);
    triggerRetry();
  }
}

// حلقة الالتفات والتحديق العشوائي (آمنة تماماً من أخطاء الـ BigInt وتمنع الطرد)
function startLookAFKLoop() {
  if (afkInterval) clearInterval(afkInterval);

  console.log(`[⚙️] تم تفعيل حلقة التحديق والالتفات العشوائي الآمنة.`);

  afkInterval = setInterval(() => {
    if (!client || !botRuntimeId) return;

    // توليد زوايا رؤية عشوائية طبيعية (التفات يميناً ويساراً وللأعلى والأسفل)
    const randomYaw = parseFloat(Math.random() * 360);
    const randomPitch = parseFloat((Math.random() * 30) - 15);

    try {
      // إرسال حزمة حركة تعتمد فقط على الالتفات في نفس النقطة بدون تغيير الموقع
      client.queue('move_player', {
        runtime_id: botRuntimeId,
        position: {
          x: parseFloat(botPosition.x),
          y: parseFloat(botPosition.y),
          z: parseFloat(botPosition.z)
        },
        pitch: randomPitch,
        yaw: randomYaw,
        head_yaw: randomYaw,
        mode: 0, // الوضع العادي
        on_ground: true,
        riding_runtime_id: 0n,
        teleport_cause: 0,
        teleport_item_id: 0,
        tick: 0n
      });
    } catch (e) {
      console.error(`[!] فشل إرسال حزمة الالتفات:`, e.message);
    }
  }, 7000); // تكرار كل 7 ثوانٍ
}

function triggerRetry() {
  if (afkInterval) clearInterval(afkInterval);
  
  if (client) {
    try { client.close(); } catch (e) {}
    client = null;
  }

  if (retryTimer) return;

  console.log(`⏳ سيتم إعادة المحاولة تلقائياً خلال 45 ثانية...`);
  retryTimer = setTimeout(() => {
    retryTimer = null;
    startBot();
  }, 45000);
}

startBot();
