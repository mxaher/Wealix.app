import { execSync } from 'child_process';

// Recursion guard: opennextjs-cloudflare internally calls `bun run build`.
// If OPENNEXT_INNER is already set, we're in that recursive call — just run next build.
// Otherwise, set OPENNEXT_INNER and kick off the full opennextjs-cloudflare build.
if (process.env.OPENNEXT_INNER) {
  execSync('next build', { stdio: 'inherit' });
} else {
  execSync('opennextjs-cloudflare build', {
    stdio: 'inherit',
    env: { ...process.env, OPENNEXT_INNER: '1' },
  });
}
