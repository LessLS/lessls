/**
 * lss login — 登入 LessLS 平台
 *
 * 支援模式：
 *   lss login                     → 互動式登入（輸入 GitHub Token）
 *   lss login <token>             → 直接使用 GitHub PAT 登入
 *   lss login <user:token>        → 指定使用者名稱
 */
const path = require('path');
const fs = require('fs');
const config = require('../config');

function run(args, ctx) {
  const { log, info, ok, warn } = ctx;
  const { CONFIG_PATH } = ctx;

  // 模式 1：lss login <token> 或 lss login <user:token>
  if (args[0]) {
    const parts = args[0].split(':');
    const username = parts[0];
    const token = parts[1] || parts[0]; // 若無冒號，整個字串當 token

    if (token && token.length >= 10) {
      return verifyAndLogin(token, username || null, ctx);
    }

    // 短字串（<10 碼）視為 6 碼授權碼模式
    if (token.match(/^[A-Za-z0-9]{6,}$/)) {
      return loginByCode(token, ctx);
    }

    warn(`無效的參數：${args[0]}`);
    info('請使用：lss login <github_pat>');
    info('或：lss login user:token');
    return;
  }

  // 模式 2：互動式登入
  log('');
  log('  ┌─ LessLS 登入 ──────────────────────────────────────');
  log('  │');
  log('  │  LessLS 使用 GitHub 帳號登入');
  log('  │');
  log('  │  步驟：');
  log('  │    1. 前往 https://github.com/settings/tokens');
  log('  │    2. 點選 "Generate new token (classic)"');
  log('  │    3. 勾選 "repo" 和 "read:user" 權限');
  log('  │    4. 產生後貼上 Token 下方');
  log('  │');
  log('  └────────────────────────────────────────────────────');
  log('');
  info('或直接執行：lss login <your_github_pat>');
  log('');
  info('Token 範例：ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
}

// ── 驗證並登入 ────────────────────────────────────────────────

async function verifyAndLogin(token, username, ctx) {
  const { log, info, ok, warn } = ctx;
  const { CONFIG_PATH } = ctx;

  log('');
  info('正在驗證 GitHub Token ...');

  try {
    const res = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }

    const user = await res.json();
    saveConfig({
      user: username || user.login,
      token,
      avatar: user.avatar_url || '',
      __configPath: CONFIG_PATH,
    });

    ok(`已登入 ${user.login}`);
    info('Token 已儲存至 ~/.lessls/config.json');
  } catch (err) {
    warn(`登入失敗：${err.message}`);
    log('');
    info('請確認 Token 是否有效，或前往 https://github.com/settings/tokens 重新產生');
  }
}

// ── 授權碼登入（後端 API） ────────────────────────────────────

async function loginByCode(code, ctx) {
  const { log, info, ok, warn } = ctx;

  log('');
  info(`正在驗證授權碼 ${code} ...`);

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
  } catch {}

  warn('後端 API 尚未上線，請使用 GitHub Token 登入');
  log('');
  info('執行：lss login <github_pat>');
}

// ── 工具函數 ──────────────────────────────────────────────────

function saveConfig(cfg) {
  fs.mkdirSync(path.dirname(cfg.__configPath), { recursive: true });
  const { __configPath, ...data } = cfg;
  fs.writeFileSync(__configPath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { run };

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
