import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const nextCli = require.resolve('next/dist/bin/next');
const wasmDirectory = path.dirname(
  require.resolve('@next/swc-wasm-nodejs/package.json'),
);

// This Windows ARM64 workstation blocks downloaded native .node binaries via
// Application Control. Webpack supports Next's WASM compiler; Turbopack does not.
const child = spawn(
  process.execPath,
  [nextCli, 'build', '--webpack', ...process.argv.slice(2)],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_TEST_WASM_DIR: wasmDirectory,
    },
  },
);

child.on('error', (error) => {
  console.error('Failed to start the Next.js production build:', error);
  process.exitCode = 1;
});

child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
