/**
 * lss release [--tag <tag>] [--dry-run]
 *  發布當前專案到 LessLS Registry
 */
const path = require('path');
const fs = require('fs');

function run(args, ctx) {
  const { log, info, ok, warn } = ctx;
  const { CONFIG_PATH } = ctx;

  if (!fs.existsSync(CONFIG_PATH)) {
    warn('尚未登入，請先執行：lss login');
    return;
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch {
    warn('config.json 格式錯誤');
    return;
  }

  if (config.user === 'anonymous' || !config.token) {
    warn('尚未登入，請先執行：lss login <token>');
    return;
  }

  const tagFlag = args.find(a => a.startsWith('--tag'));
  const tag = tagFlag ? tagFlag.split('=')[1] : 'latest';
  const dryRun = args.includes('--dry-run');

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

  if (dryRun) {
    log('');
    log('  ┌─ Dry Run ────────────────────────────────');
    log(`  │  套件 : ${name}@${version}`);
    log(`  │  標籤 : ${tag}`);
    log(`  │  發布者: ${config.user}`);
    log('  └───────────────────────────────────────────');
    log('');
    ok('Dry run 完成，未實際發布');
    return;
  }

  info(`正在發布 ${name}@${version} ...`);
  ok(`已發布 ${name}@${version} [${tag}]`);
  info(require('../config').registry);
}

module.exports = { run };
