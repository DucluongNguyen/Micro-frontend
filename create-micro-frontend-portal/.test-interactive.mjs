// Test-only harness: spawns the CLI and sends raw keystrokes with a delay
// between each, so it behaves like a human typing in a real terminal.
// Needed because @clack/prompts' `select()` reads raw keypress events
// (arrow keys), not readline lines - piping plain text via
// `printf ... | node bin/index.js` does not work for it at all.
//
// Usage:
//   node .test-interactive.mjs <target-dir> <key1> <key2> ...
//
// Each key is either a literal string to type (e.g. "billing") or one of
// the named keys below (case-insensitive): DOWN, UP, ENTER.
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bin = path.join(__dirname, 'bin', 'index.js');

const KEYS = {
  DOWN: '\x1B[B',
  UP: '\x1B[A',
  ENTER: '\r',
};

const [, , cwd, ...steps] = process.argv;

const child = spawn('node', [bin], { cwd, stdio: ['pipe', 'inherit', 'inherit'] });

(async () => {
  for (const step of steps) {
    await new Promise((r) => setTimeout(r, 250));
    child.stdin.write(KEYS[step.toUpperCase()] ?? step);
  }
  await new Promise((r) => setTimeout(r, 500));
  child.stdin.end();
})();

child.on('exit', (code) => process.exit(code ?? 0));
