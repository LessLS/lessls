#!/usr/bin/env node
/**
 * Build script — 將 src/ 編譯為 dist/
 *  支援：ESM → ESM（copy + shebang 修正）
 */
import { copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, '..', 'src');
const DIST = join(__dirname, '..', 'dist');

function build() {
  mkdirSync(DIST, { recursive: true });

  // 複製 index.js
  copyFileSync(join(SRC, 'index.js'), join(DIST, 'index.js'));
  console.log('✓ built dist/index.js');

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
