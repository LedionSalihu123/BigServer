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

function startBot() {
  if (retryTimer) clearTimeout(retryTimer);
  if (afkInterval) clearInterval(afkInterval);
  
  console.log(`[اتصال] جاري الدخول إلى سيرفر البدروك عبر نظام التفاعل البديل...`);

  try {
    client = bedrock.createClient(botOptions);

    client.on('start_game', (packet) => {
      const rawId = packet.runtime_id || packet.entity_id;
      botRuntimeId = typeof rawId === 'bigint' ? rawId : BigInt(rawId);
      console.log(`[معلومات] تم التعرف على معرف البوت بنجاح: ${botRuntimeId.toString()}`);
    });

    client.on('spawn', () => {
      console.log(`[+] دخل ${botOptions.username} إلى السيرفر وهو الآن مستقر تماماً!`);
      
      // إرسال رسالة ترحيبية خفيفة للتأكيد
      setTimeout(() => {
        sendBotChat("👋 بوت الحماية من الطرد نشط الآن 24/7");
        startSafeAFKLoop();
      }, 5000);
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

// حلقة تفاعل آمنة تماماً وخالية 100% من حزم الـ Move المكسورة
function startSafeAFKLoop() {
  if (afkInterval) clearInterval(afkInterval);

  console.log(`[⚙️] تم تفعيل حلقة التفاعل الآمن (أرجحة اليد والتنبيه الذكي).`);

  afkInterval = setInterval(() => {
    if (!client || !botRuntimeId) return;

    try {
      // 1. أرجحة يد اللاعب (Swing Arm) - حزمة خفيفة جداً وتمنع الـ AFK قطعياً
      client.queue('animate', {
        action_id: 1, // 1 تعني أرجحة اليد (No BigInt needed!)
        runtime_id: botRuntimeId
      });

      // 2. إرسال أمر وهمي خفيف غير مرئي للشات للتأكيد الإضافي على النشاط كل دقيقة تقريباً
      if (Math.random() > 0.7) {
        sendBotChat("/help"); // أو أي أمر بسيط لا يزعج اللاعبين في الشات
      }

    } catch (e) {
      console.error(`[!] فشل إرسال حزمة التفاعل المجتمعي:`, e.message);
    }
  }, 15000); // تكرار كل 15 ثانية (آمن وخفيف جداً على السيرفر)
}

function sendBotChat(message) {
  if (!client) return;
  try {
    client.queue('text', {
      type: 'chat',
      needs_translation: false,
      source_name: botOptions.username,
      xuid: '',
      platform_chat_id: '',
      message: message
    });
  } catch (e) {
    // تجاهل خطأ الشات إذا حدث
  }
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
