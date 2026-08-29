#!/usr/bin/env node
/**
 * postinstall — 建立 ~/.lessls 目錄與 starter config
 */
const { mkdirSync, writeFileSync, existsSync } = require('fs');
const { join } = require('path');

const HOME = process.env.HOME || process.env.USERPROFILE || '';
const LESSLS_DIR = join(HOME, '.lessls');

if (!existsSync(LESSLS_DIR)) {
  mkdirSync(LESSLS_DIR, { recursive: true });
  console.log(`Created ${LESSLS_DIR}`);
}

const configPath = join(LESSLS_DIR, 'config.json');
if (!existsSync(configPath)) {
  writeFileSync(configPath, JSON.stringify({
    user: 'anonymous',
    token: '',
    registry: 'https://registry.lessls.org',
    installedAt: new Date().toISOString(),
  }, null, 2), 'utf8');
  console.log('Created ~/.lessls/config.json');
}
