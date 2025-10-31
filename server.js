const express = require('express');
const app = express();

// 關鍵修正：確保使用 Railway 提供的動態 PORT 環境變數
const port = process.env.PORT || 3000; 

// 1. 設定 Express 服務靜態檔案
//    這會讓您的網頁可以存取 index.html, style.css, main.js, 以及 images 資料夾內的所有檔案
app.use(express.static(__dirname));

// 2. 設定根目錄路由 (當使用者訪問網站根目錄時)
app.get('/', (req, res) => {
    // 傳送 index.html 檔案
    res.sendFile(__dirname + '/index.html');
});

// 3. 讓伺服器監聽動態埠號
app.listen(port, () => {
    // 部署時，Railway 的日誌會顯示這個訊息，確認服務已啟動
    console.log(`Server running on port ${port}`);
});