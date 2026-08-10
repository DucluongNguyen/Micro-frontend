#!/usr/bin/env node
// Scaffolds either:
//   1) the full micro-frontend-portal template (container + dashboard +
//      about + contact), or
//   2) a single new remote, copied from the `dashboard` remote's template
//      (same content/structure, just renamed) - for adding one more remote
//      to a project that already exists.
//
// Interactive UI (arrow-key select menus, boxed "next steps") via
// @clack/prompts - the same library create-vite uses for its
// `npx create-vite` flow.
//
// Usage:
//   npm create @luongduc96/react-micro-frontend@latest [target-dir]
//   npm create @luongduc96/react-micro-frontend@latest -- --remote <name> [target-dir]
//   npx @luongduc96/create-react-micro-frontend@latest [target-dir]

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as p from '@clack/prompts';
import pc from 'picocolors';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = path.join(__dirname, '..', 'template');
const APPS = ['container', 'dashboard', 'about', 'contact'];
// The "remote" mode copies this app's template as-is (pages, navigation,
// everything) and only renames the handful of files that identify it as
// "Dashboard" specifically - see scaffoldRemote() below.
const REMOTE_TEMPLATE_APP = 'dashboard';

async function main() {
  const { positional, remoteFlag } = parseArgs(process.argv.slice(2));

  p.intro('create-react-micro-frontend');

  const mode = remoteFlag !== undefined ? 'remote' : await promptMode();

  if (mode === 'remote') {
    const remoteName = remoteFlag || (await promptRemoteName());
    await scaffoldRemote(remoteName, positional);
  } else {
    await scaffoldFullPortal(positional);
  }
}

function parseArgs(argv) {
  let remoteFlag;
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--remote') {
      remoteFlag = argv[i + 1];
      i++;
    } else if (arg.startsWith('--remote=')) {
      remoteFlag = arg.slice('--remote='.length);
    } else {
      rest.push(arg);
    }
  }
  return { positional: rest[0], remoteFlag };
}

function exitOnCancel(value) {
  if (p.isCancel(value)) {
    p.cancel('Đã huỷ.');
    process.exit(0);
  }
  return value;
}

// Pre-color each option's label (like create-vite's framework picker does
// with picocolors) rather than leaving @clack/prompts' default styling.
// `select()` already renders the focused option's label as-is and dims
// every other option's label automatically - see the `a ? n : e.dim(n)`
// branch in @clack/prompts' own select renderer - so coloring the label
// string up front is all that's needed to get the same "each choice has
// its own color, unfocused ones show a dimmed version of it" look.
async function promptMode() {
  const mode = await p.select({
    message: 'Bạn muốn tạo gì?',
    options: [
      {
        value: 'full',
        label: pc.yellow('micro-frontend'),
        hint: 'toàn bộ portal (container + dashboard + about + contact)',
      },
      {
        value: 'remote',
        label: pc.green('remote'),
        hint: 'một remote mới, nội dung giống Dashboard',
      },
    ],
  });
  return exitOnCancel(mode);
}

async function promptRemoteName() {
  const value = await p.text({
    message: 'Tên remote:',
    placeholder: 'billing',
    validate: (val) => {
      if (!val || !val.trim()) return 'Tên remote không được để trống.';
    },
  });
  return exitOnCancel(value);
}

// --- mode 1: full portal -----------------------------------------------

async function scaffoldFullPortal(targetArg) {
  let dirName = targetArg;
  if (dirName === undefined) {
    const value = await p.text({
      message: 'Tên thư mục project:',
      placeholder: 'micro-frontend-portal',
      defaultValue: 'micro-frontend-portal',
    });
    dirName = exitOnCancel(value) || 'micro-frontend-portal';
  }

  const root = await ensureTargetDir(dirName);
  const projectName = path.basename(root);

  const s = p.spinner();
  s.start('Đang tạo project...');
  fs.cpSync(TEMPLATE_DIR, root, { recursive: true });
  // Give each app's package.json a name derived from the target directory
  // instead of leaving every scaffolded project stuck with the template's
  // own internal names (container-base, about-remote, ...).
  for (const app of APPS) {
    renamePackageJsonName(path.join(root, app), `${projectName}-${app}`);
  }
  s.stop('Đã tạo project.');

  const steps = [
    `cd ${dirName}`,
    ...APPS.map((app) => `cd ${app} && npm install && cd ..`),
    './start-all.sh',
  ].join('\n');
  p.note(steps, 'Tiếp theo');
  p.outro(`Xong! Xem README.md trong ./${dirName} để biết chi tiết (ports, env, deploy).`);
}

// --- mode 2: single remote ----------------------------------------------

