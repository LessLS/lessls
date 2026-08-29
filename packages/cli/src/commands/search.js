/**
 * ls search <keyword> [--limit N]
 *  搜尋 LessLS Registry 或 npm 中的套件
 */
function run(args, ctx) {
  const { log, info } = ctx;

  const MOCK_REGISTRY = [
    { name: '@lessls/lessls',       version: '0.1.0',  description: 'LessLS CLI 核心',           registry: 'lessls' },
    { name: '@lessls/weather',      version: '1.2.3',  description: '台灣天氣查詢',            registry: 'lessls' },
    { name: '@lessls/typhoon',      version: '0.5.0',  description: '颱風預報工具',            registry: 'lessls' },
    { name: 'typescript',           version: '5.4.2',  description: 'TypeScript 編譯器',       registry: 'npm' },
    { name: 'axios',                version: '1.6.7',  description: 'HTTP 客戶端',             registry: 'npm' },
    { name: 'express',              version: '4.18.2', description: 'Web 框架',                registry: 'npm' },
    { name: 'lodash',               version: '4.17.21',description: '實用工具庫',              registry: 'npm' },
    { name: 'chalk',                version: '5.3.0',  description: '終端機字色',              registry: 'npm' },
    { name: 'commander',            version: '12.0.0', description: '命令列框架',              registry: 'npm' },
    { name: 'dotenv',               version: '16.4.5', description: '環境變數載入器',          registry: 'npm' },
  ];

  const keyword = args.find(a => !a.startsWith('--'));
  const limitFlag = args.find(a => a.startsWith('--limit'));
  const limit = limitFlag ? parseInt(limitFlag.split('=')[1], 10) : 10;

  if (!keyword) {
    log('  請提供搜尋關鍵字，例如：ls search http');
    log('');
    log('  額外支援：');
    log('    ls install github <owner>/<repo>');
    return;
  }

  const results = MOCK_REGISTRY.filter(p =>
    p.name.toLowerCase().includes(keyword.toLowerCase()) ||
    p.description.toLowerCase().includes(keyword.toLowerCase())
  ).slice(0, limit);

  if (results.length === 0) {
    log(`  找不到與 "${keyword}" 相關的套件`);
    log('');
    info('嘗試：ls install github <owner>/<repo>');
    return;
  }

  log('');
  log(`  找到 ${results.length} 個結果（關鍵字：${keyword}）`);
  log('');

  for (const pkg of results) {
    const source = pkg.registry === 'lessls' ? '🟢' : '⚪';
    log(`  ${source}  ${pkg.name.padEnd(28)} ${pkg.version}  ${pkg.description}`);
  }

  log('');
  info(`ls install ${results[0]?.name}`);
  info(`或從 GitHub：ls install github owner/repo`);
}

module.exports = { run };
