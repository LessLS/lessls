@echo off
REM LessLS Windows 安裝腳本
echo ========================================
echo   LessLS 安裝腳本
echo ========================================
echo.

REM 檢查 Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [錯誤] 未偵測到 Node.js，請先安裝 Node.js 18+
    echo 前往 https://nodejs.org 下載
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js: %NODE_VERSION%
echo.

echo 正在安裝 @lessls/lessls ...
call npm install -g @lessls/lessls

echo.
echo ========================================
echo   安裝完成！
echo   執行 ls help 開始使用
echo ========================================
pause
