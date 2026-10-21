// dist-single/index.html(한 파일로 묶인 빌드)을 공유 미리보기 페이지 형식으로 바꾼다.
// 미리보기 호스트가 <!doctype>/<html>/<head>/<body>를 감싸 주므로 그 태그들을 벗겨 낸다.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(resolve(root, 'dist-single/index.html'), 'utf8');

const head = src.match(/<head>([\s\S]*?)<\/head>/i)?.[1] ?? '';
const body = src.match(/<body>([\s\S]*?)<\/body>/i)?.[1] ?? '';

const pick = (re) => [...head.matchAll(re)].map((m) => m[0]);
const title = pick(/<title>[\s\S]*?<\/title>/gi);
const metas = pick(/<meta\s+name="(?:claude:viewport-fit-sides|description)"[^>]*>/gi);
const links = pick(/<link\s[^>]*>/gi);
const styles = pick(/<style[\s\S]*?<\/style>/gi);
const scripts = pick(/<script[\s\S]*?<\/script>/gi);

const out = [...title, ...metas, ...links, ...styles, body.trim(), ...scripts].join('\n');

mkdirSync(resolve(root, 'artifact'), { recursive: true });
writeFileSync(resolve(root, 'artifact/recess-demo.html'), out);
console.log(`artifact/recess-demo.html  ${(out.length / 1024).toFixed(1)} KB`);
