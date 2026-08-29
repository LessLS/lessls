/**
 * @lessls/config — 集中式環境配置
 *
 * 優先順序：環境變數 > .env 檔案 > 預設值
 *
 * 可用環境變數：
 *   LESSLS_REGISTRY     LessLS Registry URL
 *   LESSLS_API_BASE     LessLS API 基址
 *   LESSLS_GITHUB_REPO  GitHub 倉庫（用於 update github）
 *   GITHUB_OAUTH_CLIENT_ID  GitHub OAuth Client ID
 */
const path = require('path');
const fs = require('fs');

// ── 載入 .env 檔案 ────────────────────────────────────────────

function loadDotEnv() {
  // .env 可能在以下位置（優先順序由高到低）
  const candidates = [
    path.join(__dirname, '..', '.env'),                    // packages/cli/.env
    path.join(__dirname, '..', '..', '.env'),              // packages/.env
    path.join(__dirname, '..', '..', '..', '.env'),         // repo root
    path.join(process.cwd(), '.env'),                      // 執行目錄
  ];
  for (const envPath of candidates) {
    if (!fs.existsSync(envPath)) continue;
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = val;
      }
    }
    break;
  }
}

loadDotEnv();

// ── 配置物件 ──────────────────────────────────────────────────

const config = {
  // LessLS Registry
  registry: process.env.LESSL_REGISTRY || 'https://registry.lessls.org',

  // LessLS API
  apiBase: process.env.LESSL_API_BASE || 'https://api.lessls.org',

  // GitHub
  githubRepo: process.env.LESSL_GITHUB_REPO || 'lessls/lessls',
  githubOAuthClientId: process.env.GITHUB_OAUTH_CLIENT_ID || 'OAUTH_CLIENT_ID',
  githubOAuthRedirectUri: process.env.GITHUB_OAUTH_REDIRECT_URI || 'http://localhost:18742/oauth/callback',

  // 版本
  currentVersion: process.env.LESSL_VERSION || '0.1.0',
};

module.exports = config;
