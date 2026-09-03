/**
 * download.js — 通用下載工具
 *
 * 支援：
 *   - GitHub releases asset 下載
 *   - 一般 HTTP/HTTPS 檔案下載
 *   - pkg-bundled exe 可直接執行
 */
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

/**
 * 下載檔案到目標路徑
 * @param {string} url - 下載網址
 * @param {string} dest - 目標檔案路徑
 * @param {object} options - { headers, progress }
 */
function download(url, dest, options = {}) {
  return new Promise((resolve, reject) => {
    const { headers = {}, progress } = options;

    const parsedUrl = new URL(url);
    const mod = parsedUrl.protocol === 'https:' ? https : http;

    const req = mod.get(url, { headers }, (res) => {
      // 處理 redirect
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(download(res.headers.location, dest, options));
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`下載失敗：HTTP ${res.statusCode}`));
        return;
      }

      // 創建目標目錄
      fs.mkdirSync(path.dirname(dest), { recursive: true });

      const chunks = [];
      let received = 0;
      const total = parseInt(res.headers['content-length'], 10) || 0;

      res.on('data', (chunk) => {
        chunks.push(chunk);
        received += chunk.length;
        if (progress && total > 0) {
          progress(Math.round((received / total) * 100));
        }
      });

      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        fs.writeFileSync(dest, buffer);
        resolve({ size: buffer.length, path: dest });
      });
    });

    req.on('error', reject);
    req.setTimeout(60000, () => {
      req.destroy();
      reject(new Error('下載逾時（60秒）'));
    });
  });
}

/**
 * 取得 GitHub release asset 下載網址
 * @param {string} repo - owner/repo
 * @param {string} tag - 版本標籤（如 v0.1.0）
 * @param {string} assetName - asset 檔名（如 lessls.exe）
 */
async function getGithubReleaseAsset(repo, tag, assetName) {
  const res = await fetch(`https://api.github.com/repos/${repo}/releases/tags/${tag}`);
  if (!res.ok) throw new Error(`無法取得 release ${tag}（HTTP ${res.status})`);
  const release = await res.json();

  const asset = release.assets?.find(a => a.name === assetName);
  if (!asset) {
    const names = release.assets?.map(a => a.name).join(', ') || '無';
    throw new Error(`找不到 asset: ${assetName}（可用: ${names}）`);
  }
  return asset.browser_download_url;
}

/**
 * 上傳檔案到 GitHub release
 * @param {string} repo - owner/repo
 * @param {string} tag - 版本標籤
 * @param {string} localPath - 本機檔案路徑
 * @param {string} assetName - asset 檔名
 * @param {string} token - GitHub PAT
 */
async function uploadToGithubRelease(repo, tag, localPath, assetName, token) {
  const fileSize = fs.statSync(localPath).size;
  const file = fs.createReadStream(localPath);
  const uploadUrl = `https://uploads.github.com/repos/${repo}/releases/latest/assets?name=${encodeURIComponent(assetName)}`;

  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(uploadUrl);
    const req = https.request({
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': fileSize,
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`上傳失敗：HTTP ${res.statusCode} ${data}`));
        }
      });
    });
    req.on('error', reject);
    file.pipe(req);
  });
}

module.exports = { download, getGithubReleaseAsset, uploadToGithubRelease };
