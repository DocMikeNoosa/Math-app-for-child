// Production build (code protection): bundles the browser app into one file, minifies it and
// obfuscates it, so the source code, comments and structure are not readable in the browser.
// Output: dist/app (the dictation app, served only to logged-in users) and dist/site (public pages).
// Server-side code (AI instructions, billing, database) never leaves the server in any case.
import { build } from 'esbuild';
import JavaScriptObfuscator from 'javascript-obfuscator';
import { cp, mkdir, rm, readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUB = path.join(ROOT, 'public');
const DIST = path.join(ROOT, 'dist');
const OBFUSCATE = process.env.NO_OBFUSCATE !== '1';

const obfuscatorOptions = {
  compact: true,
  controlFlowFlattening: false, // keeps the app fast (dictation is latency-sensitive)
  deadCodeInjection: false,
  identifierNamesGenerator: 'hexadecimal',
  renameGlobals: false,
  selfDefending: false,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.75,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  splitStrings: false,
  transformObjectKeys: false,
  unicodeEscapeSequence: false,
  sourceMap: false,
};

async function bundle(entry, outfile) {
  const r = await build({ entryPoints: [entry], bundle: true, format: 'esm', target: 'es2022', minify: true, legalComments: 'none', write: false, sourcemap: false, charset: 'utf8' });
  let code = r.outputFiles[0].text;
  if (OBFUSCATE) code = JavaScriptObfuscator.obfuscate(code, obfuscatorOptions).getObfuscatedCode();
  await mkdir(path.dirname(outfile), { recursive: true });
  await writeFile(outfile, code);
  return code.length;
}

async function minifyCss(file, out) {
  const r = await build({ entryPoints: [file], bundle: false, minify: true, write: false, loader: { '.css': 'css' } });
  await writeFile(out, r.outputFiles[0].text);
}

const stripComments = (html) => html.replace(/<!--[\s\S]*?-->/g, '').replace(/\n\s*\n+/g, '\n');

await rm(DIST, { recursive: true, force: true });

// ---- the dictation app
const APP = path.join(DIST, 'app');
await mkdir(path.join(APP, 'js'), { recursive: true });
const appSize = await bundle(path.join(PUB, 'js', 'app.js'), path.join(APP, 'js', 'app.js'));
await minifyCss(path.join(PUB, 'styles.css'), path.join(APP, 'styles.css'));
await writeFile(path.join(APP, 'index.html'), stripComments(await readFile(path.join(PUB, 'index.html'), 'utf8')));
await cp(path.join(PUB, 'fonts'), path.join(APP, 'fonts'), { recursive: true });
await cp(path.join(PUB, 'icons'), path.join(APP, 'icons'), { recursive: true });

// ---- public site, account and admin pages
const SITE = path.join(DIST, 'site');
await mkdir(SITE, { recursive: true });
for (const f of await readdir(path.join(PUB, 'site'))) {
  const src = path.join(PUB, 'site', f);
  if (f.endsWith('.html')) await writeFile(path.join(SITE, f), stripComments(await readFile(src, 'utf8')));
  else if (f.endsWith('.css')) await minifyCss(src, path.join(SITE, f));
  else if (f.endsWith('.js') && f !== 'common.js') await bundle(src, path.join(SITE, f));
}
// images of the public website
await cp(path.join(PUB, 'site', 'img'), path.join(SITE, 'img'), { recursive: true }).catch(() => {});

console.log(`Build OK${OBFUSCATE ? ' (obfuscated)' : ''}: dist/app/js/app.js ${(appSize / 1024).toFixed(0)} KB, dist/site`);
