import { defineConfig } from 'vite';
import { exec, execSync } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    execSync('npm run build', { stdio: 'inherit' });
    return {
      root: 'dist',
      server: {
        watch: {
          usePolling: true,
          ignored: ['**/dist/**', '**/node_modules/**'], // Ignore dist and node_modules, only watch configs via plugin
        },
      },
      plugins: [
        {
          name: 'rebuild-on-config-change',
          configureServer(server) {
            // Watch the configs directory relative to project root
            const chokidar = server.watcher;
            const configWatcher = chokidar.add('configs'); // configs directory is in project root

            configWatcher.on('change', async (file) => {
              console.log(`Config file ${file} changed, rebuilding...`);

              try {
                await execAsync('npm run build');
                console.log('Rebuild completed successfully');
                server.ws.send({
                  type: 'full-reload',
                  path: '*'
                });
              } catch (error) {
                console.error('Build failed:', error);
              }
            });

            // Also handle add and unlink events
            configWatcher.on('add', async (file) => {
              console.log(`New config file ${file} added, rebuilding...`);

              try {
                await execAsync('npm run build');
                console.log('Rebuild completed successfully');
                server.ws.send({
                  type: 'full-reload',
                  path: '*'
                });
              } catch (error) {
                console.error('Build failed:', error);
              }
            });

            configWatcher.on('unlink', async (file) => {
              console.log(`Config file ${file} removed, rebuilding...`);

              try {
                await execAsync('npm run build');
                console.log('Rebuild completed successfully');
                server.ws.send({
                  type: 'full-reload',
                  path: '*'
                });
              } catch (error) {
                console.error('Build failed:', error);
              }
            });
          }
        }
      ]
    };
  }
  return {};
});
