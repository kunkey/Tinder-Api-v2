const axios = require('axios'); // use v1.12
const helper = require('./helper');

// Constants
const API_BASE_URL = 'https://api.gotinder.com';
const DEFAULT_HEADERS = {
    'authority': 'api.gotinder.com',
    'accept': 'application/json',
    'accept-language': 'vi,vi-VN,en-US,en',
    'app-version': '1035502',
    'platform': 'web',
    'referer': 'https://tinder.com/',
    'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'tinder-version': '3.55.2',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'x-supported-image-formats': 'webp,jpeg'
};

/**
 * Tạo headers cho request với auth token
 * @param {Object} config - Config object chứa auth token
 * @returns {Object} Headers object
 */
const createAuthHeaders = (config) => ({
    ...DEFAULT_HEADERS,
    'x-auth-token': config["x-auth-token"]
});

/**
 * Login với auth token
 * @returns {Promise<Object>} Object chứa refreshToken, tokenApi và uid
 */
const loginWithAuthToken = async () => {
    try {
        const auth = helper.getConfig('auth');
        
        const login = await axios({
            method: 'post',
            url: `${API_BASE_URL}/v3/auth/login?locale=vi`,
            headers: {
                ...DEFAULT_HEADERS,
                'content-type': 'application/x-google-protobuf',
                'is-created-as-guest': 'false',
                'persistent-device-id': '70ee2b6f-5248-446c-8c55-cca35c11f90d'
            },
            data: `R_\n]${auth.login_token}`
        });

        const removeBefore = login.data.split("]");
        const removeAfter = removeBefore[1].split(`*\x05`);
        const token = removeAfter[0].split(`\x12$`);
        const ParseData = removeAfter[0].split('\x12$');
        const data = ParseData[1].split('"\x18');

        const newAuth = {
            "login_token": token[0],
            "meID": data[1],
            "app-session-id": auth["app-session-id"],
            "app-session-time-elapsed": auth["app-session-time-elapsed"],
            "persistent-device-id": auth["persistent-device-id"],
            "user-session-id": auth["user-session-id"],
            "user-session-time-elapsed": auth["user-session-time-elapsed"],
            "x-auth-token": data[0],
            "locale": "vi"
        };

        await helper.setConfig('auth', newAuth);

        return {
            'refreshToken': token[0],
            'tokenApi': data[0],
            'uid': data[1]
        };
    } catch (error) {
        throw new Error(`Login failed: ${error.message}`);
    }
};

/**
 * Cập nhật vị trí người dùng
 * @param {number} lat - Vĩ độ
 * @param {number} long - Kinh độ
 * @returns {Promise<Object>} Response data
 */
