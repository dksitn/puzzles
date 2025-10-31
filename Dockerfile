# 1. 使用官方 Node.js 基礎映像
FROM node:20-slim

# 2. 設定工作目錄
WORKDIR /app

# 3. 安裝 'build-essential' 以確保 npm 執行環境完整
#    這一步是解決 `/bin/sh: 1: npm: not found` 錯誤的關鍵
RUN apt-get update && \ 
    apt-get install -y build-essential && \
    rm -rf /var/lib/apt/lists/*

# 4. 複製 package.json 和 package-lock.json (如果有)
COPY package.json ./

# 5. 安裝所有依賴
RUN npm install

# 6. 複製其他所有檔案到工作目錄
COPY . .

# 7. 服務監聽埠號
EXPOSE 3000

# 8. 啟動伺服器 (使用 package.json 中的 "start" 腳本)
CMD [ "npm", "start" ]