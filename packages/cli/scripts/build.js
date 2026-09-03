#!/usr/bin/env node
/**
 * Build script — 將 src/ 編譯為 dist/
 */
const { copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } = require('fs');
const { join, dirname } = require('path');

const SRC = join(__dirname, '..', 'src');
const DIST = join(__dirname, '..', 'dist');

function build() {
  mkdirSync(DIST, { recursive: true });

  // 複製 index.js
  copyFileSync(join(SRC, 'index.js'), join(DIST, 'index.js'));
  console.log('✓ built dist/index.js');

  // 複製 config.js
  copyFileSync(join(SRC, 'config.js'), join(DIST, 'config.js'));
  console.log('✓ built dist/config.js');

  // 複製 download.js
  copyFileSync(join(SRC, 'download.js'), join(DIST, 'download.js'));
  console.log('✓ built dist/download.js');

  // 複製所有 commands
  const cmdDir = join(SRC, 'commands');
  if (existsSync(cmdDir)) {
    for (const file of readdirSync(cmdDir)) {
      if (file.endsWith('.js')) {
        const src = readFileSync(join(cmdDir, file), 'utf8');
        const dst = join(DIST, 'commands', file);
        mkdirSync(dirname(dst), { recursive: true });
        writeFileSync(dst, src, 'utf8');
        console.log(`✓ built commands/${file}`);
      }
    }
  }

  console.log('✓ build complete');
}

build();