const updateLocation = async (lat, long) => {
    try {
        const config = helper.getConfig('auth');
        const response = await axios({
            method: 'post',
            url: `${API_BASE_URL}/v2/meta?locale=vi`,
            headers: createAuthHeaders(config),
            data: {
                lat,
                lon: long,
                force_fetch_resources: true
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(`Update location failed: ${error.message}`);
    }
};

let getMyProfile = () => {
    return new Promise((resolve, reject) => {
        const config = helper.getConfig('auth');
        axios({
            method: 'get',
            url: `https://api.gotinder.com/v2/profile?locale=${config["locale"]}&include=account%2Cavailable_descriptors%2Cboost%2Cbouncerbypass%2Ccontact_cards%2Cemail_settings%2Cfeature_access%2Cinstagram%2Clikes%2Cprofile_meter%2Cnotifications%2Cmisc_merchandising%2Cofferings%2Conboarding%2Cplus_control%2Cpurchase%2Creadreceipts%2Cspotify%2Csuper_likes%2Ctinder_u%2Ctravel%2Ctutorials%2Cuser`,
            headers: {
                'authority': 'api.gotinder.com',
                'accept': 'application/json',
                'accept-language': 'vi,vi-VN,en-US,en,zh-CN',
                'app-version': '1035502',
                'origin': 'https://tinder.com',
                'platform': 'web',
                'referer': 'https://tinder.com/',
                'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                'tinder-version': '3.55.2',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
                'x-supported-image-formats': 'webp,jpeg',
                'x-auth-token': config["x-auth-token"],
            }
        }).then((profile) => {
            resolve(profile.data)
        }).catch((err) => {
            reject(err);
        });
    });
}

let getRecommendUser = () => {
    return new Promise((resolve, reject) => {
        const config = helper.getConfig('auth');
        axios({
            method: 'get',
            url: `https://api.gotinder.com/v2/recs/core?locale=${config["locale"]}`,
            headers: {
                'authority': 'api.gotinder.com',
                'accept': 'application/json',
                'accept-language': 'vi,vi-VN,en-US,en',
                'app-version': '1032800',
                'origin': 'https://tinder.com',
                'platform': 'web',
                'referer': 'https://tinder.com/',
                'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Linux"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                'tinder-version': '3.28.0',
                'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36',
                'x-auth-token': config["x-auth-token"],
                'x-supported-image-formats': 'webp,jpeg'
            }
        }).then((getData) => {
            resolve(getData.data);
        }).catch((error) => {
            reject(error);
        });
    });
}

let getRecommendUserByCatalog = (catalogId) => {
    return new Promise((resolve, reject) => {
        const config = helper.getConfig('auth');
        axios({
            method: 'get',
            url: `https://api.gotinder.com/v2/explore/recs?locale=${config["locale"]}&catalog_id=${catalogId}`,
            headers: {
                'authority': 'api.gotinder.com',
                'accept': 'application/json',
                'accept-language': 'vi,vi-VN,en-US,en',
                'app-version': '1032800',
                'origin': 'https://tinder.com',
                'platform': 'web',
                'referer': 'https://tinder.com/',
                'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Linux"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                'tinder-version': '3.28.0',
                'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36',
                'x-auth-token': config["x-auth-token"],
                'x-supported-image-formats': 'webp,jpeg'
            }
        }).then((getData) => {
            resolve(getData.data);
        }).catch((error) => {
            reject(error);
        });
    });
}

const getMatched = (limit) => {
    return new Promise((resolve, reject) => {
        const config = helper.getConfig('auth');
        axios({
            method: 'get',
            url: `https://api.gotinder.com/v2/matches?locale=vi&count=${limit}&message=0&is_tinder_u=false`,
            headers: {
                'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
                'accept-language': 'vi,vi-VN,en-US,en',
                'sec-ch-ua-platform': '"Linux"',
                'x-supported-image-formats': 'webp,jpeg',
                'tinder-version': '3.28.0',
                'sec-ch-ua-mobile': '?0',
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36',
                'Accept': 'application/json',
                'Referer': 'https://tinder.com/',
                'platform': 'web',
                'app-version': '1032800',
                'X-Auth-Token': config["x-auth-token"],
            }
        }).then((getData) => {
            resolve(getData.data);
        }).catch((err) => {
            reject(err);
        });
    });
}

const getMatchedMessage = (limit, page_token = null) => {
    return new Promise((resolve, reject) => {
        const config = helper.getConfig('auth');
        let urlFetch = (page_token) ? `https://api.gotinder.com/v2/matches?locale=vi&count=${limit}&message=1&is_tinder_u=false&page_token=${page_token}` : `https://api.gotinder.com/v2/matches?locale=vi&count=${limit}&message=1&is_tinder_u=false`;
        axios({
            method: 'get',
            url: urlFetch,
            headers: {
                'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
                'accept-language': 'vi,vi-VN,en-US,en',
                'sec-ch-ua-platform': '"Linux"',
                'x-supported-image-formats': 'webp,jpeg',
                'tinder-version': '3.28.0',
                'sec-ch-ua-mobile': '?0',
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36',
                'Accept': 'application/json',
                'Referer': 'https://tinder.com/',
                'platform': 'web',
                'app-version': '1032800',
                'X-Auth-Token': config["x-auth-token"],
            }
        }).then((getData) => {
            resolve(getData.data);
        }).catch((err) => {
            reject(err);
        });
    });
}

let likeUser = (userID, sNumber) => {
    return new Promise((resolve, reject) => {
        const config = helper.getConfig('auth');
        axios({
            method: 'post',
            url: `https://api.gotinder.com/like/${userID}?locale=${config["locale"]}`,
            headers: {
                'authority': 'api.gotinder.com',
                'accept': 'application/json',
                'accept-language': 'vi,vi-VN,en-US,en',
                'app-version': '1032800',
                'content-type': 'application/json',
                'origin': 'https://tinder.com',
                'platform': 'web',
                'referer': 'https://tinder.com/',
                'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Linux"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                'tinder-version': '3.28.0',
                'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36',
                'x-auth-token': config["x-auth-token"],
                'x-supported-image-formats': 'webp,jpeg'
            },
            data: JSON.stringify({
                "s_number": sNumber,
                "user_traveling": 1
            })
        }).then((likeData) => {
            resolve(likeData.data);
        }).catch((error) => {
            reject(error);
        });
    });
}

let likeUserByCatalog = (userID, sNumber, likedContentId) => {
    return new Promise((resolve, reject) => {
        const config = helper.getConfig('auth');
        axios({
            method: 'post',
            url: `https://api.gotinder.com/like/${userID}?locale=${config["locale"]}`,
            headers: {
                'authority': 'api.gotinder.com',
                'accept': 'application/json',
                'accept-language': 'vi,vi-VN,en-US,en',
                'app-version': '1032800',
                'content-type': 'application/json',
                'origin': 'https://tinder.com',
                'platform': 'web',
                'referer': 'https://tinder.com/',
                'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Linux"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                'tinder-version': '3.28.0',
                'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36',
                'x-auth-token': config["x-auth-token"],
                'x-supported-image-formats': 'webp,jpeg'
            },
            data: JSON.stringify({
                "s_number": sNumber,
                "liked_content_id": likedContentId,
                "liked_content_type": "photo"
            })
        }).then((likeData) => {
            resolve(likeData.data);
        }).catch((error) => {
            reject(error);
        });
    });
}

const getUserInfo = (shortID) => {
    return new Promise((resolve, reject) => {
        const config = helper.getConfig('auth');

        axios({
            method: 'get',
            url: `https://api.gotinder.com/user/${shortID}?locale=${config["locale"]}`,
            headers: {
                'authority': 'api.gotinder.com',
                'accept': 'application/json',
                'accept-language': 'vi,vi-VN,en-US,en',
                'app-version': '1032800',
                'content-type': 'application/json',
                'origin': 'https://tinder.com',
                'platform': 'web',
                'referer': 'https://tinder.com/',
                'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Linux"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                'tinder-version': '3.28.0',
                'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36',
                'x-auth-token': config["x-auth-token"],
                'x-supported-image-formats': 'webp,jpeg'
            }
        }).then((sendData) => {
            resolve(sendData.data);
        }).catch((err) => {
            reject(err);
        });
    })
};

const seenMatch = (userID) => { // 5e807181e0739401001f589f5ef3b4718a1f1e0100aa96a9
    return new Promise((resolve, reject) => {
        const config = helper.getConfig('auth');
        axios({
            method: 'post',
            url: `https://api.gotinder.com/v2/seen/${userID}?locale=${config["locale"]}`,
            headers: {
                'authority': 'api.gotinder.com',
                'accept': 'application/json',
                'accept-language': 'vi,vi-VN,en-US,en',
                'app-version': '1032800',
                'content-type': 'application/json',
                'origin': 'https://tinder.com',
                'platform': 'web',
                'referer': 'https://tinder.com/',
                'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Linux"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                'tinder-version': '3.28.0',
                'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36',
                'x-auth-token': config["x-auth-token"],
                'x-supported-image-formats': 'webp,jpeg'
            },
            data: JSON.stringify({})
        }).then((seenData) => {
            resolve(seenData.data);
        }).catch((err) => {
            reject(err);
        });
    });
}

/**
 * Gửi tin nhắn cho match
 * @param {string} matchId - ID của match
 * @param {string} shortID - Short ID của người nhận
 * @param {string} name - Tên người nhận
 * @param {string} message - Nội dung tin nhắn
 * @returns {Promise<Object>} Response data
 */
const sendMessage = async (matchId, shortID, name, message) => {
    try {
        const config = helper.getConfig('auth');
        const response = await axios({
            method: 'post',
            url: `${API_BASE_URL}/user/matches/${matchId}?locale=${config["locale"]}`,
            headers: createAuthHeaders(config),
            data: {
                userId: config["meID"],
                otherId: shortID,
                matchId,
                sessionId: config["user-session-id"],
                message
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(`Send message failed: ${error.message}`);
    }
};

const unMatchUser = (matchId, shortID) => {
    return new Promise((resolve, reject) => {
        const config = helper.getConfig('auth');

        axios({
            method: 'get',
            url: `https://api.gotinder.com/user/${shortID}?locale=${config["locale"]}`,
            headers: {
                'authority': 'api.gotinder.com',
                'accept': 'application/json',
                'accept-language': 'vi,vi-VN,en-US,en',
                'app-version': '1032800',
                'content-type': 'application/json',
                'origin': 'https://tinder.com',
                'platform': 'web',
                'referer': 'https://tinder.com/',
                'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Linux"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                'tinder-version': '3.28.0',
                'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36',
                'x-auth-token': config["x-auth-token"],
                'x-supported-image-formats': 'webp,jpeg'
            }
        }).then((sendData) => {
            resolve(sendData.data);
        }).catch((err) => {
            reject(err);
        });

        axios({
            method: 'delete',
            url: `https://api.gotinder.com/user/matches/${matchId}?locale=${config["locale"]}`,
            headers: {
                'authority': 'api.gotinder.com',
                'accept': 'application/json',
                'accept-language': 'vi,vi-VN,en-US,en',
                'app-version': '1032800',
                'content-type': 'application/json',
                'origin': 'https://tinder.com',
                'platform': 'web',
                'referer': 'https://tinder.com/',
                'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Linux"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                'tinder-version': '3.28.0',
                'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36',
                'x-auth-token': config["x-auth-token"],
                'x-supported-image-formats': 'webp,jpeg'
            }
        }).then((sendData) => {
            resolve(sendData.data);
        }).catch((err) => {
            reject(err);
        });
    });
}

module.exports = {
    loginWithAuthToken,
    updateLocation,
    getMyProfile,
    getRecommendUser,
    getRecommendUserByCatalog,
    likeUser,
    likeUserByCatalog,
    seenMatch,
    sendMessage,
    getMatched,
    getMatchedMessage,
    getUserInfo,
    unMatchUser
}