/**
 * lss release [--tag <tag>] [--dry-run]
 *  發布當前專案到 LessLS Registry / GitHub Releases
 */
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');
const config = require('../config');
const { download, uploadToGithubRelease } = require('../download');

function run(args, ctx) {
  const { log, info, ok, warn } = ctx;
  const { CONFIG_PATH } = ctx;

  // 檢查登入
  if (!fs.existsSync(CONFIG_PATH)) {
    warn('尚未登入，請先執行：lss login');
    return;
  }

  let configData;
  try {
    configData = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch {
    warn('config.json 格式錯誤');
    return;
  }

  const token = configData.token || configData.user;
  if (!token) {
    warn('尚未登入，請先執行：lss login <token>');
    return;
  }

  const tagFlag = args.find(a => a.startsWith('--tag'));
  const tag = tagFlag ? tagFlag.split('=')[1] : 'latest';
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');

  // 取得 package.json
  const pkgPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(pkgPath)) {
    warn('找不到 package.json，請在專案根目錄執行 lss release');
    return;
  }

  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  } catch {
    warn('package.json 格式錯誤');
    return;
  }

  const name = pkg.name;
  const version = pkg.version;

  if (!name || !version) {
    warn('package.json 必須有 name 和 version');
    return;
  }

  // 檢查是否已有這個版本
  if (!force) {
    checkExisting(name, version, token).then(exists => {
      if (exists) {
        warn(`版本 ${name}@${version} 已存在`);
        info('使用 --force 強制發布');
        info('或查看：lss search ' + name);
      } else {
        doRelease(name, version, tag, token, dryRun, ctx);
      }
    });
  } else {
    doRelease(name, version, tag, token, dryRun, ctx);
  }
}

async function checkExisting(name, version, token) {
  try {
    const res = await fetch(`https://api.github.com/repos/${config.githubRepo}/releases/tags/v${version}`);
    return res.ok;
  } catch {
    return false;
  }
}

async function doRelease(name, version, tag, token, dryRun, ctx) {
  const { log, info, ok, warn } = ctx;

  if (dryRun) {
    log('');
    log('  ┌─ Dry Run ────────────────────────────────────────────');
    log(`  │  套件  : ${name}@${version}`);
    log(`  │  標籤  : ${tag}`);
    log(`  │  發布者: ${token ? '已登入' : '未登入'}`);
    log('  └───────────────────────────────────────────────────────');
    log('');
    ok('Dry run 完成，未實際發布');
    return;
  }

  info(`正在發布 ${name}@${version} ...`);
  log('');

  // 步驟 1：編譯專案（如果有的話）
  const hasBuildScript = await hasBuildScript();
  if (hasBuildScript) {
    info('正在編譯專案 ...');
    try {
      execSync('npm run build', { stdio: 'ignore' });
      ok('編譯完成');
    } catch {
      warn('編譯失敗，跳過');
    }
  }

  // 步驟 2：打包 EXE
  info('正在打包 lessls.exe ...');
  const exePath = await packageExe(name, version);
  if (!exePath) {
    warn('找不到 lessls.exe，請先執行 npm run pkg');
    return;
  }
  ok(`打包完成：${exePath}`);

  // 步驟 3：建立 GitHub release
  info(`正在建立 GitHub release v${version} ...`);
  try {
    // 建立 tag（如果沒有）
    try {
      execSync(`git tag v${version}`, { stdio: 'ignore' });
      execSync(`git push origin v${version}`, { stdio: 'ignore' });
      info('已建立 tag v' + version);
    } catch {}

    // 建立 release
    await createGithubRelease(name, version, token);
    ok(`已建立 release v${version}`);
  } catch (err) {
    warn(`建立 release 失敗：${err.message}`);
  }

  // 步驟 4：上傳 asset
  if (exePath) {
    info('正在上傳 lessls.exe ...');
    try {
      await uploadToGithubRelease(config.githubRepo, `v${version}`, exePath, 'lessls.exe', token);
      ok('上傳成功！');
    } catch (err) {
      warn(`上傳失敗：${err.message}`);
    }
  }

  // 步驟 5：發布到 LessLS Registry
  if (exePath) {
    info('正在發布到 LessLS Registry ...');
    try {
      await publishToRegistry(name, version, exePath, token);
      ok(`已發布 ${name}@${version} [${tag}]`);
      info(config.registry);
    } catch (err) {
      warn(`Registry 發布失敗：${err.message}`);
    }
  }

  log('');
  ok('發布完成！');
  info(`https://github.com/${config.githubRepo}/releases/tag/v${version}`);
}

async function hasBuildScript() {
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return !!pkg.scripts?.build;
  } catch {
    return false;
  }
}

async function packageExe(name, version) {
  const distPath = path.join(__dirname, '..', 'dist', 'index.js');
  const exePath = path.join(__dirname, '..', 'assets', 'lessls.exe');
  const tmpExe = path.join(__dirname, '..', 'assets', `lessls-${version}.exe`);

  // 如果 assets/lessls.exe 存在，直接上傳
  if (fs.existsSync(exePath)) {
    // 複製到暫存
    fs.copyFileSync(exePath, tmpExe);
    return tmpExe;
  }

  // 否則嘗試編譯
  try {
    execSync('npm run pkg', { cwd: path.join(__dirname, '..'), stdio: 'ignore' });
    if (fs.existsSync(exePath)) {
      fs.copyFileSync(exePath, tmpExe);
      return tmpExe;
    }
  } catch {}

  return null;
}

async function createGithubRelease(name, version, token) {
  const res = await fetch(`https://api.github.com/repos/${config.githubRepo}/releases`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tag_name: `v${version}`,
      name: `v${version}`,
      body: `Release ${name}@${version}`,
      prerelease: false,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

async function publishToRegistry(name, version, exePath, token) {
  // 讀取 exe 作為 buffer
  const buffer = fs.readFileSync(exePath);

  const res = await fetch(`${config.registry}/publish`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      version,
      file: buffer.toString('base64'),
      filename: `${name}-${version}.exe`,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

module.exports = { run };
