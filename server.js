const express = require('express');
const path = require('path');
const app = express();
// Railway 會自動提供 PORT 環境變數，如果沒有則使用 3000
const port = process.env.PORT || 3000;

// 將當前目錄設定為靜態檔案目錄 (這樣就可以讀取 index.html)
app.use(express.static(__dirname));

// 定義首頁路由
app.get('/', (req, res) => {
  // 發送 index.html 檔案
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});