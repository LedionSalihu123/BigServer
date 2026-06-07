const bedrock = require('bedrock-protocol');

// إعدادات الاتصال بالسيرفر
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

// عند نجاح دخول البوت بالكامل وبقائه مستقراً
client.on('spawn', () => {
  console.log(`[+] دخل ${botOptions.username} إلى السيرفر بنجاح وهو الآن متصل ومستقر بدون حزم زائدة!`);
});

// التعامل مع الطرد من السيرفر لقراءة الأسباب إن حدثت
client.on('kick', (packet) => {
  console.log(`[-] تم طرد البوت من السيرفر. السبب: ${packet.reason}`);
});

// التعامل مع أخطاء الاتصال العامة
client.on('error', (err) => {
  console.error(`[خطأ] حدث خطأ في الاتصال:`, err);
});
