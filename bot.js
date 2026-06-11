const bedrock = require('bedrock-protocol');

const options = {
    host: 'Bluelightmine.aternos.me',        // الآيبي الخاص بسيرفرك
    port: 51069,                            // البورت
    username: 'BedrockBot',                 // اسم البوت
    version: '1.26.20',                     // الإصدار المتوافق تماماً
    offline: true                           
};

function createBot() {
    console.log("جاري تشغيل البوت والاتصال بسيرفر بيدروك (إصدار 1.26.20)...");

    try {
        const client = bedrock.createClient(options);
        let currentTick = 0;
        let afkInterval = null;

        client.on('join', () => {
            console.log("تم دخول البوت إلى سيرفر البيدروك بنجاح وهو الآن داخل العالم!");
            
            // متغير للتحكم باتجاه الحركة (أمام / خلف)
            let moveDirection = 1; // 1 للأمام، -1 للخلف

            afkInterval = setInterval(() => {
                if (client.status === 'playing' || client.state === 'play') {
                    currentTick++;

                    // تحديد قيم المتجهات بناءً على الاتجاه الحالي
                    // z: 1 يعادل الضغط على W (أمام)، z: -1 يعادل الضغط على S (خلف)
                    let zMove = moveDirection === 1 ? 1 : -1;

                    // إرسال حزمة الحركة الفيزيائية المتقدمة للسيرفر
                    client.write('player_auth_input', {
                        pitch: 0,
                        yaw: 0,
                        position: { x: 0, y: 0, z: 0 },
                        move_vector: { x: 0, z: zMove }, // الحركة على محور الـ Z
                        head_yaw: 0,
                        input_data: {
                            _value: 0,
                            ascend: false,
                            descend: false,
                            north_jump: false,
                            jump_down: false,
                            sprint_down: false,
                            change_height: false,
                            jumping: false,
                            auto_jumping_in_water: false,
                            sneaking_down: false,
                            sneak_down: false,
                            up_left: false,
                            up_right: false,
                            want_up: false,
                            want_down: false,
                            want_down_slow: false,
                            want_up_slow: false,
                            is_grabbing_add_actor_packet: false,
                            is_slow_sprinting: false
                        },
                        input_mode: 'mouse',
                        play_mode: 'screen',
                        interaction_model: 'touch',
                        gaze_direction: { x: 0, y: 0, z: 1 },
                        tick: currentTick,
                        delta: { x: 0, y: 0, z: 0 }
                    });

                    console.log(moveDirection === 1 ? "البوت يتحرك خطوة للأمام..." : "البوت يرجع خطوة للخلف...");
                    
                    // عكس الاتجاه للمرة القادمة
                    moveDirection = moveDirection * -1;
                }
            }, 20000); // تكرار الحركة كل 20 ثانية لمنع الطرد نهائياً
        });

        client.on('text', (packet) => {
            if (packet.message) console.log(`[شات السيرفر]: ${packet.message}`);
        });

        // التعامل الآمن والمستمر مع انقطاع الاتصال المفاجئ
        client.on('close', () => {
            console.log("تم قطع الاتصال بالسيرفر! جاري تصفية الذاكرة وإعادة المحاولة بعد 10 ثوانٍ...");
            if (afkInterval) clearInterval(afkInterval);
            setTimeout(createBot, 10000);
        });

        // معالجة الأخطاء لضمان عدم انهيار الـ Workflow بالكامل
        client.on('error', (err) => {
            console.log("حدث خطأ في شبكة البروتوكول: ", err.message);
            // لا حاجة لعمل ريستارت هنا لأن حدث 'close' سيتم إطلاقه تلقائياً بعد الخطأ وسيتولى المهمة
        });

    } catch (error) {
        console.log("فشل كلي في بدء تشغيل العميل: ", error.message);
        console.log("جاري إعادة المحاولة الإجبارية بعد 15 ثانية...");
        setTimeout(createBot, 15000);
    }
}

// تشغيل الدورة الأولى
createBot();
