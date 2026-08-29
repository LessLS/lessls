#!/bin/bash
# LessLS 安裝腳本（Mac/Linux）
set -e

echo "=== LessLS 安裝腳本 ==="
echo ""

# 檢查 Node.js
if ! command -v node &> /dev/null; then
  echo "❌ 需要先安裝 Node.js (>=18)"
  echo "   前往 https://nodejs.org 下載"
  exit 1
fi

echo "✓ Node.js: $(node --version)"

# 全域安裝
echo ""
echo "正在安裝 @lessls/lessls ..."
npm install -g @lessls/lessls

echo ""
echo "✓ 安裝完成！"
echo "  執行 ls help 開始使用"
