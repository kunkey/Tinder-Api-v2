const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { createServer } = require('http');
const { Server } = require('socket.io');
const axios = require('axios');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Đọc file cấu hình
const readConfig = (filename) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, '..', 'config', filename), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Lỗi đọc file ${filename}:`, error);
        return null;
    }
};

// Ghi file cấu hình
const writeConfig = (filename, data) => {
    try {
        fs.writeFileSync(path.join(__dirname, '..', 'config', filename), JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Lỗi ghi file ${filename}:`, error);
        return false;
    }
};

// Route chính
app.get('/', (req, res) => {
    const auth = readConfig('auth.json');
    const settings = readConfig('setting.json');
    res.render('index', { auth, settings });
});

// Cập nhật auth
app.post('/update-auth', (req, res) => {
    try {
        const auth = readConfig('auth.json');
        const updatedAuth = { ...auth, ...req.body };
        if (writeConfig('auth.json', updatedAuth)) {
            res.json({ success: true, message: 'Cập nhật auth thành công' });
        } else {
            res.json({ success: false, message: 'Lỗi khi cập nhật auth' });
        }
    } catch (error) {
        res.json({ success: false, message: 'Lỗi server' });
    }
});

// Cập nhật settings
app.post('/update-settings', (req, res) => {
    try {
        const settings = readConfig('setting.json');
        const data = req.body;
        
        // Cập nhật các trường settings
        settings.likeRecommendUser = data.likeRecommendUser === 'true' || data.likeRecommendUser === 'on';
        settings.sendMessageToMatchedUser = data.sendMessageToMatchedUser === 'true' || data.sendMessageToMatchedUser === 'on';
        settings.message = data.message.split('\n').filter(msg => msg.trim());
        settings.location = {
            lat: parseFloat(data.lat),
            long: parseFloat(data.long)
        };
        settings.unMatch = {
            distance: parseInt(data.distance),
            gender: data.gender
        };

        if (writeConfig('setting.json', settings)) {
            res.json({ success: true, message: 'Cập nhật cài đặt thành công' });
        } else {
            res.json({ success: false, message: 'Lỗi khi cập nhật cài đặt' });
        }
    } catch (error) {
        console.error('Lỗi cập nhật settings:', error);
        res.json({ success: false, message: 'Lỗi server' });
    }
});

// API Tinder
app.post('/api/login', async (req, res) => {
    try {
        const auth = readConfig('auth.json');
        const response = await axios({
            method: 'post',
            url: 'https://api.gotinder.com/v3/auth/login?locale=vi',
            headers: {
                'authority': 'api.gotinder.com',
                'accept': 'application/json',
                'content-type': 'application/x-google-protobuf',
                'x-auth-token': auth['x-auth-token'],
                'persistent-device-id': auth['persistent-device-id'],
                'user-session-id': auth['user-session-id'],
                'app-session-id': auth['app-session-id']
            },
            data: `R_\n]${auth.login_token}`
        });

        const removeBefore = response.data.split("]");
        const removeAfter = removeBefore[1].split(`*\x05`);
        const token = removeAfter[0].split(`\x12$`);
        const ParseData = removeAfter[0].split('\x12$');
        const data = ParseData[1].split('"\x18');

        const updatedAuth = {
            ...auth,
            "login_token": token[0],
            "meID": data[1],
            "x-auth-token": data[0]
        };

        if (writeConfig('auth.json', updatedAuth)) {
            res.json({ success: true, message: 'Đăng nhập thành công' });
        } else {
            res.json({ success: false, message: 'Lỗi khi cập nhật auth' });
        }
    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        res.json({ success: false, message: 'Lỗi server' });
    }
});

app.post('/api/update-location', async (req, res) => {
    try {
        const auth = readConfig('auth.json');
        const { lat, long } = req.body;

        const response = await axios({
            method: 'post',
            url: 'https://api.gotinder.com/v2/meta?locale=vi',
            headers: {
                'authority': 'api.gotinder.com',
                'accept': 'application/json',
                'content-type': 'application/json',
                'x-auth-token': auth['x-auth-token']
            },
            data: {
                lat,
                long,
                force_fetch_resources: true
            }
        });

        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('Lỗi cập nhật vị trí:', error);
        res.json({ success: false, message: 'Lỗi server' });
    }
});

