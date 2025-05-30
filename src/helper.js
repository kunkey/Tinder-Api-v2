const fs = require('fs');

let savePersonData = function (file, content) {
    try {
        if (!fs.existsSync(process.cwd() + '/data/person/' + file)) {
            fs.writeFileSync(process.cwd() + '/data/person/' + file, String(content), function (err) {
                if (err) console.log(err);
            });
        }
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

let saveContentData = function (file, content, mode) {
    try {
        if (mode == "a") {
            fs.appendFileSync(process.cwd() + '/data/' + file, String(content) + "\n", function (err) { });
        } else if (mode == "w") {
            fs.writeFileSync(process.cwd() + '/data/' + file, String(content), function (err) { });
        }
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

let saveUserData = function (content) {
    try {
        fs.appendFileSync(process.cwd() + '/data/user_data.log', String(content) + "\n", function (err) { });
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

let getDataContentFile = function (file) {
    try {
        let text = fs.readFileSync(process.cwd() + '/data/' + file, 'utf8');
        return text;
    } catch (e) {
        console.log(e.message);
        return null;
    }
}

let getDataContent = function () {
    try {
        let text = fs.readFileSync(process.cwd() + '/data/user_data.log', 'utf8');
        return text;
    } catch (e) {
        console.log(e.message);
        return null;
    }
}

let saveJsonUserData = function (content) {
    try {
        fs.writeFileSync(process.cwd() + '/data/user_data.json', JSON.stringify(content), function (err) { });
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

let getConfig = function (config) {
    let text = fs.readFileSync(process.cwd() + '/config/' + config + '.json', 'utf8');
    try {
        text = JSON.parse(text);
        return text;
    } catch (e) {
        return null;
    }
}

let setConfig = function (config, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(process.cwd() + '/config/' + config + '.json', JSON.stringify(data), function (err) {
            if (err) reject(false);
            resolve(true);
        });
    });
}

let getMsgDataConfig = function (messageList, name) {
    const randomMess = messageList[Math.floor(Math.random() * messageList.length)];
    const newMessage = randomMess.replace('{{name}}', name);
    return newMessage;
}

let shuffleArrObj = (array) => {
    let i = array.length;
    while (i > 0) {
      const ri = Math.floor(Math.random() * i);
      i--;
      [array[i], array[ri]] = [array[ri], array[i]];
    }
    return array;
  }

module.exports = {
    savePersonData,
    saveContentData,
    saveUserData,
    getDataContent,
    getDataContentFile,
    saveJsonUserData,
    getConfig,
    setConfig,
    getMsgDataConfig,
    shuffleArrObj
}