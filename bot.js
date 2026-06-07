const bedrock = require('bedrock-protocol');
 
// إعدادات الاتصال بالسيرفر مأخوذة تلقائياً من الصورة المرفقة image_58a8a1.png
const botOptions = {
  host: 'Bluelightmine.aternos.me', // الـ IP الخاص بسيرفرك
  port: 51069,                      // المنفذ (Port) الخاص بسيرفرك
  username: 'RealPlayer_AFK',       // اسم البوت داخل اللعبة
  offline: true,                    // مفعل للسيرفرات المكركة (Cracked)
  version: '1.21.130'               // تحديد الإصدار المطابق لسيرفرك
};

// إنشاء الاتصال بالسيرفر
const client = bedrock.createClient(botOptions);

console.log(`جاري محاولة الاتصال بسيرفر البدروك إصدار ${botOptions.version}...`);

// إحداثيات افتراضية أولية للبوت داخل السيرفر
let currentPos = { x: 0, y: 0, z: 0 };
let runtimeEntityId = null;

// عند نجاح الاتصال والدخول للسيرفر
client.on('spawn', (packet) => {
  console.log(`[+] دخل ${botOptions.username} إلى السيرفر بنجاح!`);
  
  // حفظ الإحداثيات التي رسبن فيها البوت
  if (packet.x && packet.y && packet.z) {
    currentPos = { x: packet.x, y: packet.y, z: packet.z };
    runtimeEntityId = packet.runtime_entity_id;
  }

  // بدء حلقة الحركة والتفاعل العشوائي كل 5 ثوانٍ
  startBedrockLoop();
});

function startBedrockLoop() {
  setInterval(() => {
    if (!client) return;

    // توليد زوايا نظر عشوائية (التفات الرأس)
    const randomYaw = Math.random() * 360;
    const randomPitch = (Math.random() * 180) - 90;

    // توليد حركة بسيطة عشوائية (بين -0.5 و 0.5 بلوكة) لتجنب الحظر أو التعليق
    const moveX = (Math.random() * 1) - 0.5;
    const moveZ = (Math.random() * 1) - 0.5;
    
    currentPos.x += moveX;
    currentPos.z += moveZ;

    // إرسال حزمة الحركة والنظر الرسمية (Player Auth Input Packet)
    client.write('player_auth_input', {
      pitch: randomPitch,
      yaw: randomYaw,
      position: { x: currentPos.x, y: currentPos.y, z: currentPos.z },
      move_vector: { x: moveX, z: moveZ },
      head_yaw: randomYaw,
      input_flags: {
        move_forward: moveX > 0,
        move_backward: moveX < 0,
        move_left: moveZ > 0,
        move_right: moveZ < 0,
        sneaking: false,
        jumping: Math.random() > 0.7 // نسبة 30% يقوم بالقفز أثناء الحركة لتوثيق النشاط
      },
      input_mode: 'mouse',
      play_mode: 'normal',
      interaction_model: 'touch'
    });

    console.log(`[حركة] البوت تحرك إلى X: ${currentPos.x.toFixed(2)}, Z: ${currentPos.z.toFixed(2)} والتفت عشوائياً.`);

    // شات عشوائي بنسبة ضئيلة جداً لتفادي نظام كشف السبام (Spam Detection)
    if (Math.random() < 0.1) {
      const phrases = ["Hello", "I'm building", "Wait a minute", "No lag today"];
      const randomTxt = phrases[Math.floor(Math.random() * phrases.length)];
      
      client.write('text', {
        type: 'chat',
        needs_translation: false,
        source_name: botOptions.username,
        xuid: '',
        platform_chat_id: '',
        message: randomTxt
      });
      console.log(`[شات] البوت أرسل: "${randomTxt}"`);
    }

  }, 5000); // يتخذ خطوة أو حركة جديدة كل 5 ثوانٍ
}

// التعامل مع الأخطاء والطرد من السيرفر
client.on('kick', (packet) => {
  console.log(`[-] تم طرد البوت من السيرفر. السبب: ${packet.reason}`);
});

client.on('error', (err) => {
  console.error(`[خطأ] حدث خطأ في الاتصال:`, err);
});
