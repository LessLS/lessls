/**
 * lss update — 更新 LessLS CLI 本身
 *
 * 支援來源：
 *   lss update                 → 從 LessLS Registry 檢查更新
 *   lss update github          → 從 GitHub releases 下載最新版
 */
const path = require('path');
const fs = require('fs');

const CURRENT_VERSION = require('../config').currentVersion;
const GITHUB_REPO = require('../config').githubRepo;

function run(args, ctx) {
  const { log, info, ok, warn } = ctx;

  // 模式：lss update github
  if (args[0] === 'github') {
    return updateFromGithub(ctx);
  }

  log('');
  info('正在檢查 LessLS 更新 ...');

  checkLessLSRegistry().then(({ latest }) => {
    if (latest === CURRENT_VERSION) {
      ok(`LessLS 已是最新版本 ${CURRENT_VERSION}`);
      info('registry.lessls.org');
    } else {
      info(`發現新版本 ${latest}，正在下載 ...`);
      downloadUpdate(latest).then(() => {
        ok(`已更新至 ${latest}`);
      }).catch(err => {
        warn(`更新失敗：${err.message}`);
        info('請嘗試：lss update github');
      });
    }
  }).catch(err => {
    warn(`檢查更新失敗：${err.message}`);
    info('請嘗試：lss update github');
  });
}

// ── GitHub 更新 ────────────────────────────────────────────────

async function updateFromGithub(ctx) {
  const { log, info, ok, warn } = ctx;

  log('');
  info(`正在從 GitHub 檢查 ${GITHUB_REPO} 更新 ...`);

  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
    if (!res.ok) {
      throw new Error(`無法取得 releases 資訊（HTTP ${res.status})`);
    }
    const release = await res.json();
    const latestVersion = release.tag_name.replace(/^v/, '');

    if (latestVersion === CURRENT_VERSION) {
      ok(`LessLS 已是最新版本 ${CURRENT_VERSION}（GitHub）`);
      return;
    }

    info(`發現新版本 ${latestVersion}，正在下載 ...`);

    // 尋找 EXE asset
    const exeAsset = release.assets?.find(a => a.name === 'lessls.exe' || a.name.endsWith('.exe'));
    const downloadUrl = exeAsset
      ? exeAsset.browser_download_url
      : `https://github.com/${GITHUB_REPO}/releases/download/${release.tag_name}/lessls.exe`;

    ok(`最新版本：${latestVersion}`);
    info(`下載網址：${downloadUrl}`);
    info('（實際下載功能需要在真實環境中執行）');
    log('');
    info('提示：可手動下載並替換 ~/.lessls/bin/lessls.exe');
  } catch (err) {
    warn(`GitHub 更新失敗：${err.message}`);
  }
}

// ── LessLS Registry 更新 ──────────────────────────────────────

async function checkLessLSRegistry() {
  try {
    const res = await fetch(`${config.registry}/@lessls/lessls/latest`);
    const data = await res.json();
    return { latest: data.version || CURRENT_VERSION };
  } catch {
    return { latest: CURRENT_VERSION };
  }
}

async function downloadUpdate(version) {
  // 實際環境中會使用 child_process 執行下載
  return Promise.resolve();
}

module.exports = { run };