app.get('/api/recommendations', async (req, res) => {
    try {
        const auth = readConfig('auth.json');
        const response = await axios({
            method: 'get',
            url: `https://api.gotinder.com/v2/recs/core?locale=vi`,
            headers: {
                'authority': 'api.gotinder.com',
                'accept': 'application/json',
                'x-auth-token': auth['x-auth-token']
            }
        });

        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('Lỗi lấy recommendations:', error);
        res.json({ success: false, message: 'Lỗi server' });
    }
});

app.post('/api/like', async (req, res) => {
    try {
        const auth = readConfig('auth.json');
        const { userId, sNumber } = req.body;

        const response = await axios({
            method: 'get',
            url: `https://api.gotinder.com/like/${userId}?locale=vi&s_number=${sNumber}`,
            headers: {
                'authority': 'api.gotinder.com',
                'accept': 'application/json',
                'x-auth-token': auth['x-auth-token']
            }
        });

        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('Lỗi like:', error);
        res.json({ success: false, message: 'Lỗi server' });
    }
});

app.get('/api/messages', async (req, res) => {
    try {
        const auth = readConfig('auth.json');
        const { limit = 60, page_token = null } = req.query;
        // Gọi API lấy danh sách conversations/messages
        const response = await axios({
            method: 'get',
            url: `https://api.gotinder.com/v2/matches?locale=vi&count=${limit}&message=1&is_tinder_u=false${page_token ? `&page_token=${page_token}` : ''}`,
            headers: {
                'accept': 'application/json',
                'accept-language': 'vi,vi-VN,en-US,en,zh-CN',
                'app-session-id': auth['app-session-id'],
                'app-session-time-elapsed': auth['app-session-time-elapsed'],
                'app-version': '1062000',
                'cache-control': 'no-cache',
                'dnt': '1',
                'origin': 'https://tinder.com',
                'persistent-device-id': auth['persistent-device-id'],
                'platform': 'web',
                'pragma': 'no-cache',
                'priority': 'u=1, i',
                'referer': 'https://tinder.com/',
                'sec-ch-ua': '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                'support-short-video': '1',
                'tinder-version': '6.20.0',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
                'user-session-id': auth['user-session-id'],
                'user-session-time-elapsed': auth['user-session-time-elapsed'],
                'x-auth-token': auth['x-auth-token'],
                'x-supported-image-formats': 'webp,jpeg'
            }
        });
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('Lỗi lấy messages:', error);
        res.json({ success: false, message: 'Lỗi server' });
    }
});

app.post('/api/send-message', async (req, res) => {
    try {
        const auth = readConfig('auth.json');
        const { matchId, message } = req.body;

        const response = await axios({
            method: 'post',
            url: `https://api.gotinder.com/user/matches/${matchId}?locale=vi`,
            headers: {
                'authority': 'api.gotinder.com',
                'accept': 'application/json',
                'content-type': 'application/json',
                'x-auth-token': auth['x-auth-token']
            },
            data: {
                message
            }
        });

        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('Lỗi gửi tin nhắn:', error);
        res.json({ success: false, message: 'Lỗi server' });
    }
});

app.post('/api/unmatch', async (req, res) => {
    try {
        const auth = readConfig('auth.json');
        const { matchId } = req.body;

        const response = await axios({
            method: 'delete',
            url: `https://api.gotinder.com/user/matches/${matchId}?locale=vi`,
            headers: {
                'authority': 'api.gotinder.com',
                'accept': 'application/json',
                'x-auth-token': auth['x-auth-token']
            }
        });

        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('Lỗi unmatch:', error);
        res.json({ success: false, message: 'Lỗi server' });
    }
});

