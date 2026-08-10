#!/usr/bin/env node
// Wires a freshly scaffolded remote into this project - the 5 manual steps
// `npm create micro-fe -- --remote <name>` prints out at the end, automated:
//   1. REMOTE_DEFINITIONS entry in container/module-federation.config.ts
//   2. URL_HOST_<NAME> in container/.env.development + .env.production
//   3. `declare module '<Name>/App'` + `'<Name>/navigation'` in
//      container/src/types/remotes.d.ts
//   4. Route mounted at /<slug>/* in container/src/router/routes.tsx
//   5. Entry in REMOTES in container/src/hooks/useRemoteNavigation.ts
// ...plus what the CLI doesn't touch:
//   6. A free dev port, patched into the remote's own package.json/rspack.config.ts
//      (the template always ships port 3009, same as `dashboard` - guaranteed
//      to collide the moment both run together)
//   7. start-all.sh, so it starts the new remote alongside everything else
//
// Usage (run from the project root, after scaffolding the remote there):
//   npm create micro-fe -- --remote billing     # creates ./billing
//   node sync-remote.mjs billing
//
// Safe to re-run: every step checks whether it's already been applied and
// skips instead of duplicating.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CONTAINER_DIR = path.join(ROOT, 'container');
const START_ALL = path.join(ROOT, 'start-all.sh');

function fail(msg) {
  console.error(`\nLỗi: ${msg}\n`);
  process.exit(1);
}

function rel(p) {
  return path.relative(ROOT, p);
}

function readFile(p) {
  return fs.readFileSync(p, 'utf8');
}

function writeFile(p, content) {
  fs.writeFileSync(p, content);
}

// Inserts `insertion` right after the first occurrence of `anchor`. Skips
// (no-op) if `marker` is already present, so running this script twice for
// the same remote doesn't duplicate entries.
//
// `marker` can be a plain string (substring check) or a RegExp. Use a RegExp
// when a plain substring could also match a *commented-out* example line -
// e.g. module-federation.config.ts ships with `// { key: 'Info', ... }` as
// a placeholder, and a naive `content.includes("key: 'Info'")` would match
// that comment and wrongly report "already there", silently skipping the
// real (uncommented) insertion forever. A line-anchored RegExp like
// `/^\s*\{\s*key: 'Info'/m` only matches an active line, since a commented
// line has `//` before the `{` and fails that anchor.
function insertAfterAnchor(filePath, anchor, insertion, marker) {
  if (!fs.existsSync(filePath)) {
    console.warn(`  [!] Không tìm thấy ${rel(filePath)} - bỏ qua, tự thêm tay.`);
    return;
  }
  let content = readFile(filePath);
  const alreadyPresent = marker instanceof RegExp ? marker.test(content) : content.includes(marker);
  if (alreadyPresent) {
    console.log(`  [skip] ${rel(filePath)} - đã có rồi.`);
    return;
  }
  if (!content.includes(anchor)) {
    console.warn(`  [!] Không tìm thấy điểm neo trong ${rel(filePath)} - bỏ qua, tự thêm tay.`);
    return;
  }
  content = content.replace(anchor, anchor + insertion);
  writeFile(filePath, content);
  console.log(`  [ok] ${rel(filePath)}`);
}

// Like appendLineIfMissing, but if a line matching `keyRegex` already exists
// it gets *overwritten* with `line` instead of being left untouched. Needed
// for the env var lines: the remote's dev port can be reassigned by step 0
// on a later run (e.g. it now collides with a newly added remote), and a
// pure "append if missing" would leave the env file pointing at the remote's
// stale, no-longer-correct port forever since the var already "exists".
function upsertLine(filePath, keyRegex, line) {
  if (!fs.existsSync(filePath)) {
    console.warn(`  [!] Không tìm thấy ${rel(filePath)} - bỏ qua, tự thêm tay.`);
    return;
  }
  const content = readFile(filePath);
  if (keyRegex.test(content)) {
    const updated = content.replace(keyRegex, line);
    if (updated === content) {
      console.log(`  [skip] ${rel(filePath)} - đã đúng rồi.`);
    } else {
      writeFile(filePath, updated);
      console.log(`  [ok] ${rel(filePath)} - đã cập nhật port.`);
    }
    return;
  }
  let next = content;
  if (!next.endsWith('\n')) next += '\n';
  next += `${line}\n`;
  writeFile(filePath, next);
  console.log(`  [ok] ${rel(filePath)}`);
}

