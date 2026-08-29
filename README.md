# LessLS

輕量級命令列工具平台，讓包管理、登入、發布、更新變得簡單直覺。

```powershell
# 安裝
ls install @lessls/lessls

# 登入
ls login

# 發布
ls release

# 更新
ls update
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
git clone https://github.com/lessls/lessls
cd lessls
npm install
npm run cli:build
```

## 完整指令列表

| 指令 | 說明 | 範例 |
|------|------|------|
| `ls help` | 顯示協助訊息 | `ls help` |
| `ls install <pkg>` | 安裝套件 | `ls install @lessls/lessls` |
| `ls login` | 登入 LessLS | `ls login user:token` |
| `ls release` | 發布專案 | `ls release --tag latest` |
| `ls update` | 更新 LessLS | `ls update` |
| `ls search <kw>` | 搜尋套件 | `ls search http` |
| `ls list` | 列出已安裝 | `ls list` |
| `ls status` | 顯示狀態 | `ls status` |
| `ls --version` | 顯示版本 | `ls --version` |

## 安裝 LessLS

### Windows（下載 EXE）

1. 下載 [lessls.exe](https://lessls.org/download/lessls.exe)
2. 放到任意位置，或直接執行

### Windows（npm 安裝）

```powershell
npm install -g @lessls/lessls
```

### macOS / Linux

```bash
npm install -g @lessls/lessls
```

## 官方網站

https://lessls.org

## 開發

```bash
cd packages/cli
npm run build       # 編譯
npm run pkg         # 打包 EXE
```
