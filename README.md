# Endfield Auto Sign-in (終末地自動簽到)

簡單的 Node.js 腳本，用於自動執行終末地每日簽到。

## 使用步驟

1. **獲取設定**:
   - 登入遊戲官網，按 **F12** 開啟 Console (控制台)。
   - 複製貼上 `scripts/get_creds.js` 的完整內容並執行。
   - 依指示操作網頁（如刷新），複製 Console 生成的 JSON 內容。
   - 在專案根目錄建立 `config.json` 並貼上內容。

2. **執行簽到**:
   - 開啟終端機執行：
     ```bash
     node src/auto_sign.js
     ```

## 檔案說明
- `scripts/get_creds.js`: 用於抓取 `cred` 與 `sk-game-role` 等必要資訊的瀏覽器腳本。
- `src/auto_sign.js`: 簽到主程式。
