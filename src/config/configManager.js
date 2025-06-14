const fs = require('fs');
const path = require('path');

function readConfig(filename) {
    const filePath = path.join(__dirname, '..', filename);
    if (!fs.existsSync(filePath)) return {};
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
}

module.exports = { readConfig }; 