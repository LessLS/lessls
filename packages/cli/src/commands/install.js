/**
 * lss install <package> [--registry npm|github]
 *
 * 支援來源：
 *   lss install <pkg>              → LessLS Registry（預設）
 *   lss install <pkg> --registry npm → npm registry
 *   lss install github <owner>/<repo> → GitHub 倉庫
 */
const path = require('path');
const fs = require('fs');
const config = require('../config');

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

  let lock = readLock(LOCK_PATH);
  info(`正在安裝 ${pkgSpec} ...`);

  const pkg = parsePkgSpec(pkgSpec);
  const version = detectVersion(pkgSpec, registry);

  if (!lock.packages) lock.packages = {};
  lock.packages[pkg.name] = {
    version,
    resolved: buildResolved(pkgSpec, registry),
    registry,
    installedAt: new Date().toISOString(),
  };

  writeLock(lock, LOCK_PATH);
  ok(`已安裝 ${pkg.name}@${version} (${registry})`);
  info(`來源: ${lock.packages[pkg.name].resolved}`);
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
    // 查詢 GitHub releases 取得最新版本
    const releasesRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`);
    if (!releasesRes.ok) {
      throw new Error(`無法取得 ${owner}/${repo} 的 releases 資訊（HTTP ${releasesRes.status})`);
    }
    const release = await releasesRes.json();
    const version = release.tag_name.replace(/^v/, '');

    // 取得下載連結（優先 asset）
    let downloadUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/main.tar.gz`;
    if (release.assets && release.assets.length > 0) {
      const asset = release.assets.find(a => a.name.endsWith('.tgz') || a.name.endsWith('.tar.gz'));
      if (asset) downloadUrl = asset.browser_download_url;
    }

    let lock = readLock(LOCK_PATH);
    const pkgName = `${owner}/${repo}`;

    if (!lock.packages) lock.packages = {};
    lock.packages[pkgName] = {
      version,
      resolved: downloadUrl,
      registry: 'github',
      owner,
      repo,
      installedAt: new Date().toISOString(),
    };

    writeLock(lock, LOCK_PATH);
    ok(`已安裝 ${pkgName}@${version} (github)`);
    info(`來源: ${downloadUrl}`);
    log('');
    info('提示：此為模擬模式，實際下載功能需要網路請求支援');
  } catch (err) {
    warn(`安裝失敗：${err.message}`);
  }
}

// ── 工具函數 ──────────────────────────────────────────────────

function parsePkgSpec(spec) {
  if (spec.startsWith('@')) {
    const parts = spec.split('/');
    return { scope: parts[0].slice(1), name: parts.slice(1).join('/') };
  }
  return { name: spec };
}

function detectVersion(spec, registry) {
  if (registry === 'npm') {
    const MOCK_NPM = { typescript: '5.4.2', axios: '1.6.7', lodash: '4.17.21', express: '4.18.2', chalk: '5.3.0' };
    return MOCK_NPM[spec] || 'latest';
  }
  const MOCK_LESSLS = { '@lessls/lessls': '0.1.0', '@lessls/weather': '1.2.3', '@lessls/typhoon': '0.5.0' };
  return MOCK_LESSLS[spec] || 'latest';
}

function buildResolved(spec, registry) {
  if (registry === 'lessls') {
    return `https://${config.registry.replace('https://', '')}/${spec}/-/${spec.replace(/\//g, '-')}-latest.tgz`;
  }
  return `https://registry.npmjs.org/${spec}/-/${spec.replace(/\//g, '-')}-latest.tgz`;
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