function patchRegex(filePath, regex, replacement, label) {
  if (!fs.existsSync(filePath)) {
    console.warn(`  [!] Không tìm thấy ${rel(filePath)} - bỏ qua, tự sửa tay.`);
    return;
  }
  const content = readFile(filePath);
  if (!regex.test(content)) {
    console.warn(`  [!] Không khớp pattern trong ${rel(filePath)} (${label}) - bỏ qua, tự sửa tay.`);
    return;
  }
  writeFile(filePath, content.replace(regex, replacement));
  console.log(`  [ok] ${rel(filePath)} (${label})`);
}

function pascalToSlug(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

// --- parse args + sanity checks -------------------------------------------

const remoteFolder = process.argv[2];
if (!remoteFolder) {
  fail('Thiếu tên thư mục remote.\n\nUsage: node sync-remote.mjs <remote-folder>');
}

const remoteDir = path.resolve(ROOT, remoteFolder);
if (!fs.existsSync(remoteDir)) {
  fail(`Không tìm thấy thư mục "${remoteFolder}" tại ${ROOT}.`);
}
if (!fs.existsSync(CONTAINER_DIR)) {
  fail('Không tìm thấy thư mục container - script này phải chạy từ gốc project.');
}

const mfConfigPath = path.join(remoteDir, 'module-federation.config.ts');
if (!fs.existsSync(mfConfigPath)) {
  fail(`Không tìm thấy ${rel(mfConfigPath)} - "${remoteFolder}" có phải remote hợp lệ không?`);
}
const federationNameMatch = readFile(mfConfigPath).match(/name:\s*'([^']+)'/);
if (!federationNameMatch) {
  fail(`Không đọc được "name" trong ${rel(mfConfigPath)}.`);
}
const federationName = federationNameMatch[1];
const slug = pascalToSlug(federationName);
const envVar = `URL_HOST_${federationName.toUpperCase()}`;

console.log(`\nĐồng bộ remote "${federationName}" (./${remoteFolder}, mount tại /${slug}/*)...\n`);

// --- 0. Gán port trống cho remote (template mặc định luôn là 3009) -------

