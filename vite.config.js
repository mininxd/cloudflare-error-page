import { defineConfig } from 'vite';
import { execSync } from 'child_process';
import fs from 'fs';

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    if (!fs.existsSync('dist') || !fs.existsSync('dist/index.html')) {
        console.log('dist/index.html missing. Running build...');
        execSync('npm run build', { stdio: 'inherit' });
    }
    return {
      root: 'dist',
    };
  }
  return {};
});
