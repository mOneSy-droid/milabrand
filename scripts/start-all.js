const { spawn, spawnSync } = require('child_process');

console.log('🚀 [MILA PRODUCTION] Initializing services...');

// 1. Sync database schema synchronously so tables exist before bot or web starts
console.log('📦 [MILA DB] Verifying and syncing database schema...');
try {
  const result = spawnSync('npx', ['prisma', 'db', 'push', '--skip-generate'], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  });
  if (result.status !== 0) {
    console.warn(`⚠️ [MILA DB] prisma db push exited with status ${result.status}. Continuing service startup...`);
  } else {
    console.log('✅ [MILA DB] Database schema verified and up to date.');
  }
} catch (e) {
  console.warn('⚠️ [MILA DB] Could not run prisma db push automatically:', e.message);
}

// 2. Launch Telegram Bot process
console.log('🤖 [MILA BOT] Launching Telegram Bot process...');
const botProcess = spawn('npx', ['tsx', 'bot/index.ts'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: process.env,
});

botProcess.on('error', (err) => {
  console.error('❌ [MILA BOT] Failed to start bot process:', err);
});

botProcess.on('exit', (exitCode, signal) => {
  console.warn(`⚠️ [MILA BOT] Bot process exited with code ${exitCode}, signal ${signal}`);
});

// 3. Launch Next.js Web Application
const port = process.env.PORT || '3000';
console.log(`🌐 [MILA WEB] Launching Next.js Web Server on port ${port}...`);
const webProcess = spawn('npx', ['next', 'start', '-p', String(port)], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: process.env,
});

webProcess.on('error', (err) => {
  console.error('❌ [MILA WEB] Failed to start Next.js web server:', err);
});

// Graceful shutdown handling
const cleanExit = () => {
  console.log('🛑 Shutting down all services...');
  try { botProcess.kill(); } catch (e) {}
  try { webProcess.kill(); } catch (e) {}
  process.exit(0);
};

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);
