/**
 * ls help — 顯示協助訊息
 */
const config = require('../config');
function run(args, ctx) {
  const { log, chalk, info } = ctx;
  const version = require('../../package.json').version;

  log(chalk.bold + 'LessLS — 新一代輕量級命令列工具平台' + chalk.reset);
  log(chalk.dim + '版本 ' + version + '\n');

  log(chalk.bold + '常用指令：' + chalk.reset);
  log('  ls install <package>          安裝套件，例如：ls install @lessls/lessls');
  log('  ls install github <owner>/<repo>  從 GitHub 倉庫安裝');
  log('  ls login                      登入 LessLS 帳號');
  log('  ls login <code>               使用授權碼登入');
  log('  ls release                      發布當前專案到 LessLS Registry');
  log('  ls update                       更新 LessLS 本身');
  log('  ls update github                從 GitHub 更新');
  log('  ls search <keyword>             搜尋套件');
  log('  ls list                         列出已安裝套件');
  log('  ls status                       顯示 LessLS 狀態');
  log('  ls help                         顯示本說明');

  log(chalk.bold + '\n套件來源：' + chalk.reset);
  log('  LessLS Registry (預設):  ' + config.registry);
  log('  npm (相容模式):          ls install <pkg> --registry npm');
  log('  GitHub:                  ls install github <owner>/<repo>');

  log(chalk.bold + '\n登入方式：' + chalk.reset);
  log('  ls login                  → 取得授權碼，前往網頁完成登入');
  log('  ls login <code>           → 使用授權碼快速登入');
  log('  ls login <user:token>     → 直接使用 Token 登入');

  log(chalk.bold + '\n範例：' + chalk.reset);
  log('  ls install @lessls/lessls');
  log('  ls install typescript --registry npm');
  log('  ls install github lessls/lessls');
  log('  ls login');
  log('  ls login ABCD1234');
  log('  ls release --tag latest');
  log('  ls update github');
  log('  ls search http');
}

module.exports = { run };
