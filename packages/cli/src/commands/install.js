/**
 * lss install <package> [--registry npm|github]
 *
 * 支援來源：
 *   lss install <pkg>              → LessLS Registry（預設）
 *   lss install <pkg> --registry npm → npm registry
 *   lss install github <owner>/<repo> → GitHub 倉庫 releases
 */
const path = require('path');
const fs = require('fs');
const os = require('os');
const config = require('../config');
const { download, getGithubReleaseAsset } = require('../download');

// 安裝根目錄
const INSTALL_DIR = path.join(os.homedir(), '.lessls', 'packages');

function run(args, ctx) {
  const { log, info, ok, warn } = ctx;
  const { LOCK_PATH } = ctx;

  if (!args.length) {
    warn('請提供套件名稱或 GitHub 倉庫');
    log('');
    log('  範例：');
    log('    lss install @lessls/lessls');
    log('    lss install typescript --registry npm');
    log('    lss install github lessls/lessls');
    return;
  }

  // 模式：lss install github <owner>/<repo>
  if (args[0] === 'github' && args[1]) {
    return installFromGithub(args[1], ctx);
  }

  // 一般套件安裝
  const registryFlag = args.find(a => a.startsWith('--registry'));
  const registry = registryFlag ? registryFlag.split('=')[1] : 'lessls';
  const pkgSpec = args[0];

  info(`正在安裝 ${pkgSpec} ...`);

  const pkg = parsePkgSpec(pkgSpec);

  // 從 registry 取得版本
  return fetchVersion(pkgSpec, registry)
    .then(version => {
      log('');
      info(`安裝 ${pkg.name}@${version} ...`);

      // 下載
      const downloadUrl = buildDownloadUrl(pkgSpec, version, registry);
      const destDir = path.join(INSTALL_DIR, `${pkg.name}-${version}`);
      fs.mkdirSync(destDir, { recursive: true });

      if (registry === 'github') {
        // GitHub tarball
        const tarUrl = `https://github.com/${pkgSpec}/archive/refs/heads/main.tar.gz`;
        const tarDest = path.join(destDir, 'package.tar.gz');
        return download(tarUrl, tarDest)
          .then(() => {
            // 記錄到 lockfile
            let lock = readLock(LOCK_PATH);
            if (!lock.packages) lock.packages = {};
            lock.packages[pkg.name] = {
              version,
              resolved: tarUrl,
              registry: 'github',
              path: destDir,
              installedAt: new Date().toISOString(),
            };
            writeLock(lock, LOCK_PATH);
            ok(`已安裝 ${pkg.name}@${version} (github)`);
            info(`路徑: ${destDir}`);
          });
      } else {
        // Registry tarball
        const fileDest = path.join(destDir, 'package.tgz');
        return download(downloadUrl, fileDest)
          .then(() => {
            // 記錄到 lockfile
            let lock = readLock(LOCK_PATH);
            if (!lock.packages) lock.packages = {};
            lock.packages[pkg.name] = {
              version,
              resolved: downloadUrl,
              registry,
              path: destDir,
              installedAt: new Date().toISOString(),
            };
            writeLock(lock, LOCK_PATH);
            ok(`已安裝 ${pkg.name}@${version} (${registry})`);
            info(`路徑: ${destDir}`);
            info(`來源: ${downloadUrl}`);
          });
      }
    })
    .catch(err => {
      warn(`安裝失敗：${err.message}`);
      info('請確認套件名稱是否正確');
    });
}

// ── GitHub 倉庫安裝 ────────────────────────────────────────────

async function installFromGithub(repoSpec, ctx) {
  const { log, info, ok, warn } = ctx;
  const { LOCK_PATH } = ctx;

  const match = repoSpec.match(/^([^/]+)\/([^/]+)$/);
  if (!match) {
    warn(`無效的倉庫格式：${repoSpec}`);
    info('正確格式：lss install github <owner>/<repo>');
    return;
  }

  const [_, owner, repo] = match;
  info(`正在從 GitHub 安裝 ${owner}/${repo} ...`);

  try {
    // 查詢最新 release
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`);
    if (!res.ok) throw new Error(`無法取得 ${owner}/${repo} 的 releases 資訊（HTTP ${res.status})`);
    const release = await res.json();
    const version = release.tag_name.replace(/^v/, '');

    // 尋找 exe asset
    const asset = release.assets?.find(a => a.name.endsWith('.exe'));
    if (!asset) throw new Error(`找不到 .exe asset（可用: ${release.assets?.map(a => a.name).join(', ') || '無'}）`);

    // 下載
    const destDir = path.join(INSTALL_DIR, `${owner}__${repo}-${version}`);
    fs.mkdirSync(destDir, { recursive: true });
    const destFile = path.join(destDir, asset.name);

    info(`下載 ${asset.size} bytes ...`);
    await download(asset.browser_download_url, destFile);

    // 記錄到 lockfile
    let lock = readLock(LOCK_PATH);
    if (!lock.packages) lock.packages = {};
    lock.packages[`${owner}/${repo}`] = {
      version,
      resolved: asset.browser_download_url,
      registry: 'github',
      owner,
      repo,
      path: destDir,
      installedAt: new Date().toISOString(),
    };
    writeLock(lock, LOCK_PATH);

    ok(`已安裝 ${owner}/${repo}@${version} (github)`);
    info(`路徑: ${destDir}`);
  } catch (err) {
    warn(`安裝失敗：${err.message}`);
  }
}

// ── Registry 工具 ──────────────────────────────────────────────

async function fetchVersion(pkgSpec, registry) {
  // 先嘗試 registry
  if (registry === 'lessls') {
    try {
      const res = await fetch(`${config.registry}/${pkgSpec}/latest`);
      if (res.ok) {
        const data = await res.json();
        return data.version || 'latest';
      }
    } catch {}
  }

  // 嘗試 npm
  if (registry === 'npm' || registry === 'lessls') {
    try {
      const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(pkgSpec)}/latest`);
      if (res.ok) {
        const data = await res.json();
        return data.version || 'latest';
      }
    } catch {}
  }

  return 'latest';
}

function buildDownloadUrl(pkgSpec, version, registry) {
  if (registry === 'npm') {
    return `https://registry.npmjs.org/${encodeURIComponent(pkgSpec)}/-/${encodeURIComponent(pkgSpec.replace(/\//g, '-'))}-${version}.tgz`;
  }
  // LessLS registry
  return `${config.registry}/${encodeURIComponent(pkgSpec)}/-/${encodeURIComponent(pkgSpec.replace(/\//g, '-'))}-latest.tgz`;
}

// ── 工具函數 ──────────────────────────────────────────────────

function parsePkgSpec(spec) {
  if (spec.startsWith('@')) {
    const parts = spec.split('/');
    return { scope: parts[0].slice(1), name: parts.slice(1).join('/') };
  }
  return { name: spec };
}

function readLock(LOCK_PATH) {
  if (fs.existsSync(LOCK_PATH)) {
    try { return JSON.parse(fs.readFileSync(LOCK_PATH, 'utf8')); } catch {}
  }
  return { version: 1, packages: {} };
}

function writeLock(lock, LOCK_PATH) {
  fs.mkdirSync(path.dirname(LOCK_PATH), { recursive: true });
  fs.writeFileSync(LOCK_PATH, JSON.stringify(lock, null, 2), 'utf8');
}

module.exports = { run };
