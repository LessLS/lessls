# LessLS

輕量級命令列工具平台，讓包管理、登入、發布、更新變得簡單直覺。

```powershell
# 安裝
ls install @lessls/lessls

# 登入（支援 GitHub / 授權碼 / Token）
ls login
ls login ABCD1234
ls login user:token

# 發布
ls release

# 更新
ls update
ls update github

# 從 GitHub 安裝
ls install github lessls/lessls
```

## 快速開始

### 方法一：使用 EXE（推薦，無需安裝 Node.js）

```powershell
# 下載 lessls.exe 到任意位置
.\lessls.exe help
.\lessls.exe login
.\lessls.exe install typescript
```

### 方法二：npm 全域安裝

```bash
npm install -g @lessls/lessls
```

### 方法三：從 source 編譯

```bash
git clone https://github.com/LessLS/lessls
cd lessls
npm install
npm run cli:build
```

## 完整指令列表

| 指令 | 說明 | 範例 |
|------|------|------|
| `ls help` | 顯示協助訊息 | `ls help` |
| `ls install <pkg>` | 安裝套件（LessLS/npm） | `ls install @lessls/lessls` |
| `ls install github <repo>` | 從 GitHub 倉庫安裝 | `ls install github lessls/lessls` |
| `ls login` | 登入 LessLS（顯示授權碼） | `ls login` |
| `ls login <code>` | 使用授權碼快速登入 | `ls login ABCD1234` |
| `ls login <user:token>` | 直接使用 Token 登入 | `ls login user:token` |
| `ls release` | 發布當前專案到 LessLS Registry | `ls release --tag latest` |
| `ls update` | 從 LessLS Registry 更新 | `ls update` |
| `ls update github` | 從 GitHub releases 更新 | `ls update github` |
| `ls search <kw>` | 搜尋套件 | `ls search http` |
| `ls list` | 列出已安裝套件 | `ls list` |
| `ls status` | 顯示 LessLS 狀態 | `ls status` |
| `ls --version` | 顯示版本 | `ls --version` |

## 登入方式

### GitHub OAuth 登入
```powershell
ls login
# 會顯示授權碼，前往網站完成 GitHub 授權
```

### 授權碼登入
```powershell
ls login
# 取得授權碼後，在終端機執行：
ls login ABCD1234
```

### Token 登入
```powershell
ls login user:your-auth-token
```

## 套件來源

| 來源 | 說明 | 安裝方式 |
|------|------|------|
| LessLS Registry | 官方套件庫 | `ls install <pkg>` |
| npm | npm 相容模式 | `ls install <pkg> --registry npm` |
| GitHub | 直接從倉庫安裝 | `ls install github <owner>/<repo>` |

## 官方網站

https://lessls.org

## 開發

```bash
cd packages/cli
npm run build       # 編譯
npm run pkg         # 打包 EXE
```

## License

MIT
