const bedrock = require('bedrock-protocol');

const options = {
    host: 'Bluelightmine.aternos.me',        
    port: 51069,                            
    username: 'BedrockBot',                 
    version: '1.26.20',                     
    offline: true                           
};

function createBot() {
    console.log("جاري تشغيل البوت والاتصال بسيرفر بيدروك (إصدار 1.26.20)...");

    try {
        const client = bedrock.createClient(options);
        let currentTick = 0;
        let afkInterval = null;
        let isDisconnected = false; // لمنع تكرار دالة الفصل

        client.on('join', () => {
            console.log("تم دخول البوت إلى سيرفر البيدروك بنجاح وهو الآن داخل العالم!");
            
            let moveDirection = 1; 

            afkInterval = setInterval(() => {
                if ((client.status === 'playing' || client.state === 'play') && !isDisconnected) {
                    currentTick++;
                    let zMove = moveDirection === 1 ? 1 : -1;

                    client.write('player_auth_input', {
                        pitch: 0,
                        yaw: 0,
                        position: { x: 0, y: 0, z: 0 },
                        move_vector: { x: 0, z: zMove }, 
                        head_yaw: 0,
                        input_data: {
                            _value: 0,
                            ascend: false, descend: false, north_jump: false, jump_down: false,
                            sprint_down: false, change_height: false, jumping: false,
                            auto_jumping_in_water: false, sneaking_down: false, sneak_down: false,
                            up_left: false, up_right: false, want_up: false, want_down: false,
                            want_down_slow: false, want_up_slow: false, is_grabbing_add_actor_packet: false,
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
                    moveDirection = moveDirection * -1;
                }
            }, 20000); 
        });

        client.on('text', (packet) => {
            if (packet.message) console.log(`[شات السيرفر]: ${packet.message}`);
        });

        // دالة موحدة للتعامل مع الفصل ومنع التكرار والتداخل
        const handleDisconnect = (reason) => {
            if (isDisconnected) return; 
            isDisconnected = true;

            console.log(`تم قطع الاتصال بالسيرفر! (السبب: ${reason}). جاري التنظيف...`);
            
            if (afkInterval) clearInterval(afkInterval);
            
            try {
                client.end();
            } catch (e) {}

            // الانتظار 30 ثانية كاملة ليتأكد السيرفر من خروج البوت تماماً ومسحه من الذاكرة قبل الدخول مجدداً
            console.log("سيتأخر بدء الاتصال الجديد لـ 30 ثانية لتفادي مشكلة البوت المزدوج...");
            setTimeout(createBot, 30000);
        };

        client.on('close', () => handleDisconnect('إغلاق القناة close'));
        client.on('error', (err) => handleDisconnect(`خطأ شبكة: ${err.message}`));

    } catch (error) {
        console.log("فشل كلي في بدء تشغيل العميل: ", error.message);
        console.log("جاري إعادة المحاولة الإجبارية بعد 30 ثانية...");
        setTimeout(createBot, 30000);
    }
}

createBot();
