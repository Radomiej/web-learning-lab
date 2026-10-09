import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const web = resolve(fileURLToPath(new URL('..', import.meta.url)));
const java = resolve(web, '../java-lab');
const check = process.argv.includes('--check');
const hashes = {};
function sync(dir) {
  for (const entry of readdirSync(join(web, dir), { withFileTypes: true })) {
    const rel = join(dir, entry.name);
    if (entry.isDirectory()) { sync(rel); continue; }
    if (entry.name === 'provenance.json') continue;
    const source = join(web, rel), target = join(java, rel);
    const digest = createHash('sha256').update(readFileSync(source)).digest('hex');
    hashes[rel.replaceAll('\\', '/')] = digest;
    if (check) {
      if (createHash('sha256').update(readFileSync(target)).digest('hex') !== digest) throw new Error(`Out of sync: ${rel}`);
    } else { mkdirSync(resolve(target, '..'), { recursive: true }); copyFileSync(source, target); }
  }
}
sync('shared/lab-game-v2');
sync('public/game-assets');
sync('public/lesson-illustrations');
// Shared GameDev courses and their page previews.
for (const name of ['kurs-gamedev-js', 'kurs-gamedev-js-kamera-ui', 'kurs-gamedev-js-tweeny']) {
  const rel = join('public/courses', name + '.pdf');
  const source = join(web, rel), target = join(java, rel);
  if (check) { if (!readFileSync(source).equals(readFileSync(target))) throw new Error('Out of sync: ' + rel); }
  else { mkdirSync(resolve(target, '..'), { recursive: true }); copyFileSync(source, target); }
  sync(join('public/courses/previews', name));
}
// Public workers must import a file copied into dist, not a development-only URL.
const inputSource=join(web,'shared/lab-game-v2/inputTransport.js');
const inputTarget=join(java,'public/vendor/teavm/input-transport.js');
if(check){if(!readFileSync(inputSource).equals(readFileSync(inputTarget)))throw new Error('Out of sync: TeaVM input transport');}
else{mkdirSync(resolve(inputTarget,'..'),{recursive:true});copyFileSync(inputSource,inputTarget);}
if (!check) {
  const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: web, encoding: 'utf8' }).trim();
  const provenance = JSON.stringify({ apiVersion: 2, source: relative(java, web), revision, dirty: !!execFileSync('git', ['status', '--porcelain'], { cwd: web, encoding: 'utf8' }).trim(), hashes }, null, 2) + '\n';
  for (const repo of [web, java]) writeFileSync(join(repo, 'shared/lab-game-v2/provenance.json'), provenance);
}
console.log(`${check ? 'Verified' : 'Synchronized'} ${Object.keys(hashes).length} files`);
