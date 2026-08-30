# LessLS — 新一代輕量級命令列工具平台

輕量級命令列工具平台，讓包管理、登入、發布、更新變得簡單直覺。

```powershell
# 安裝
lss install @lessls/lessls

# 登入（GitHub OAuth 授權碼）
lss login
lss login ABCD1234

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
| `lss login` | 取得 GitHub 授權連結 | `lss login` |
| `lss login <code>` | 使用授權碼登入 | `lss login ABCD1234` |
| `lss login <user:token>` | 直接使用 Token 登入 | `lss login user:token` |
| `lss release` | 發布當前專案 | `lss release --tag latest` |
| `lss update` | 從 Registry 更新 | `lss update` |
| `lss update github` | 從 GitHub releases 更新 | `lss update github` |
| `lss search <kw>` | 搜尋套件 | `lss search http` |
| `lss list` | 列出已安裝套件 | `lss list` |
| `lss status` | 顯示 LessLS 狀態 | `lss status` |

## 登入流程

```
1. lss login
   → 顯示 GitHub 授權連結 + 授權碼

2. 瀏覽器開啟連結
   → GitHub 授權頁面

3. 授權完成
   → 跳回 https://ls.illusd.com/oauth/callback?code=XXXXX
   → 顯示授權碼，可一鍵複製

4. 回到終端機
   → lss login XXXXXX
   → 登入完成 ✅
```

## GitHub OAuth 設定

1. 前往 https://github.com/settings/developers → New OAuth App
2. 填入：
   - **Application name**: `LessLS`
   - **Homepage URL**: `https://ls.illusd.com`
   - **Authorization callback URL**: `https://ls.illusd.com/oauth/callback`
3. 取得 Client ID，填入 `.env`：
   ```
   GITHUB_OAUTH_CLIENT_ID=Iv1.xxx_your_client_id
   ```

## 環境配置

```bash
# packages/cli/.env（不要提交到 git）
GITHUB_OAUTH_CLIENT_ID=your_client_id_here
GITHUB_OAUTH_REDIRECT_URI=https://ls.illusd.com/oauth/callback
LESSLS_REGISTRY=https://registry.lessls.org
LESSLS_API_BASE=https://api.lessls.org
LESSLS_GITHUB_REPO=lessls/lessls
```

## 網站

- 首頁：https://ls.illusd.com/home
- OAuth 回跳：https://ls.illusd.com/oauth/callback

## 開發

```bash
cd packages/cli
npm run build       # 編譯
npm run pkg         # 打包 EXE
```

## License

MIT
