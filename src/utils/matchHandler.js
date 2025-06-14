const axios = require('axios');
const beautyAnalyzer = require('./beautyAnalyzer');
const { readConfig } = require('../config/configManager');

class MatchHandler {
    constructor() {
        this.auth = readConfig('auth.json');
    }

    async processMatch(userId, action) {
        try {
            // Lấy thông tin người dùng
            const userInfo = await this.getUserInfo(userId);
            const settings = readConfig('setting.json');
            let beautyAnalysis = null;

            // Nếu là like và bật AI chấm điểm khuân mặt
            if (action === 'like' && settings.aiFaceBeauty && userInfo.photos && userInfo.photos.length > 0) {
                const mainPhoto = userInfo.photos[0].url;
                beautyAnalysis = await beautyAnalyzer.analyzeBeauty(mainPhoto);
                // Nếu không đủ tiêu chí (từ 'Xinh' trở lên) thì không match
                if (!beautyAnalysis.isBeautiful) {
                    return {
                        success: false,
                        match: false,
                        reason: 'Không đủ tiêu chí AI chấm điểm khuân mặt',
                        beautyAnalysis,
                        userInfo
                    };
                }
            }

            // Nếu không bật AI hoặc là pass, vẫn thực hiện match bình thường
            const response = await this.performSwipe(userId, action);

            // Nếu match thành công và đã phân tích ngoại hình
            if (response.match && beautyAnalysis) {
                return {
                    success: true,
                    match: true,
                    beautyAnalysis,
                    userInfo
                };
            }

            return {
                success: true,
                match: response.match,
                userInfo
            };
        } catch (error) {
            console.error('Lỗi xử lý match:', error);
            throw error;
        }
    }

    async getUserInfo(userId) {
        try {
            const response = await axios({
                method: 'get',
                url: `https://api.gotinder.com/user/${userId}?locale=vi`,
                headers: {
                    'authority': 'api.gotinder.com',
                    'accept': 'application/json',
                    'x-auth-token': this.auth['x-auth-token']
                }
            });
            return response.data.results;
        } catch (error) {
            console.error('Lỗi lấy thông tin người dùng:', error);
            throw error;
        }
    }

    async performSwipe(userId, action) {
        try {
            const response = await axios({
                method: 'post',
                url: `https://api.gotinder.com/user/${action}/${userId}?locale=vi`,
                headers: {
                    'authority': 'api.gotinder.com',
                    'accept': 'application/json',
                    'x-auth-token': this.auth['x-auth-token']
                }
            });
            return response.data;
        } catch (error) {
            console.error('Lỗi thực hiện swipe:', error);
            throw error;
        }
    }
}

module.exports = new MatchHandler(); 