// Maps app-folder-name -> port, read from each folder's own package.json
// "start" script (the source of truth - rspack.config.ts's devServer.port
// is kept in sync with it by this same script, see below).
function findUsedPorts() {
  const ports = {};
  for (const entry of fs.readdirSync(ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const pkgPath = path.join(ROOT, entry.name, 'package.json');
    if (!fs.existsSync(pkgPath)) continue;
    const match = readFile(pkgPath).match(/--port[= ](\d+)/);
    if (match) ports[entry.name] = Number(match[1]);
  }
  return ports;
}

const usedPorts = findUsedPorts();
const allPortValues = Object.values(usedPorts);
const remoteOwnPort = usedPorts[remoteFolder];
// Re-running this script shouldn't keep bumping the port every time - only
// (re)assign one if the remote doesn't have a port yet, or its current one
// collides with another app (e.g. it's still on the template's default
// 3009, same as `dashboard`).
const isColliding = remoteOwnPort !== undefined && allPortValues.filter((p) => p === remoteOwnPort).length > 1;

console.log('0. Gán port cho remote');
if (remoteOwnPort !== undefined && !isColliding) {
  console.log(`  [skip] Port ${remoteOwnPort} đã là của riêng "${remoteFolder}", không đổi.`);
} else {
  const otherPorts = allPortValues.filter((_, i) => Object.keys(usedPorts)[i] !== remoteFolder);
  const newPort = otherPorts.length > 0 ? Math.max(...otherPorts) + 1 : 3012;
  console.log(`  Port ${remoteOwnPort ?? '(chưa có)'} bị trùng với remote khác -> đổi sang ${newPort}.`);
  patchRegex(
    path.join(remoteDir, 'package.json'),
    /--port[= ]\d+/,
    `--port ${newPort}`,
    'start script port',
  );
  patchRegex(
    path.join(remoteDir, 'rspack.config.ts'),
    /port:\s*\d+,/,
    `port: ${newPort},`,
    'devServer.port',
  );
}

// Read back whatever port the remote actually ends up with (whether step 0
// just assigned it or left an existing one untouched), so every later step
// that needs the port - the env files below - uses the same value instead
// of a variable that only existed inside the branch above.
const currentPortMatch = readFile(path.join(remoteDir, 'package.json')).match(/--port[= ](\d+)/);
const remotePort = currentPortMatch ? currentPortMatch[1] : 'PORT';

// --- 1. module-federation.config.ts: REMOTE_DEFINITIONS -------------------

console.log('\n1. REMOTE_DEFINITIONS (container/module-federation.config.ts)');
insertAfterAnchor(
  path.join(CONTAINER_DIR, 'module-federation.config.ts'),
  `  { key: 'Contact', envVar: 'URL_HOST_CONTACT' },`,
  `\n  { key: '${federationName}', envVar: '${envVar}' },`,
  // Line-anchored: only matches an *active* entry, not a commented-out
  // example placeholder like `// { key: 'Info', ... }` - see the comment
  // on insertAfterAnchor above.
  new RegExp(`^\\s*\\{\\s*key:\\s*'${federationName}'`, 'm'),
);

// --- 2. .env.development / .env.production ---------------------------------

console.log('\n2. Env vars (container/.env.development, .env.production)');
upsertLine(
  path.join(CONTAINER_DIR, '.env.development'),
  new RegExp(`^${envVar}=.*$`, 'm'),
  `${envVar}=${federationName}@http://localhost:${remotePort}/remoteEntry.js`,
);
upsertLine(
  path.join(CONTAINER_DIR, '.env.production'),
  new RegExp(`^${envVar}=.*$`, 'm'),
  `${envVar}=${federationName}@https://${slug}.example.com/remoteEntry.js`,
);

// --- 3. src/types/remotes.d.ts: typed contract -----------------------------

console.log('\n3. Typed contract (container/src/types/remotes.d.ts)');
insertAfterAnchor(
  path.join(CONTAINER_DIR, 'src/types/remotes.d.ts'),
  `declare module 'Contact/App' {
  export interface RemoteAppProps {
    theme?: import('antd').ThemeConfig;
  }

  const RemoteApp: React.ComponentType<RemoteAppProps>;
  export default RemoteApp;
}`,
  `

/**
 * Same contract shape as Dashboard, exposed from ../${remoteFolder}/src/App.tsx.
 */
declare module '${federationName}/App' {
  export interface RemoteAppProps {
    theme?: import('antd').ThemeConfig;
  }

  const RemoteApp: React.ComponentType<RemoteAppProps>;
  export default RemoteApp;
}`,
  new RegExp(`^declare module '${federationName}/App'`, 'm'),
);
insertAfterAnchor(
  path.join(CONTAINER_DIR, 'src/types/remotes.d.ts'),
  `declare module 'Contact/navigation' {
  export interface RemoteNavItem {
    path: string;
    label: string;
    icon?: string;
  }
  export const navigation: RemoteNavItem[];
}`,
  `

declare module '${federationName}/navigation' {
  export interface RemoteNavItem {
    path: string;
    label: string;
    icon?: string;
  }
  export const navigation: RemoteNavItem[];
}`,
  new RegExp(`^declare module '${federationName}/navigation'`, 'm'),
);

// --- 4. src/router/routes.tsx: lazy import + route -------------------------

console.log('\n4. Route (container/src/router/routes.tsx)');
insertAfterAnchor(
  path.join(CONTAINER_DIR, 'src/router/routes.tsx'),
  `const ContactApp = lazy(() => import('Contact/App'));`,
  `\nconst ${federationName}App = lazy(() => import('${federationName}/App'));`,
  new RegExp(`^const ${federationName}App = lazy`, 'm'),
);
insertAfterAnchor(
  path.join(CONTAINER_DIR, 'src/router/routes.tsx'),
  `          {
            path: '/contact/*',
            element: (
              <RemoteBoundary>
                <ContactApp />
              </RemoteBoundary>
            ),
          },`,
  `
          {
            path: '/${slug}/*',
            element: (
              <RemoteBoundary>
                <${federationName}App />
              </RemoteBoundary>
            ),
          },`,
  new RegExp(`^\\s*path:\\s*'/${slug}/\\*'`, 'm'),
);

// --- 5. src/hooks/useRemoteNavigation.ts: sidebar entry ---------------------

console.log('\n5. Sidebar entry (container/src/hooks/useRemoteNavigation.ts)');
insertAfterAnchor(
  path.join(CONTAINER_DIR, 'src/hooks/useRemoteNavigation.ts'),
  `  {
    key: 'Contact',
    mountPath: '/contact',
    label: 'Contact',
    importNavigation: () => import('Contact/navigation'),
  },`,
  `
  {
    key: '${federationName}',
    mountPath: '/${slug}',
    label: '${federationName}',
    importNavigation: () => import('${federationName}/navigation'),
  },`,
  new RegExp(`^\\s*key:\\s*'${federationName}',\\n\\s*mountPath:\\s*'/${slug}'`, 'm'),
);

// --- 6. start-all.sh: run alongside everything else -------------------------

console.log('\n6. start-all.sh');
const COLOR_PALETTE = [
  ['35', 'magenta'],
  ['36', 'cyan'],
  ['33', 'yellow'],
  ['32', 'green'],
  ['34', 'blue'],
  ['31', 'red'],
  ['95', 'bright magenta'],
  ['96', 'bright cyan'],
  ['93', 'bright yellow'],
  ['92', 'bright green'],
];

if (!fs.existsSync(START_ALL)) {
  console.warn(`  [!] Không tìm thấy ${rel(START_ALL)} - bỏ qua, tự thêm tay.`);
} else {
  let content = readFile(START_ALL);
  if (content.includes(`"${remoteFolder}"`)) {
    console.log(`  [skip] ${rel(START_ALL)} - đã có rồi.`);
  } else {
    const appsMatch = content.match(/^APPS=\(([^)]*)\)/m);
    const colorsMatch = content.match(/^COLORS=\(([^)]*)\)(.*)$/m);
    if (!appsMatch || !colorsMatch) {
      console.warn(`  [!] Không đọc được APPS=(...) / COLORS=(...) trong ${rel(START_ALL)} - bỏ qua, tự thêm tay.`);
    } else {
      const usedColors = new Set([...colorsMatch[1].matchAll(/"(\d+)"/g)].map((m) => m[1]));
      const nextColor = COLOR_PALETTE.find(([code]) => !usedColors.has(code)) ?? COLOR_PALETTE[0];
      const usedNames = colorsMatch[2].replace(/^\s*#\s*/, '').split(',').map((s) => s.trim()).filter(Boolean);

      content = content.replace(appsMatch[0], `APPS=(${appsMatch[1]} "${remoteFolder}")`);
      content = content.replace(
        colorsMatch[0],
        `COLORS=(${colorsMatch[1]} "${nextColor[0]}")   # ${[...usedNames, nextColor[1]].join(', ')}`,
      );
      writeFile(START_ALL, content);
      console.log(`  [ok] ${rel(START_ALL)} (màu: ${nextColor[1]})`);
    }
  }
}

// --- done --------------------------------------------------------------

console.log(`\nXong. Tiếp theo:\n`);
console.log(`  cd ${remoteFolder} && npm install && cd ..`);
console.log(`  ./start-all.sh   # giờ chạy cả "${federationName}" ở port ${remotePort}\n`);