async function scaffoldRemote(remoteName, targetArg) {
  const slug = slugify(remoteName);
  if (!slug) {
    p.cancel(`Tên remote "${remoteName}" không hợp lệ.`);
    process.exit(1);
  }
  const dirName = targetArg ?? slug;
  const root = await ensureTargetDir(dirName);
  const federationName = pascalCase(remoteName);

  const s = p.spinner();
  s.start(`Đang tạo remote "${federationName}"...`);
  const remoteTemplateDir = path.join(TEMPLATE_DIR, REMOTE_TEMPLATE_APP);
  fs.cpSync(remoteTemplateDir, root, { recursive: true });
  renamePackageJsonName(root, `${slug}-remote`);
  renameFederationName(root, federationName);
  renameHtmlTitle(root, federationName);
  const port = readStartPort(root);
  s.stop(`Đã tạo remote "${federationName}".`);

  const steps = [`cd ${dirName} && npm install && npm start`, ''];
  if (port) {
    steps.push(
      `Mặc định chạy ở port ${port} (giống template Dashboard) - đổi trong package.json`,
      '("start" script) và rspack.config.ts ("devServer.port") nếu bị trùng với remote khác.',
      '',
    );
  }
  steps.push(
    'Để ghép vào một container đã có sẵn, xem mục "Adding another remote" trong',
    'container/README.md của project đó - cần thêm:',
    '  1. Một entry vào REMOTE_DEFINITIONS (module-federation.config.ts)',
    `  2. Biến URL_HOST_${federationName.toUpperCase()} trong .env.development / .env.production`,
    `  3. Một \`declare module '${federationName}/App'\` trong src/types/remotes.d.ts`,
    `  4. Một route mounted tại /${slug}/* trong src/router/routes.tsx`,
    '  5. Một entry vào REMOTES trong src/hooks/useRemoteNavigation.ts',
  );
  p.note(steps.join('\n'), 'Tiếp theo');
  p.outro(`Xong! Remote "${federationName}" đã sẵn sàng tại ./${dirName}.`);
}

// Federation `name` is what the container's `remotes` map keys off of
// (`import('Dashboard/App')` etc.) and what module-federation.config.ts
// registers via `name: 'Dashboard'` - see the comment there. Keep this in
// PascalCase to match the convention the other remotes (Dashboard, About,
// Contact) already use.
function renameFederationName(remoteDir, federationName) {
  const configPath = path.join(remoteDir, 'module-federation.config.ts');
  if (!fs.existsSync(configPath)) return;
  const content = fs.readFileSync(configPath, 'utf8');
  const updated = content.replace(/(name:\s*')Dashboard(')/, `$1${federationName}$2`);
  fs.writeFileSync(configPath, updated);
}

function renameHtmlTitle(remoteDir, federationName) {
  const htmlPath = path.join(remoteDir, 'src', 'index.html');
  if (!fs.existsSync(htmlPath)) return;
  const content = fs.readFileSync(htmlPath, 'utf8');
  const updated = content.replace(/<title>[^<]*<\/title>/, `<title>${federationName} (standalone dev)</title>`);
  fs.writeFileSync(htmlPath, updated);
}

function readStartPort(remoteDir) {
  const pkgPath = path.join(remoteDir, 'package.json');
  if (!fs.existsSync(pkgPath)) return undefined;
  const match = fs.readFileSync(pkgPath, 'utf8').match(/--port[= ](\d+)/);
  return match?.[1];
}

// --- shared helpers -------------------------------------------------------

// Mirrors create-vite's own "target directory is not empty" flow: prompts
// for how to proceed instead of just failing, but only when there's an
// actual human to answer (a TTY) - a non-interactive run (CI, or our
// `--remote` flag used for scripted tests) fails fast instead of hanging
// on a prompt nobody can see.
async function ensureTargetDir(dirName) {
  const root = path.resolve(process.cwd(), dirName);
  if (fs.existsSync(root) && fs.readdirSync(root).length > 0) {
    if (!process.stdin.isTTY) {
      p.cancel(`"${dirName}" đã tồn tại và không rỗng.`);
      process.exit(1);
    }
    const action = await p.select({
      message: `Thư mục "${dirName}" đã có sẵn file. Bạn muốn:`,
      options: [
        { value: 'overwrite', label: 'Xoá hết và tiếp tục' },
        { value: 'cancel', label: 'Huỷ' },
      ],
    });
    exitOnCancel(action);
    if (action === 'cancel') {
      p.cancel('Đã huỷ.');
      process.exit(0);
    }
    fs.rmSync(root, { recursive: true, force: true });
  }
  fs.mkdirSync(root, { recursive: true });
  return root;
}

function renamePackageJsonName(dir, newName) {
  const pkgPath = path.join(dir, 'package.json');
  if (!fs.existsSync(pkgPath)) return;
  const content = fs.readFileSync(pkgPath, 'utf8');
  // Regex replace (not JSON.parse -> JSON.stringify) so the rest of the
  // file's formatting/key order is left untouched.
  const updated = content.replace(/^(\s*"name":\s*")[^"]*(")/m, `$1${newName}$2`);
  fs.writeFileSync(pkgPath, updated);
}

function slugify(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function pascalCase(name) {
  return name
    .trim()
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('');
}

main().catch((err) => {
  p.cancel('Có lỗi xảy ra.');
  console.error(err);
  process.exit(1);
});
