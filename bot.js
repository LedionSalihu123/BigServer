const mineflayer = require('mineflayer');

// إعدادات الاتصال بالسيرفر
const options = {
    host: 'Bluelightmine.aternos.me',        // ضع هنا الآيبي الخاص بسيرفرك
    port: 51069,                   // البورت الافتراضي لبيدروك
    username: 'BedrockBot',        // اسم البوت
    version: '1.21.20'             // الإصدار المطلوب
};

function createBot() {
    console.log("جاري تشغيل البوت والاتصال بالسيرفر...");
    
    // ملاحظة: مكتبة mineflayer تدعم الجافا بشكل أساسي، للاتصال ببيدروك تحتاج السيرفرات لـ Geyser 
    // أو يتم الاعتماد على بروتوكول Bedrock مباشرة.
    const bot = mineflayer.createBot(options);

    bot.on('spawn', () => {
        console.log("تم دخول البوت إلى العالم بنجاح!");
        
        // لمنع الطرد (Anti-AFK): البوت سيقوم بحركة خفيفة كل 20 ثانية ليبقى في حالة نشاط
        setInterval(() => {
            if (bot.entity) {
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 500);
            }
        }, 20000);
    });

    bot.on('chat', (username, message) => {
        if (username === bot.username) return;
        console.log(`[شات] ${username}: ${message}`);
    });

    bot.on('disconnect', (packet) => {
        console.log("تم فصل البوت، جاري إعادة الاتصال بعد 10 ثوانٍ...", packet);
        setTimeout(createBot, 10000);
    });

    bot.on('error', (err) => {
        console.log("حدث خطأ في البوت: ", err);
    });
}

createBot();
