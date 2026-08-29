/**
 * lss list — 列出已安裝的 LessLS 套件
 */
const fs = require('fs');
const path = require('path');

function run(args, ctx) {
  const { log, info } = ctx;
  const { LOCK_PATH } = ctx;

  if (!fs.existsSync(LOCK_PATH)) {
    log('  目前沒有已安裝的套件（執行 lss install <pkg> 安裝）');
    return;
  }

  let lock;
  try {
    lock = JSON.parse(fs.readFileSync(LOCK_PATH, 'utf8'));
  } catch {
    log('  lock.json 格式錯誤');
    return;
  }

  const packages = lock.packages || {};
  const entries = Object.entries(packages);

  if (entries.length === 0) {
    log('  目前沒有已安裝的套件');
    return;
  }

  log('');
  log('  ┌─ 已安裝套件 ──────────────────────────────────────');
  log('  │  名稱                              版本      來源');
  log('  ├' + '─'.repeat(58));

  for (const [name, meta] of entries) {
    const source = meta.registry === 'npm' ? 'npm' : 'lessls';
    const line = `  │  ${name.padEnd(30)} ${meta.version.padEnd(10)} ${source}`;
    log(line);
  }

  log('  └' + '─'.repeat(58));
  log('');
  info(`共 ${entries.length} 個套件`);
}

module.exports = { run };
