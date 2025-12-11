const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const distDir = path.join(__dirname, 'dist');
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

// Serialize config for injection
const configScript = `window.config = ${JSON.stringify(config)};`;

// Read template.ejs
const templatePath = path.join(__dirname, 'template.ejs');
const templateContent = fs.readFileSync(templatePath, 'utf8');

// Render HTML
const htmlContent = ejs.render(templateContent, {
    config: config,
    configScript: configScript
});

fs.writeFileSync(path.join(distDir, 'index.html'), htmlContent);
console.log('Build complete: ./dist/index.html generated.');
