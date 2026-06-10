const bedrock = require('bedrock-protocol');

const options = {
    host: 'Bluelightmine.aternos.me',        // ضع هنا الآيبي الخاص بسيرفرك
    port: 51069,                   // البورت
    username: 'BedrockBot',        // اسم البوت
    version: '1.21.20',            // الإصدار
    offline: true                  
};

function createBot() {
    console.log("جاري تشغيل البوت والاتصال بسيرفر بيدروك...");

    try {
        const client = bedrock.createClient(options);

        client.on('join', () => {
            console.log("تم دخول البوت إلى سيرفر البيدروك بنجاح وهو الآن داخل العالم!");
            
            // وظيفية Anti-AFK مطورة: إرسال حزمة حركة وهمية (تغيير زاوية الرأس يميناً ويساراً) كل 20 ثانية لمنع الطرد
            let lookToggle = false;
            setInterval(() => {
                if (client.status === 'playing' || client.state === 'play') {
                    // إرسال حزمة الالتفات للسيرفر لإثبات النشاط
                    client.write('player_auth_input', {
                        pitch: 0,
                        yaw: lookToggle ? 90 : 0,
                        position: { x: 0, y: 0, z: 0 },
                        move_vector: { x: 0, z: 0 },
                        head_yaw: lookToggle ? 90 : 0,
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
                        gaze_direction: { x: 0, y: 0, z: 0 },
                        tick: 0,
                        delta: { x: 0, y: 0, z: 0 }
                    });
                    lookToggle = !lookToggle;
                    console.log("تم إرسال حزمة حركة وهمية (Anti-AFK)");
                }
            }, 20000);
        });

        client.on('text', (packet) => {
            if (packet.message) console.log(`[شات السيرفر]: ${packet.message}`);
        });

        client.on('close', () => {
            console.log("تم فصل البوت. إعادة الاتصال بعد 15 ثانية...");
            setTimeout(createBot, 15000);
        });

        client.on('error', (err) => {
            console.log("حدث خطأ: ", err.message);
        });

    } catch (error) {
        console.log("فشل في تشغيل العميل: ", error.message);
        setTimeout(createBot, 15000);
    }
}

createBot();