// API dislike user
app.post('/api/dislike', async (req, res) => {
    try {
        const auth = readConfig('auth.json');
        const userId = req.body.userId;
        if (!userId) return res.json({ success: false, message: 'Thiếu userId' });
        const response = await axios({
            method: 'post',
            url: `https://api.gotinder.com/pass/${userId}?locale=vi`,
            headers: {
                'accept': 'application/json',
                'accept-language': 'vi,vi-VN,en-US,en,zh-CN',
                'app-session-id': auth['app-session-id'],
                'app-session-time-elapsed': auth['app-session-time-elapsed'],
                'app-version': '1062100',
                'cache-control': 'no-cache',
                'dnt': '1',
                'origin': 'https://tinder.com',
                'persistent-device-id': auth['persistent-device-id'],
                'platform': 'web',
                'pragma': 'no-cache',
                'priority': 'u=1, i',
                'referer': 'https://tinder.com/',
                'sec-ch-ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                'tinder-version': '6.21.0',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
                'user-session-id': auth['user-session-id'],
                'user-session-time-elapsed': auth['user-session-time-elapsed'],
                'x-auth-token': auth['x-auth-token'],
                'x-supported-image-formats': 'webp,jpeg'
            }
        });
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('Lỗi dislike:', error?.response?.data || error.message);
        res.json({ success: false, message: 'Lỗi khi dislike', error: error?.response?.data || error.message });
    }
});

// Biến toàn cục để theo dõi trạng thái
let isAutoRunning = false;
let autoLikeInterval = null;
let autoMessageInterval = null;

// Thêm biến lưu socket client
let lastSocket = null;

