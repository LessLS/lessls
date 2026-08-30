/**
 * lss login — 登入 LessLS 平台
 *
 * 支援模式：
 *   lss login                  → 顯示登入指引（含授權碼）
 *   lss login <code>           → 輸入授權碼登入
 *   lss login <user:token>     → 直接使用 token 登入
 *   lss login <token>          → 直接使用 token 登入
 */
const path = require('path');
const fs = require('fs');
const config = require('../config');

function run(args, ctx) {
  const { log, info, ok, warn } = ctx;
  const { CONFIG_PATH } = ctx;

  // 模式 1：lss login <code> — 授權碼登入（6 碼或 GitHub callback code）
  if (args[0] && /^[A-Za-z0-9_\-]{6,}$/.test(args[0])) {
    return loginByCode(args[0], ctx);
  }

  // 模式 2：lss login <user:token>
  if (args[0] && args[0].includes(':')) {
    const parts = args[0].split(':');
    const username = parts[0] || 'user';
    const token = parts[1] || '';
    saveConfig({ user: username, token, __configPath: CONFIG_PATH });
    ok(`已登入 ${username}`);
    info('Token 已儲存至 ~/.lessls/config.json');
    return;
  }

  // 不符合任何格式，顯示錯誤
  if (args[0]) {
    warn(`無效的參數：${args[0]}`);
    log('');
    info('授權碼範例：lss login ABCD12 或 lss login gho_xxxxxxxxxxxx');
    info('或輸入 token：lss login user:token');
    return;
  }

  // 模式 3：互動式登入 — 產生授權碼
  log('');
  log('  ┌─ LessLS 登入 ──────────────────────────────────────');
  log('  │');
  log('  │  請選擇登入方式：');
  log('  │');
  log('  │  [A] GitHub 帳號登入');
  log('  │  [B] 官方帳號登入');
  log('  │');
  log('  └────────────────────────────────────────────────────');
  log('');

  // 產生授權碼
  const code = generateAuthCode();
  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${config.githubOAuthClientId}&redirect_uri=${encodeURIComponent(config.githubOAuthRedirectUri)}&scope=read:user&state=${code}`;

  log('  ┌─ GitHub 登入 ────────────────────────────────────────');
  log('  │');
  log(`  │  授權碼：${code}`);
  log('  │');
  log('  │  步驟：');
  log('  │    1. 點擊下方連結授權 GitHub');
  log('  │    2. 授權後跳回 ls.illusd.com 取得 code');
  log('  │    3. 在終端機執行：lss login <code>');
  log('  │');
  log(`  │  👉 ${githubUrl}`);
  log('  │');
  log('  └───────────────────────────────────────────────────────');
  log('');

  info('授權碼有效期 5 分鐘，請盡快完成登入');
}

// ── 授權碼登入 ────────────────────────────────────────────────
// 支援兩種模式：
// 1. 後端 API：lss login <6碼> → POST api.lessls.org/auth/verify
// 2. GitHub OAuth：lss login <code> → GET api.github.com/user?access_token=code
//    （GitHub 會把 authorization code 直接當成 access_token 使用）

async function loginByCode(code, ctx) {
  const { log, info, ok, warn } = ctx;
  const { CONFIG_PATH } = ctx;

  log('');
  info(`正在驗證授權碼 ${code} ...`);

  // 先嘗試後端 API（正式環境）
  try {
    const res = await fetch(`${config.apiBase}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (res.ok) {
      const data = await res.json();
      saveConfig({
        user: data.user || data.login || 'user',
        token: data.token || code,
        avatar: data.avatar_url || data.avatar || '',
        __configPath: CONFIG_PATH,
      });
      ok(`已登入 ${data.user || data.login || 'user'}`);
      info('Token 已儲存至 ~/.lessls/config.json');
      return;
    }
  } catch {} // 後端不可用，繼續用 GitHub 驗證

  // 後端不可用時，用 code 直接呼叫 GitHub API 換 user info
  try {
    const res = await fetch(`https://api.github.com/user?access_token=${code}`);
    if (res.ok) {
      const user = await res.json();
      saveConfig({
        user: user.login,
        token: code,
        avatar: user.avatar_url || '',
        __configPath: CONFIG_PATH,
      });
      ok(`已登入 ${user.login}`);
      info('Token 已儲存至 ~/.lessls/config.json');
      return;
    }
  } catch {}

  warn('驗證失敗，授權碼無效或已過期');
  log('');
  info('請重新執行 lss login 取得新的授權連結');
  info('或直接使用 token 登入：lss login <github_token>');
}

// ── GitHub OAuth ──────────────────────────────────────────────

function getGithubLoginUrl(code) {
  const clientId = config.githubOAuthClientId;
  const redirectUri = config.githubOAuthRedirectUri;
  return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user&state=${code}`;
}

// ── 工具函數 ──────────────────────────────────────────────────

function generateAuthCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function saveConfig(cfg) {
  fs.mkdirSync(path.dirname(cfg.__configPath), { recursive: true });
  const { __configPath, ...data } = cfg;
  fs.writeFileSync(__configPath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { run, generateAuthCode, getGithubLoginUrl };
