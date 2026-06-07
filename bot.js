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
let moveToggle = false; // للتبديل بين الحركة للأمام والخلف

function startBot() {
  if (retryTimer) clearTimeout(retryTimer);
  if (afkInterval) clearInterval(afkInterval);
  
  console.log(`[اتصال] جاري الدخول إلى سيرفر البدروك المطور...`);

  try {
    client = bedrock.createClient(botOptions);

    // إلغاء الـ undefined وقراءة المعرف والموقع بأكثر من طريقة آمنة
    client.on('start_game', (packet) => {
      botRuntimeId = packet.runtime_id || packet.entity_id;
      
      if (packet.player_position) {
        botPosition = { ...packet.player_position };
      } else if (packet.position) {
        botPosition = { ...packet.position };
      }
      
      console.log(`[معلومات] تم التعرف على معرف البوت بنجاح: ${botRuntimeId}`);
    });

    client.on('move_player', (packet) => {
      if (botRuntimeId && (packet.runtime_id === botRuntimeId || packet.entity_id === botRuntimeId)) {
        botPosition = packet.position;
      }
    });

    client.on('spawn', () => {
      console.log(`[+] دخل ${botOptions.username} إلى السيرفر وهو الآن مستقر!`);
      
      // مهلة أطول (8 ثوانٍ) لضمان تحميل الخريطة والمودات بالكامل قبل بدء الحركة
      setTimeout(() => {
        startNaturalAFKLoop();
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

// حلقة حركة طبيعية تخدع حماية الـ BedWars والأنتيشيت
function startNaturalAFKLoop() {
  if (afkInterval) clearInterval(afkInterval);

  console.log(`[⚙️] تم تفعيل حلقة المشي والالتفات الطبيعي المناهض للأنتيشيت.`);

  afkInterval = setInterval(() => {
    if (!client || !botRuntimeId) return;

    // زوايا رؤية طبيعية
    const randomYaw = Math.random() * 360;
    const randomPitch = (Math.random() * 20) - 10;

    // تبديل الحركة: مرة يتقدم 0.3 بلوكة ومرة يعود لمكانه لمنع الطرد
    moveToggle = !moveToggle;
    const offset = moveToggle ? 0.3 : -0.3;

    const naturalMovement = {
      x: botPosition.x + (Math.sin(randomYaw * Math.PI / 180) * offset),
      y: botPosition.y,
      z: botPosition.z + (Math.cos(randomYaw * Math.PI / 180) * offset)
    };

    try {
      client.queue('move_player', {
        runtime_id: botRuntimeId,
        position: naturalMovement,
        pitch: randomPitch,
        yaw: randomYaw,
        head_yaw: randomYaw,
        mode: 0,
        on_ground: true,
        riding_runtime_id: 0,
        teleport_cause: 0,
        teleport_item_id: 0,
        tick: 0
      });
    } catch (e) {
      console.error(`[!] فشل إرسال حزمة المشي التلقائي:`, e.message);
    }
  }, 6000); // تكرار كل 6 ثوانٍ (وقت مثالي وآمن جداً للسيرفرات)
}

function triggerRetry() {
  if (afkInterval) clearInterval(afkInterval);
  
  if (client) {
    try { client.close(); } catch (e) {}
    client = null;
  }

  if (retryTimer) return;

  console.log(`⏳ سيتم إعادة المحاولة تلقائياً خلال 30 ثانية...`);
  retryTimer = setTimeout(() => {
    retryTimer = null;
    startBot();
  }, 30000);
}

startBot();
