/**
 * ls status — 顯示 LessLS 狀態
 */
function run(args, ctx) {
  const { log } = ctx;
  const { CONFIG_PATH, LOCK_PATH } = ctx;
  const fs = require('fs');

  const version = '0.1.0';
  const hasConfig = fs.existsSync(CONFIG_PATH);
  let user = '未登入';
  if (hasConfig) {
    try {
      const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      user = cfg.user || '未登入';
    } catch {}
  }
  const installed = countPackages(LOCK_PATH, fs);

  log('');
  log('  ┌─ LessLS Status ──────────────────────────────────────────');
  log(`  │  版本    : ${version}${' '.repeat(38 - version.length)}`);
  log(`  │  安裝路徑: ${process.execPath}`);
  log(`  │  帳號    : ${user}${' '.repeat(38 - user.length)}`);
  log(`  │  已安裝套件: ${installed}${' '.repeat(30 - String(installed).length)}`);
  log('  │  Registry: registry.lessls.org');
  log('  └─────────────────────────────────────────────────────────');
  log('');
}

function countPackages(lockPath, fs) {
  try {
    const data = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
    return Object.keys(data.packages || {}).length;
  } catch { return 0; }
}

module.exports = { run };
