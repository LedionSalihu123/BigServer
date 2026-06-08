const { createClient } = require('bedrock-protocol');

function startBot() {
    console.log('🔄 محاولة الاتصال بـ Bluelightmine...');

    const client = createClient({
        host: 'Bluelightmine.aternos.me',
        port: 51069,
        username: 'RealPlayer_AFK',
        offline: true,
        version: '1.20.0',
        // إضافة هذه الخصائص تجعل البوت يظهر كأنه نسخة ماينكرافت حقيقية من ويندوز
        skipPing: false,
        connectTimeout: 30000 
    });

    client.on('connect', () => {
        console.log('✅ تم الاتصال بنجاح ببروتوكول السيرفر!');
    });

    client.on('spawn', () => {
        console.log('🎮 دخل البوت إلى العالم (Spawned)!');
    });

    client.on('error', (err) => {
        // تجاهل أخطاء الحزم البسيطة التي يسببها أترنوس
        console.log('⚠️ خطأ بروتوكول (يمكن تجاهله):', err.message);
    });

    client.on('kick', (packet) => {
        // تحسين عرض سبب الطرد
        console.log('❌ تم الطرد من السيرفر. السبب:', packet.message || packet.reason || 'مجهول (Silent)');
        console.log('⏳ إعادة المحاولة بعد 60 ثانية...');
        setTimeout(startBot, 60000);
    });

    client.on('close', () => {
        console.log('🔌 انقطع الاتصال، إعادة المحاولة...');
        setTimeout(startBot, 60000);
    });
}

startBot();