// API endpoint để bắt đầu tự động
app.post('/api/start', async (req, res) => {
  try {
    if (isAutoRunning) {
      return res.json({ success: false, message: 'Đã chạy tự động' });
    }

    const settings = readConfig('setting.json');
    const auth = readConfig('auth.json');

    if (!auth['x-auth-token']) {
      return res.json({ success: false, message: 'Vui lòng cập nhật thông tin xác thực' });
    }

    // Gọi API cập nhật vị trí trước khi auto
    try {
        await axios({
            method: 'post',
            url: 'https://api.gotinder.com/v2/meta?locale=vi',
            headers: {
                'authority': 'api.gotinder.com',
                'accept': 'application/json',
                'content-type': 'application/json',
                'x-auth-token': auth['x-auth-token']
            },
            data: {
                lat: settings.location.lat,
                long: settings.location.long,
                force_fetch_resources: true
            }
        });
    } catch (err) {
        return res.json({ success: false, message: 'Lỗi cập nhật vị trí: ' + (err?.response?.data?.message || err.message) });
    }

    // Kiểm tra token và rate limit trước khi bắt đầu auto
    try {
      const testRes = await axios({
        method: 'get',
        url: `https://api.gotinder.com/v2/recs/core?locale=vi`,
        headers: {
          'authority': 'api.gotinder.com',
          'accept': 'application/json',
          'x-auth-token': auth['x-auth-token']
        }
      });
      // Nếu thành công, tiếp tục
    } catch (error) {
      if (error.response && error.response.status === 401) {
        return res.json({ success: false, message: 'Token hết hạn, vui lòng đăng nhập lại!' });
      } else if (error.response && error.response.status === 429) {
        return res.json({ success: false, message: 'Bạn đã quẹt/quét quá nhanh, hãy thử lại sau vài phút!' });
      } else if (error.response && error.response.data && error.response.data.error && error.response.data.error.message === 'RATE_LIMITED') {
        return res.json({ success: false, message: 'Bạn đã quẹt/quét quá nhanh, hãy thử lại sau vài phút!' });
      } else if (error.response && error.response.data && typeof error.response.data === 'string' && error.response.data.toLowerCase().includes('token')) {
        return res.json({ success: false, message: 'Token hết hạn, vui lòng đăng nhập lại!' });
      } else {
        return res.json({ success: false, message: 'Lỗi API: ' + error.message });
      }
    }

    isAutoRunning = true;

    // Bắt đầu tự động like
    if (settings.likeRecommendUser) {
      autoLikeInterval = setInterval(async () => {
        if (!isAutoRunning) {
          clearInterval(autoLikeInterval);
          return;
        }
        try {
          const response = await axios({
            method: 'get',
            url: `https://api.gotinder.com/v2/recs/core?locale=vi`,
            headers: {
              'authority': 'api.gotinder.com',
              'accept': 'application/json',
              'x-auth-token': auth['x-auth-token']
            }
          });
          if (response.data && response.data.data && response.data.data.results) {
            for (const user of response.data.data.results) {
              if (!isAutoRunning) break;
              try {
                await axios({
                  method: 'get',
                  url: `https://api.gotinder.com/like/${user.user._id}?locale=vi&s_number=${user.s_number}`,
                  headers: {
                    'authority': 'api.gotinder.com',
                    'accept': 'application/json',
                    'x-auth-token': auth['x-auth-token']
                  }
                });
                console.log(`Đã quẹt like: ${user.user.name} (${user.user._id})`);
                await new Promise(resolve => setTimeout(resolve, 2000));
              } catch (error) {
                console.error(`Lỗi khi like ${user.user.name}:`, error.message);
              }
            }
          }
        } catch (error) {
          console.error('Lỗi khi lấy recommendations:', error.message);
          if (lastSocket) {
            if (error.response && error.response.status === 401) {
              lastSocket.emit('server-error', { message: 'Token hết hạn, vui lòng đăng nhập lại!' });
            } else if (error.response && error.response.status === 429) {
              lastSocket.emit('server-error', { message: 'Bạn đã quẹt/quét quá nhanh, hãy thử lại sau vài phút!' });
            } else if (error.response && error.response.data && error.response.data.error && error.response.data.error.message === 'RATE_LIMITED') {
              lastSocket.emit('server-error', { message: 'Bạn đã quẹt/quét quá nhanh, hãy thử lại sau vài phút!' });
            } else if (error.response && error.response.data && typeof error.response.data === 'string' && error.response.data.toLowerCase().includes('token')) {
              lastSocket.emit('server-error', { message: 'Token hết hạn, vui lòng đăng nhập lại!' });
            } else {
              lastSocket.emit('server-error', { message: 'Lỗi API: ' + error.message });
            }
          }
        }
      }, 5000);
    }

    // Bắt đầu tự động gửi tin nhắn
    if (settings.sendMessageToMatchedUser) {
      autoMessageInterval = setInterval(async () => {
        if (!isAutoRunning) {
          clearInterval(autoMessageInterval);
          return;
        }
        try {
          const response = await axios({
            method: 'get',
            url: `https://api.gotinder.com/v2/matches?locale=vi&count=60&message=0&is_tinder_u=false`,
            headers: {
              'authority': 'api.gotinder.com',
              'accept': 'application/json',
              'x-auth-token': auth['x-auth-token']
            }
          });
          if (response.data && response.data.data && response.data.data.matches) {
            for (const match of response.data.data.matches) {
              if (!isAutoRunning) break;
              try {
                const randomMessage = settings.message[Math.floor(Math.random() * settings.message.length)];
                const message = randomMessage.replace('{{name}}', match.person.name);
                await axios({
                  method: 'post',
                  url: `https://api.gotinder.com/user/matches/${match._id}?locale=vi`,
                  headers: {
                    'authority': 'api.gotinder.com',
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'x-auth-token': auth['x-auth-token']
                  },
                  data: { message }
                });
                console.log(`Đã gửi tin nhắn cho: ${match.person.name} (${match.person._id}) - Nội dung: ${message}`);
                await new Promise(resolve => setTimeout(resolve, 3000));
              } catch (error) {
                console.error(`Lỗi khi gửi tin nhắn cho ${match.person.name}:`, error.message);
              }
            }
          }
        } catch (error) {
          console.error('Lỗi khi lấy matches:', error.message);
          if (lastSocket) {
            if (error.response && error.response.status === 401) {
              lastSocket.emit('server-error', { message: 'Token hết hạn, vui lòng đăng nhập lại!' });
            } else if (error.response && error.response.status === 429) {
              lastSocket.emit('server-error', { message: 'Bạn đã quẹt/quét quá nhanh, hãy thử lại sau vài phút!' });
            } else if (error.response && error.response.data && error.response.data.error && error.response.data.error.message === 'RATE_LIMITED') {
              lastSocket.emit('server-error', { message: 'Bạn đã quẹt/quét quá nhanh, hãy thử lại sau vài phút!' });
            } else if (error.response && error.response.data && typeof error.response.data === 'string' && error.response.data.toLowerCase().includes('token')) {
              lastSocket.emit('server-error', { message: 'Token hết hạn, vui lòng đăng nhập lại!' });
            } else {
              lastSocket.emit('server-error', { message: 'Lỗi API: ' + error.message });
            }
          }
        }
      }, 10000);
    }

    res.json({ success: true, message: 'Đã bắt đầu tự động like và gửi tin nhắn' });
  } catch (error) {
    console.error('Lỗi khi bắt đầu tự động:', error);
    res.json({ success: false, message: 'Lỗi khi bắt đầu tự động: ' + error.message });
  }
});

