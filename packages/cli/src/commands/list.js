/**
 * lss list — 列出已安裝套件
 */
const fs = require('fs');

function run(args, ctx) {
  const { log } = ctx;
  const { LOCK_PATH } = ctx;

  try {
    const data = JSON.parse(fs.readFileSync(LOCK_PATH, 'utf8'));
    const packages = data.packages || {};
    const entries = Object.entries(packages);

    if (entries.length === 0) {
      log('');
      log('  尚未安裝任何套件');
      log('');
      return;
    }

    log('');
    log('  ┌─ 已安裝套件 ──────────────────────────────────────');
    log('  │  名稱                              版本      來源');
    log('  ├' + '─'.repeat(58));

    for (const [name, info] of entries) {
      const version = (info.version || '?').padEnd(8);
      const source = (info.registry || 'unknown').padEnd(7);
      const padding = Math.max(0, 22 - name.length);
      log(`  │  ${name}${' '.repeat(padding)}${version}${source}`);
    }

    log('  └' + '─'.repeat(58));
    log('');
    log(`  共 ${entries.length} 個套件`);
  } catch {
    log('');
    log('  尚未安裝任何套件');
    log('');
  }
}

module.exports = { run };
