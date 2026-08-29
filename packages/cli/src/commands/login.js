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

  // 模式 1：lss login <code> — 授權碼登入
  if (args[0] && args[0].match(/^[A-Z0-9]{6}$/i)) {
    return loginByCode(args[0], ctx);
  }

  // 模式 2：lss login <user:token> 或 lss login <token>
  if (args[0]) {
    const parts = args[0].split(':');
    const username = parts[0] || 'user';
    const token = parts[1] || '';
    saveConfig({ user: username, token, __configPath: CONFIG_PATH });
    ok(`已登入 ${username}`);
    info('Token 已儲存至 ~/.lessls/config.json');
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
  const lesslsUrl = `${config.registry}/login?code=${code}`;

  log('  ┌─ GitHub 快速登入 ───────────────────────────────');
  log('  │');
  log(`  │  授權碼：${code}`);
  log('  │');
  log('  │  步驟：');
  log('  │    1. 點擊下方連結');
  log('  │    2. 授權 GitHub 帳號');
  log('  │    3. 登入完成');
  log('  │');
  log(`  │  👉 ${githubUrl}`);
  log('  │');
  log('  └───────────────────────────────────────────────────');
  log('');

  log('  ┌─ LessLS 官方登入 ───────────────────────────────');
  log('  │');
  log(`  │  授權碼：${code}`);
  log('  │');
  log('  │  請前往以下網址，輸入授權碼完成登入：');
  log(`  │  👉 ${lesslsUrl}`);
  log('  │');
  log('  │  或直接在終端機執行：');
  log(`  │  lss login ${code}`);
  log('  │');
  log('  └───────────────────────────────────────────────────');
  log('');

  info('授權碼有效期 5 分鐘，請盡快完成登入');
}

// ── 授權碼登入 ────────────────────────────────────────────────

async function loginByCode(code, ctx) {
  const { log, info, ok, warn } = ctx;
  const { CONFIG_PATH } = ctx;

  code = code.toUpperCase();

  log('');
  info(`正在驗證授權碼 ${code} ...`);

  try {
    const res = await fetch(`${config.apiBase}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    saveConfig({
      user: data.user || data.login || 'user',
      token: data.token || data.access_token || '',
      avatar: data.avatar_url || data.avatar || '',
      __configPath: CONFIG_PATH,
    });

    ok(`已登入 ${data.user || data.login || 'user'}`);
    info('Token 已儲存至 ~/.lessls/config.json');
  } catch (err) {
    warn(`授權碼驗證失敗：${err.message}`);
    log('');
    info('請確認授權碼是否正確或已過期');
    info('重新執行 lss login 取得新的授權碼');
  }
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
