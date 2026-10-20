#!/usr/bin/env node
/**
 * 取 B 站视频的元信息 + 封面 + 视频快照（sprite），用于帧级统计。
 *
 * 用法:
 *   node bilibili_sprite.js BV1k9H761ERK [BV1ZcaDziE5R ...] --out <目录>
 *
 * 只读接口，不下载完整视频:
 *   /x/web-interface/view          -> 标题/时长/封面/cid
 *   /x/player/videoshot?index=1    -> 10x10 帧网格 jpg
 *
 * 抽帧后交给 tools/analyze_frames.py 统计。
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const HDRS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
  Referer: 'https://www.bilibili.com/',
  Accept: 'application/json, text/plain, */*',
};

function getBuf(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: HDRS }, (r) => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
        const next = new URL(r.headers.location, url).toString();
        r.resume();
        return getBuf(next).then(resolve, reject);
      }
      const chunks = [];
      r.on('data', (c) => chunks.push(c));
      r.on('end', () => resolve({ status: r.statusCode, body: Buffer.concat(chunks) }));
    });
    req.on('error', reject);
    req.setTimeout(30000, () => req.destroy(new Error('timeout')));
  });
}

const httpsify = (u) => (!u ? u : u.startsWith('//') ? 'https:' + u : u.replace(/^http:/, 'https:'));

async function main() {
  const argv = process.argv.slice(2);
  let outDir = '.';
  const bvids = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--out') outDir = argv[++i];
    else bvids.push(argv[i]);
  }
  if (!bvids.length) {
    console.log('usage: node bilibili_sprite.js BV1xxx [BV1yyy ...] --out <dir>');
    process.exit(2);
  }
  fs.mkdirSync(outDir, { recursive: true });

  const meta = [];
  for (const bvid of bvids) {
    const r = await getBuf(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`);
    const j = JSON.parse(r.body.toString('utf8'));
    if (j.code !== 0) {
      console.log('VIEW FAIL', bvid, j.code, j.message);
      continue;
    }
    const d = j.data;
    meta.push({
      bvid,
      title: d.title,
      duration: d.duration,
      cid: d.cid,
      pic: d.pic,
      dimension: d.dimension,
      owner: d.owner && d.owner.name,
    });
    console.log(`\n${bvid}  ${d.title}`);
    console.log(`  ${d.duration}s  ${d.dimension.width}x${d.dimension.height}  by ${d.owner && d.owner.name}`);

    if (d.pic) {
      try {
        const c = await getBuf(httpsify(d.pic));
        if (c.status === 200) fs.writeFileSync(path.join(outDir, `${bvid}_cover.jpg`), c.body);
      } catch (e) {
        console.log('  cover fail', e.message);
      }
    }

    const vs = await getBuf(
      `https://api.bilibili.com/x/player/videoshot?bvid=${bvid}&cid=${d.cid}&index=1`
    );
    const vj = JSON.parse(vs.body.toString('utf8'));
    if (vj.code !== 0 || !vj.data) {
      console.log('  videoshot fail', vj.code, vj.message);
      continue;
    }
    const pages = vj.data.image || [];
    console.log(`  sprite pages: ${pages.length}`);
    for (let i = 0; i < pages.length; i++) {
      const url = httpsify(pages[i]);
      const name = `${bvid}_p${String(i + 1).padStart(2, '0')}.jpg`;
      try {
        const r2 = await getBuf(url);
        if (r2.status === 200) fs.writeFileSync(path.join(outDir, name), r2.body);
      } catch (e) {
        console.log('  sprite fail', i + 1, e.message);
      }
    }
  }

  fs.writeFileSync(path.join(outDir, 'meta.json'), JSON.stringify(meta, null, 2), 'utf8');
  console.log(`\n done. ${meta.length} videos -> ${outDir}`);
  console.log(` next: python tools/analyze_frames.py "${outDir}"`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
