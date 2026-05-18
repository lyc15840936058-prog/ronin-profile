import { cpSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'dist');
const publicExtensions = new Set([
  '.html',
  '.css',
  '.js',
  '.txt',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.svg',
  '.ico',
]);
const skipFiles = new Set([
  '.DS_Store',
  'AGENTS.md',
  'deploy.sh',
  'package.json',
  'package-lock.json',
  'README.md',
  'vercel.json',
]);
const skipDirs = new Set([
  '.git',
  '.vercel',
  'api',
  'dist',
  'node_modules',
  'scripts',
]);

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

function trackedFiles() {
  try {
    const output = execFileSync('git', ['ls-files', '-z'], { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] });
    return output.toString('utf8').split('\0').filter(Boolean);
  } catch {
    console.warn('git metadata unavailable; falling back to recursive public-file copy');
    return recursivePublicFiles(root);
  }
}

function recursivePublicFiles(fromDir) {
  const files = [];
  for (const entry of readdirSync(fromDir)) {
    if (skipFiles.has(entry) || skipDirs.has(entry)) continue;

    const source = path.join(fromDir, entry);
    const relative = path.relative(root, source);
    const stats = statSync(source);

    if (stats.isDirectory()) {
      files.push(...recursivePublicFiles(source));
      continue;
    }

    if (stats.isFile() && publicExtensions.has(path.extname(entry).toLowerCase())) {
      files.push(relative);
    }
  }
  return files;
}

for (const relative of trackedFiles()) {
  const basename = path.basename(relative);
  if (skipFiles.has(basename)) continue;
  if (relative.startsWith('api/') || relative.startsWith('scripts/')) continue;
  if (!publicExtensions.has(path.extname(relative).toLowerCase())) continue;

  const source = path.join(root, relative);
  const stats = statSync(source);
  if (!stats.isFile()) continue;

  const target = path.join(outDir, relative);
  mkdirSync(path.dirname(target), { recursive: true });
  cpSync(source, target);
  console.log(`copied ${relative}`);
}

console.log(`Static site built at ${path.relative(root, outDir)}`);
