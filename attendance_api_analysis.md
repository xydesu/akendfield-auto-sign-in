# Attendance 相關 API 分析報告

根據提供的三個 JS 檔案 (`4046.7fed78ef.js`, `8672.fe80a180.js`, `9779.167cd594.js`) 的內容分析，整理出以下與 Attendance (簽到) 相關的 API 資訊。

## 1. API 總覽

主要邏輯位於 `8672` (定義) 和 `4046/9779` (調用) 中。以下是識別出的 API 端點：

| 用途 | 方法 (`func`) | URL 路徑 | 參數 (Payload/Query) | 相關函數 |
| :--- | :--- | :--- | :--- | :--- |
| **獲取簽到資訊** | GET (`Gp`) | `/web/v1/game/endfield/attendance` | (推測) `gameId: "3"` | `getCheckInInfo` |
| **執行簽到** | POST (`Hp`) | `/web/v1/game/endfield/attendance` | (推測) `gameId: "3"` | `checkIn` |
| **獲取簽到記錄** | GET (`Gp`) | `/web/v1/game/endfield/attendance/record` | (推測) `gameId: "3"` | `getAttendanceRecord` |
| **推薦內容** | GET (`Gp`) | `/api/v1/game/attendance/rec` | `gameId: "3"` | `getAttendanceRecContent` |
| **推薦用戶** | GET (`Gp`) | `/api/v1/game/attendance/rec/users` | `gameId: "3"` | `getRecUser` |
| **Banner 列表** | GET (`Gp`?) | `/api/v1/game/attendance/bulletins/list` | `gameId: "3"` | `getBanner` |
| **皮膚資訊** | GET | `/api/v1/game/attendance/skin` | `gameId: "3"` | - |
| **關係變更(關注)**| POST (`Hp`) | `/api/v1/relation/change` | `{ kind: 1, userId: ... }` | `followUser` |

> **備註**: `Gp` 對應 GET 請求，`Hp` 對應 POST 請求。代碼中多次出現 `{gameId: "3"}`，顯示終末地 (Endfield) 的遊戲 ID 可能固定為 3。

## 2. 詳細分析

### 2.1 簽到核心功能 (Check-In)
- **獲取狀態 (`getCheckInInfo`)**:
  - 調用 `/web/v1/game/endfield/attendance` (GET)。
  - 返回數據包含 `hasToday` (今日是否已簽到) 以及簽到進度資訊 `first` (可能是首周或初次簽到獎勵)。
  - 使用 `infoSchema` (Zod) 進行驗證。

- **執行簽到 (`checkIn`)**:
  - 調用 `/web/v1/game/endfield/attendance` (POST)。
  - 成功後會觸發 `getCheckInInfo` 和 `getAttendanceRecord` 刷新數據。
  - 使用 `AttendanceAwardSchema` 驗證返回的獎勵數據。

### 2.2 記錄與歷史 (History)
- **簽到記錄 (`getAttendanceRecord`)**:
  - 調用 `/web/v1/game/endfield/attendance/record` (GET)。
  - 返回數據包含 `records` 數組和 `resourceInfoMap` (資源詳情)。
  - 對應代碼中的 `RecordSchema`。

### 2.3 推薦系統 (Recommendation)
- **推薦內容與用戶**:
  - 分別調用 `/api/v1/game/attendance/rec` 和 `/rec/users`。
  - 這些接口位於 `/api/v1` 下，不同於簽到的 `/web/v1`，可能屬於通用遊戲服務。
  - 返回 `RecUserSchema` 和相關內容結構。

## 3. 數據結構 (Schema)

在 `8672.fe80a180.js` 中發現了使用 Zod 定義的數據校驗 Schema，這有助於理解返回數據的結構：

- `AttendanceAwardSchema`: 簽到獎勵結構。
- `InfoSchema`: 簽到頁面基本資訊。
- `RecordSchema`: 歷史記錄。
- `RecUserSchema`: 推薦用戶資訊。
- `BannerSchema`: 輪播圖資訊。