// API endpoint để dừng tự động
app.post('/api/stop', (req, res) => {
  try {
    if (!isAutoRunning) {
      return res.json({ success: false, message: 'Chưa chạy tự động' });
    }

    // Đặt trạng thái về false trước
    isAutoRunning = false;

    // Dừng các interval
    if (autoLikeInterval) {
      clearInterval(autoLikeInterval);
      autoLikeInterval = null;
    }
    if (autoMessageInterval) {
      clearInterval(autoMessageInterval);
      autoMessageInterval = null;
    }

    console.log('Đã dừng tất cả các quá trình tự động');
    res.json({ success: true, message: 'Đã dừng tự động like và gửi tin nhắn' });
  } catch (error) {
    console.error('Lỗi khi dừng tự động:', error);
    res.json({ success: false, message: 'Lỗi khi dừng tự động: ' + error.message });
  }
});

const sendRealtimeData = async (socket) => {
  try {
      const auth = readConfig('auth.json');
      const settings = readConfig('setting.json');
      
      // Lấy recommendations
      const recommendationsResponse = await axios({
          method: 'get',
          url: `https://api.gotinder.com/v2/recs/core?locale=vi`,
          headers: {
              'authority': 'api.gotinder.com',
              'accept': 'application/json',
              'x-auth-token': auth['x-auth-token']
          }
      });

      // Lấy matches
      const matchesResponse = await axios({
          method: 'get',
          url: `https://api.gotinder.com/v2/matches?locale=vi&count=60&message=0&is_tinder_u=false`,
          headers: {
              'authority': 'api.gotinder.com',
              'accept': 'application/json',
              'x-auth-token': auth['x-auth-token']
          }
      });

      socket.emit('realtime-update', {
          recommendations: recommendationsResponse.data,
          matches: matchesResponse.data,
          settings
      });
  } catch (error) {
      console.error('Lỗi gửi dữ liệu realtime:', error);
  }
};

// Socket.IO
io.on('connection', (socket) => {
    lastSocket = socket;
    console.log('Client connected');
    
    // Gửi dữ liệu ngay khi kết nối
    sendRealtimeData(socket);

    // // Gửi dữ liệu mỗi 5 giây
    // const interval = setInterval(sendRealtimeData, 5000);

    socket.on('refresh-realtime-data', () => {
      sendRealtimeData(socket);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        // clearInterval(interval);
    });
});

app.get('/api/matches', async (req, res) => {
    try {
        const auth = readConfig('auth.json');
        const { limit = 60, page_token = null } = req.query;
        const response = await axios({
            method: 'get',
            url: `https://api.gotinder.com/v2/matches?locale=vi&count=${limit}&message=0&is_tinder_u=false${page_token ? `&page_token=${page_token}` : ''}`,
            headers: {
                'accept': 'application/json',
                'accept-language': 'vi,vi-VN,en-US,en,zh-CN',
                'app-session-id': auth['app-session-id'],
                'app-session-time-elapsed': auth['app-session-time-elapsed'],
                'app-version': '1062000',
                'cache-control': 'no-cache',
                'dnt': '1',
                'origin': 'https://tinder.com',
                'persistent-device-id': auth['persistent-device-id'],
                'platform': 'web',
                'pragma': 'no-cache',
                'priority': 'u=1, i',
                'referer': 'https://tinder.com/',
                'sec-ch-ua': '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                'support-short-video': '1',
                'tinder-version': '6.20.0',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
                'user-session-id': auth['user-session-id'],
                'user-session-time-elapsed': auth['user-session-time-elapsed'],
                'x-auth-token': auth['x-auth-token'],
                'x-supported-image-formats': 'webp,jpeg'
            }
        });
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('Lỗi lấy matches:', error);
        res.json({ success: false, message: 'Lỗi server' });
    }
});

// setInterval(() => {
//   console.log("isAutoRunning: ", isAutoRunning);
// }, 1000);


httpServer.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
}); 