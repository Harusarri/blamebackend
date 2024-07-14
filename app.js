const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

const clickDataFile = path.join(__dirname, 'clickData.json');

if (!fs.existsSync(clickDataFile)) {
    fs.writeFileSync(clickDataFile, JSON.stringify({}));
}

app.post('/api/click', (req, res) => {
    const { ip, clicks } = req.body;
    if (!ip || clicks === undefined) {
        return res.status(400).json({ error: 'Invalid request. IP and clicks are required.' });
    }

    let clickData = JSON.parse(fs.readFileSync(clickDataFile, 'utf8'));

    let username = ip;
    for (const key in clickData) {
        if (clickData[key].ip === ip) {
            username = key;
            break;
        }
    }

    if (!clickData[username]) {
        clickData[username] = { ip, clicks: 0 };
    }

    clickData[username].clicks += 1; // 항상 1씩 증가하도록 수정

    console.log(`Updated clicks for ${username}: ${clickData[username].clicks}`);

    fs.writeFileSync(clickDataFile, JSON.stringify(clickData, null, 2));
    res.json({ success: true });
});

app.get('/api/leaderboard', (req, res) => {
    const clickData = JSON.parse(fs.readFileSync(clickDataFile, 'utf8'));
    res.json(clickData);
});

app.post('/api/changeNickname', (req, res) => {
    const { oldIp, newNickname } = req.body;
    if (!oldIp || !newNickname) {
        return res.status(400).json({ error: 'Both old IP and new nickname are required' });
    }

    const blacklistedNames = ["hisami"];
    if (blacklistedNames.includes(newNickname.toLowerCase())) {
        return res.status(400).json({ error: 'Why hisami is here? blame hisami himself?' });
    }

    let data = JSON.parse(fs.readFileSync(clickDataFile, 'utf8'));
    let oldUsername = oldIp;

    for (const key in data) {
        if (data[key].ip === oldIp) {
            oldUsername = key;
            break;
        }
    }

    if (!data[oldUsername]) {
        return res.status(404).json({ error: 'IP not found' });
    }

    if (data[newNickname]) {
        return res.status(400).json({ error: 'Nickname already used' });
    }

    data[newNickname] = data[oldUsername];
    delete data[oldUsername];
    fs.writeFileSync(clickDataFile, JSON.stringify(data, null, 2));
    res.json({ success: true });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/leaderboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'leaderboard.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
