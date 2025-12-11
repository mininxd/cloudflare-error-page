import fs from 'fs';
import path, { dirname } from 'path';
import ejs from 'ejs';
import { fileURLToPath } from 'url';
import { minify } from 'html-minifier-terser';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');
const indexPath = path.join(distDir, 'index.html');

// Ensure dist/ exists
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// Read config.json
let config = {};
try {
    const configPath = path.join(__dirname, 'config.json');
    if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
} catch (e) {
    console.warn('Warning: Could not read config.json', e);
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

// Write pre-minified HTML
fs.writeFileSync(indexPath, htmlContent);
console.log('Build complete: dist/index.html generated.');

// --- Minify HTML (including inline JS + CSS) ---
const minified = await minify(htmlContent, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true
});

// Write final HTML
fs.writeFileSync(indexPath, minified);
console.log('HTML minified: dist/index.html');