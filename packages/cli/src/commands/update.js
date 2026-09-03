/**
 * lss update [--github]
 *  更新 LessLS CLI 本身
 */
const path = require('path');
const fs = require('fs');
const os = require('os');
const config = require('../config');
const { download } = require('../download');

const CURRENT_VERSION = config.currentVersion;
const GITHUB_REPO = config.githubRepo;
const BIN_DIR = path.join(os.homedir(), '.lessls', 'bin');
const EXE_PATH = path.join(BIN_DIR, 'lessls.exe');

function run(args, ctx) {
  const { log, info, ok, warn } = ctx;

  // 模式：lss update github
  if (args[0] === 'github') {
    return updateFromGithub(ctx);
  }

  // 預設：先試 LessLS Registry，再試 GitHub
  log('');
  info('正在檢查 LessLS 更新 ...');

  checkLessLSRegistry()
    .then(({ latest }) => {
      if (latest === CURRENT_VERSION) {
        ok(`LessLS 已是最新版本 ${CURRENT_VERSION}（Registry）`);
        info(config.registry);
      } else {
        info(`發現新版本 ${latest}，正在從 Registry 下載 ...`);
        return downloadRegistryUpdate(latest);
      }
    })
    .catch(() => {
      // Registry 失敗，嘗試 GitHub
      info('Registry 檢查失敗，嘗試從 GitHub 更新 ...');
      return updateFromGithub(ctx);
    });
}

// ── Registry 更新 ─────────────────────────────────────────────

async function checkLessLSRegistry() {
  try {
    const res = await fetch(`${config.registry}/@lessls/lessls/latest`);
    const data = await res.json();
    return { latest: data.version || CURRENT_VERSION };
  } catch {
    return { latest: CURRENT_VERSION };
  }
}

async function downloadRegistryUpdate(version) {
  const { ok, info, warn } = require('../index').__ctx || { ok: console.log, info: console.log, warn: console.warn };
  const downloadUrl = `${config.registry}/@lessls/lessls/-/lessls-${version}.tgz`;

  // 暫存檔案
  const tmpFile = path.join(os.tmpdir(), `lessls-update-${version}.tgz`);
  info(`正在下載 ${downloadUrl} ...`);

  try {
    await download(downloadUrl, tmpFile);
    ok(`已更新至 ${version}（暫存）`);
    info('請手動替換 lessls.exe');
  } catch (err) {
    warn(`Registry 更新失敗：${err.message}`);
    info('嘗試：lss update github');
  }
}

// ── GitHub 更新 ────────────────────────────────────────────────

async function updateFromGithub(ctx) {
  const { log, info, ok, warn } = ctx;

  log('');
  info(`正在從 GitHub 檢查 ${GITHUB_REPO} 更新 ...`);

  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
    if (!res.ok) throw new Error(`無法取得 releases 資訊（HTTP ${res.status})`);
    const release = await res.json();
    const latestVersion = release.tag_name.replace(/^v/, '');

    // 沒有新版本
    if (latestVersion === CURRENT_VERSION) {
      ok(`LessLS 已是最新版本 ${CURRENT_VERSION}（GitHub）`);
      return;
    }

    // 尋找 exe asset
    const asset = release.assets?.find(a => a.name === 'lessls.exe' || a.name.endsWith('.exe'));
    if (!asset) {
      warn(`release ${latestVersion} 沒有找到 .exe asset`);
      info(`可用 assets: ${release.assets?.map(a => a.name).join(', ') || '無'}`);
      return;
    }

    info(`發現新版本 ${latestVersion}，正在下載 ${asset.name} ...`);
    info(`大小: ${formatBytes(asset.size)}`);

    // 下載到暫存
    const tmpFile = path.join(os.tmpdir(), `lessls-${latestVersion}.exe`);
    await download(asset.browser_download_url, tmpFile);

    ok(`已下載 ${asset.name}（${formatBytes(asset.size)}）`);
    info(`暫存位置: ${tmpFile}`);
    log('');
    info('請手動替換：');
    info(`  cp "${tmpFile}" "${EXE_PATH}"`);
    info('');
    info('或直接執行新版的 lessls.exe：');
    info(`  "${tmpFile}" help`);
  } catch (err) {
    warn(`GitHub 更新失敗：${err.message}`);
  }
}

// ── 工具函數 ──────────────────────────────────────────────────

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

module.exports = { run };
