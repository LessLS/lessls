# LessLS — 新一代輕量級命令列工具平台

輕量級命令列工具平台，讓包管理、登入、發布、更新變得簡單直覺。

```powershell
# 安裝
lss install @lessls/lessls

# 登入（GitHub PAT）
lss login
lss login <github_pat>

# 發布
lss release

# 更新
lss update
lss update github

# 從 GitHub 安裝
lss install github lessls/lessls
```

## 快速開始

### 安裝

```powershell
# 下載 lessls.exe 到任意位置，或直接執行
.\lessls.exe help
.\lessls.exe login
.\lessls.exe install typescript
```

### 全域安裝（npm）

```bash
npm install -g @lessls/lessls
```

## 指令列表

| 指令 | 說明 | 範例 |
|------|------|------|
| `lss help` | 顯示協助訊息 | `lss help` |
| `lss install <pkg>` | 安裝套件 | `lss install @lessls/lessls` |
| `lss install github <repo>` | 從 GitHub 倉庫安裝 | `lss install github lessls/lessls` |
| `lss login` | 取得 GitHub PAT 登入指引 | `lss login` |
| `lss login <token>` | 直接使用 GitHub Token 登入 | `lss login ghp_xxxx` |
| `lss login <user>:<token>` | 指定使用者名稱 | `lss login user:token` |
| `lss release` | 發布當前專案 | `lss release --tag latest` |
| `lss update` | 從 Registry 更新 | `lss update` |
| `lss update github` | 從 GitHub releases 更新 | `lss update github` |
| `lss search <kw>` | 搜尋套件 | `lss search http` |
| `lss list` | 列出已安裝套件 | `lss list` |
| `lss status` | 顯示 LessLS 狀態 | `lss status` |

## 登入流程

```
1. lss login
   → 顯示 GitHub PAT 登入指引

2. 前往 https://github.com/settings/tokens
   → 產生 Personal Access Token
   → 勾選 repo 和 read:user 權限

3. lss login <github_pat>
   → 驗證成功，Token 儲存至 ~/.lessls/config.json
   → 登入完成 ✅
```

## 網站

- 首頁：https://ls.illusd.com/home

## 開發

```bash
cd packages/cli
npm run build       # 編譯
npm run pkg         # 打包 EXE
```

## License

MIT
