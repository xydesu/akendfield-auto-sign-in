# Attendance API 文件

## 1. API 總覽

以下是識別出的 API 端點：

| 用途 | 方法 | URL 路徑 | 參數 (Payload/Query) |
| :--- | :--- | :--- | :--- |
| **獲取簽到資訊** | GET | `/web/v1/game/endfield/attendance` | `gameId: "3"` |
| **執行簽到** | POST | `/web/v1/game/endfield/attendance` | `gameId: "3"` |
| **獲取簽到記錄** | GET | `/web/v1/game/endfield/attendance/record` | `gameId: "3"` |
| **推薦內容** | GET | `/api/v1/game/attendance/rec` | `gameId: "3"` |
| **推薦用戶** | GET | `/api/v1/game/attendance/rec/users` | `gameId: "3"` |
| **Banner 列表** | GET | `/api/v1/game/attendance/bulletins/list` | `gameId: "3"` |
| **皮膚資訊** | GET | `/api/v1/game/attendance/skin` | `gameId: "3"` |
| **關係變更(關注)**| POST | `/api/v1/relation/change` | `{ kind: 1, userId: ... }` |

> **備註**: `gameId: "3"` 顯示終末地 (Endfield) 的遊戲 ID 可能固定為 3。

## 2. 詳細分析

### 2.1 簽到核心功能 (Check-In)
- **獲取狀態**:
  - GET `/web/v1/game/endfield/attendance`
  - 返回數據包含 `hasToday` (今日是否已簽到) 以及簽到進度資訊 `first` (可能是首周或初次簽到獎勵)。

- **執行簽到**:
  - POST `/web/v1/game/endfield/attendance`
  - 成功後會返回簽到獎勵數據。

### 2.2 記錄與歷史 (History)
- **簽到記錄**:
  - GET `/web/v1/game/endfield/attendance/record`
  - 返回數據包含 `records` 數組和 `resourceInfoMap` (資源詳情)。

### 2.3 推薦系統 (Recommendation)
- **推薦內容與用戶**:
  - 分別調用 `/api/v1/game/attendance/rec` 和 `/rec/users`。
  - 這些接口位於 `/api/v1` 下，不同於簽到的 `/web/v1`，可能屬於通用遊戲服務。

## 3. 數據結構

返回的數據結構包含：

- **簽到獎勵**: 包含物品 ID、數量等資訊。
- **簽到頁面資訊**: 包含簽到狀態、活動時間等。
- **歷史記錄**: 包含過去的簽到日期和領取狀態。
- **推薦用戶**: 包含推薦關注的用戶列表。
- **Banner**: 包含輪播圖活動連結。
