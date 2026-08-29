/**
 * lss help — 顯示協助訊息
 */
const config = require('../config');
function run(args, ctx) {
  const { log, chalk, info } = ctx;
  const version = require('../../package.json').version;

  log(chalk.bold + 'LessLS — 新一代輕量級命令列工具平台' + chalk.reset);
  log(chalk.dim + '版本 ' + version + '\n');

  log(chalk.bold + '常用指令：' + chalk.reset);
  log('  lss install <package>          安裝套件，例如：lss install @lessls/lessls');
  log('  lss install github <owner>/<repo>  從 GitHub 倉庫安裝');
  log('  lss login                      登入 LessLS 帳號');
  log('  lss login <code>               使用授權碼登入');
  log('  lss release                      發布當前專案到 LessLS Registry');
  log('  lss update                       更新 LessLS 本身');
  log('  lss update github                從 GitHub 更新');
  log('  lss search <keyword>             搜尋套件');
  log('  lss list                         列出已安裝套件');
  log('  lss status                       顯示 LessLS 狀態');
  log('  lss help                         顯示本說明');

  log(chalk.bold + '\n套件來源：' + chalk.reset);
  log('  LessLS Registry (預設):  ' + config.registry);
  log('  npm (相容模式):          lss install <pkg> --registry npm');
  log('  GitHub:                  lss install github <owner>/<repo>');

  log(chalk.bold + '\n登入方式：' + chalk.reset);
  log('  lss login                  → 取得授權碼，前往網頁完成登入');
  log('  lss login <code>           → 使用授權碼快速登入');
  log('  lss login <user:token>     → 直接使用 Token 登入');

  log(chalk.bold + '\n範例：' + chalk.reset);
  log('  lss install @lessls/lessls');
  log('  lss install typescript --registry npm');
  log('  lss install github lessls/lessls');
  log('  lss login');
  log('  lss login ABCD1234');
  log('  lss release --tag latest');
  log('  lss update github');
  log('  lss search http');
}

module.exports = { run };
