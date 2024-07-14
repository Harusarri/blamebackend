const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 미들웨어 추가
app.use(cors());

// JSON 파싱을 위한 미들웨어 추가
app.use(bodyParser.json());

// 클릭 정보를 기록할 파일
const clickDataFile = path.join(__dirname, 'clickData.json');

// 클릭 데이터 초기화 (최초 실행 시)
if (!fs.existsSync(clickDataFile)) {
    fs.writeFileSync(clickDataFile, JSON.stringify({}));
}

// 클릭 횟수 기록 API
app.post('/api/click', (req, res) => {
    const { ip, clicks, username } = req.body;

    if (!ip || !clicks) {
        return res.status(400).json({ error: 'Invalid request. IP and clicks are required.' });
    }

    // 기존 클릭 데이터 불러오기
    let clickData = JSON.parse(fs.readFileSync(clickDataFile, 'utf8'));

    // 해당 IP의 클릭 수 업데이트
    if (!clickData[ip]) {
        clickData[ip] = { clicks: 0, username: '' };
    }
    clickData[ip].clicks += clicks;

    if (username) {
        clickData[ip].username = username;
    }

    // 클릭 데이터 파일에 저장
    fs.writeFileSync(clickDataFile, JSON.stringify(clickData, null, 2));

    res.json({ success: true });
});

// 리더보드 데이터 제공 API
app.get('/api/leaderboard', (req, res) => {
    const clickData = JSON.parse(fs.readFileSync(clickDataFile, 'utf8'));
    res.json(clickData);
});

// 닉네임 변경 API
app.post('/api/changeNickname', (req, res) => {
    const { oldIp, newNickname } = req.body;

    if (!oldIp || !newNickname) {
        return res.status(400).json({ error: 'Invalid request. IP and new nickname are required.' });
    }

    let clickData = JSON.parse(fs.readFileSync(clickDataFile, 'utf8'));

    if (!clickData[oldIp]) {
        return res.status(400).json({ error: 'IP not found' });
    }

    // 블랙리스트 닉네임 체크
    const blacklistedNames = ["Hisami"];
    if (blacklistedNames.includes(newNickname)) {
        return res.status(400).json({ error: "Why hisami is here? blame hisami himself?" });
    }

    clickData[oldIp].username = newNickname;

    fs.writeFileSync(clickDataFile, JSON.stringify(clickData, null, 2));

    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
