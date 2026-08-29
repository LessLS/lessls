#!/usr/bin/env node
/**
 * LessLS — 新一代輕量級命令列工具平台
 *
 * 使用方式：
 *   ls install <package>      # 安裝套件
 *   ls login                  # 登入 LessLS 平台
 *   ls release                # 發布當前專案到 LessLS Registry
 *   ls update                 # 更新 LessLS 本身
 *   ls search <keyword>       # 搜尋套件
 *   ls list                   # 列出已安裝套件
 *   ls status                 # 顯示 LessLS 狀態
 *   ls --help                 # 顯示說明
 */

const path = require('path');
const fs = require('fs');

// ── Chalk-like colors ────────────────────────────────────────────────────────

const chalk = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  red:     '\x1b[31m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  blue:    '\x1b[34m',
  cyan:    '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(msg)  { process.stdout.write(msg + chalk.reset + '\n'); }
function logErr(msg) { process.stderr.write(chalk.red + msg + chalk.reset + '\n'); }
function info(msg)  { process.stdout.write(chalk.cyan + 'ℹ ' + msg + chalk.reset + '\n'); }
function ok(msg)    { process.stdout.write(chalk.green + '✓ ' + msg + chalk.reset + '\n'); }
function warn(msg)  { process.stdout.write(chalk.yellow + '⚠ ' + msg + chalk.reset + '\n'); }

// ── Paths ────────────────────────────────────────────────────────────────────

const HOME = process.env.HOME || process.env.USERPROFILE || process.env.HOMEPATH || '';
const LESSLS_DIR = path.join(HOME, '.lessls');
const CONFIG_PATH = path.join(LESSLS_DIR, 'config.json');
const LOCK_PATH = path.join(LESSLS_DIR, 'lock.json');

// ── Router ────────────────────────────────────────────────────────────────────

const ctx = { log, info, ok, warn, chalk, CONFIG_PATH, LOCK_PATH, HOME };

const commands = {
  install:  () => require('./commands/install').run(process.argv.slice(3), ctx),
  login:    () => require('./commands/login').run(process.argv.slice(3), ctx),
  release:  () => require('./commands/release').run(process.argv.slice(3), ctx),
  update:   () => require('./commands/update').run(process.argv.slice(3), ctx),
  search:   () => require('./commands/search').run(process.argv.slice(3), ctx),
  list:     () => require('./commands/list').run(process.argv.slice(3), ctx),
  status:   () => require('./commands/status').run(process.argv.slice(3), ctx),
  help:     () => require('./commands/help').run(process.argv.slice(3), ctx),
};

// ── Version ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args[0] === '--version' || args[0] === '-v') {
  try {
    const version = require('../../package.json').version;
    log(`LessLS CLI v${version}`);
  } catch {
    log('LessLS CLI v0.1.0');
  }
  process.exit(0);
}

// ── Main ──────────────────────────────────────────────────────────────────────

const cmd = args[0];

if (args.length === 0) {
  commands.help();
} else {
  const cmd = args[0];
  const handler = commands[cmd];
  if (handler) {
    handler();
  } else {
    warn(`未知指令: ${cmd}`);
    commands.help();
  }
}
