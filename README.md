# 🌲 時鐘森林大冒險 (Forest Clock Adventure)

專為國小學童與幼童打造的可愛森林動物主題時鐘學習與時間解謎遊戲！提供精準指針連動時鐘、階梯式單選題、倒數秒針滴答聲（Tick-Tock）、原生中文語音朗讀、手機/平板響應式設計與榮譽勳章館。

---

## 🚀 如何同步到 GitHub 並直接在 GitHub 上查看網頁？

本專案已內建完整的 **GitHub Pages 自動化部署工作流（GitHub Actions）** 與 **相對路徑配置（`base: './'`）**，無需額外手動打包，推送後即刻自動上線！

### 步驟 1：匯出或推送到 GitHub

#### 方式 A：透過 Google AI Studio 一鍵匯出（最快）
1. 點擊 AI Studio 介面右上角的 **「Export to GitHub」** 或 **「Sync to GitHub」** 按鈕。
2. 授權並選擇您想要建立的 GitHub 儲存庫（Repository）名稱。
3. 系統將自動把所有程式碼同步至該 GitHub Repo。

#### 方式 B：透過 Git 指令推送
```bash
git init
git add .
git commit -m "feat: 初版發布時鐘森林大冒險"
git branch -M main
git remote add origin https://github.com/<您的使用者名稱>/<您的儲存庫名稱>.git
git push -u origin main
```

---

### 步驟 2：在 GitHub 開啟 GitHub Pages（只需點一次）

1. 打開您的 GitHub 儲存庫頁面。
2. 點擊頂部的 **「Settings」**（設定）標籤。
3. 在左側選單點擊 **「Pages」**。
4. 在 **Build and deployment** 區塊：
   - 將 **Source** 下拉選單改選為：**`GitHub Actions`**。
5. 切換到儲存庫的 **「Actions」** 標籤，您會看到名為 **`Deploy to GitHub Pages`** 的自動化任務正在執行。
6. 完成後（約 1 分鐘），頁面頂部會直接顯示您的公開線上網址：
   > 🌐 `https://<您的使用者名稱>.github.io/<您的儲存庫名稱>/`

點開該網址，就能直接在瀏覽器、手機和平板上流暢遊玩！

---

## 🎮 核心功能特色

- **擬真齒輪連動時鐘**：時針依分針進度平滑前進，徹底解惑小學生「幾點幾分」的時針位置判定。
- **5 大難度階梯**：
  1. 整點與半點入門
  2. 一刻鐘（15分）與 45 分
  3. 5 的倍數分鐘大跨步
  4. 精準到每一分鐘神探
  5. 小學經過時間應用題挑戰
- **倒數計時與秒針滴答聲**：每秒伴隨機械鐘擺雙音律動（Tick-Tock），營造沉浸式專注節奏。
- **中文語音朗讀**：調用原生 Web Speech API 朗讀標準時間與解題秘笈。
- **全裝置響應式支援**：支援電腦滑鼠撥鐘與手機/平板觸控，配備手機專屬拇指導覽列。
- **榮譽勳章館**：9 款成就勳章與連擊星光特效，激發孩子自主學習興趣。

---

## 💻 本地端開發 (Local Development)

```bash
# 1. 安裝套件依賴
npm install

# 2. 啟動本地開發伺服器
npm run dev

# 3. 打包發布版本
npm run build
```
