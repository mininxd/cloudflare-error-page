import fs from 'fs';
import path, { dirname } from 'path';
import ejs from 'ejs';
import { fileURLToPath } from 'url';
import { minify } from 'html-minifier-terser';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');

// Ensure dist/ exists
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// Function to build a single HTML file from a config
async function buildPage(configPath, outputFilename) {
    let config = {};
    try {
        if (fs.existsSync(configPath)) {
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
    } catch (e) {
        console.warn(`Warning: Could not read ${configPath}`, e);
        return;
    }

    // Prepare config injection
    const configScript = `window.config = ${JSON.stringify(config)};`;

    // Render template.ejs
    const templatePath = path.join(__dirname, 'template.ejs');
    const templateContent = fs.readFileSync(templatePath, 'utf8');

    const htmlContent = ejs.render(templateContent, {
        config,
        configScript
    });

    const outputPath = path.join(distDir, outputFilename);

    // Write pre-minified HTML
    // fs.writeFileSync(outputPath, htmlContent);

    // --- Minify HTML (including inline JS + CSS) ---
    const minified = await minify(htmlContent, {
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true
    });

    // Write final HTML
    fs.writeFileSync(outputPath, minified);
    console.log(`Build complete: dist/${outputFilename} generated from ${path.basename(configPath)}.`);
}

async function runBuild() {
    // 1. Build main index.html from config.json (if it exists)
    if (fs.existsSync(path.join(__dirname, 'config.json'))) {
        await buildPage(path.join(__dirname, 'config.json'), 'index.html');
    }

    // 2. Scan for other json files
    const files = fs.readdirSync(__dirname);
    for (const file of files) {
        if (file === 'config.json' || file === 'package.json' || file === 'package-lock.json' || file === 'tsconfig.json' || !file.endsWith('.json')) {
            continue;
        }

        // Check if the file looks like a config (has error_code or title) to avoid processing unrelated jsons
        // Or simply trust the user instruction "like 404.json, 401.json".
        // Let's verify it has some expected fields to be safe.
        try {
            const content = JSON.parse(fs.readFileSync(path.join(__dirname, file), 'utf8'));
            if (content.title || content.error_code) {
                // Validate at least one error status
                const hasError = (content.browser_status && content.browser_status.status === 'error') ||
                                 (content.cloudflare_status && content.cloudflare_status.status === 'error') ||
                                 (content.host_status && content.host_status.status === 'error');

                if (!hasError) {
                    console.warn(`Warning: ${file} does not have any status set to 'error'.`);
                }

                const outputFilename = file.replace('.json', '.html');
                await buildPage(path.join(__dirname, file), outputFilename);
            }
        } catch (e) {
            // ignore non-json or bad json
        }
    }
}

await runBuild();
