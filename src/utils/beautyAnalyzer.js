const axios = require('axios');

class BeautyAnalyzer {
    constructor() {
        this.apiKey = process.env.FACEPP_API_KEY;
        this.apiSecret = process.env.FACEPP_API_SECRET;
    }

    async analyzeBeauty(imageUrl) {
        try {
            console.log('[DEBUG] Gửi ảnh lên Face++:', imageUrl);
            const response = await axios.post(
                'https://api-us.faceplusplus.com/facepp/v3/detect',
                null,
                {
                    params: {
                        api_key: this.apiKey,
                        api_secret: this.apiSecret,
                        image_url: imageUrl,
                        return_attributes: 'beauty,gender,age,emotion'
                    }
                }
            );

            console.log('[DEBUG] Kết quả trả về từ Face++:', response.data);

            if (!response.data.faces || response.data.faces.length === 0) {
                return { isBeautiful: false, level: 'Không xinh', reason: 'Không phát hiện được khuôn mặt' };
            }

            const attr = response.data.faces[0].attributes;
            const beautyScore = Math.max(attr.beauty.male_score, attr.beauty.female_score);
            let level = 'Không xinh';
            if (beautyScore >= 85) level = 'Rất xinh';
            else if (beautyScore >= 75) level = 'Xinh';
            else if (beautyScore >= 65) level = 'Dễ thương';
            // isBeautiful chỉ true nếu từ "Xinh" trở lên
            const isBeautiful = beautyScore >= 75;

            return {
                isBeautiful,
                level,
                reason: level,
                debug: {
                    beautyScore,
                    gender: attr.gender.value,
                    age: attr.age.value,
                    emotion: attr.emotion
                }
            };
        } catch (error) {
            console.error('[DEBUG] Lỗi phân tích ngoại hình:', error);
            return { isBeautiful: false, level: 'Không xinh', reason: 'Lỗi phân tích', debug: { error: error.message } };
        }
    }
}

module.exports = new BeautyAnalyzer(); 