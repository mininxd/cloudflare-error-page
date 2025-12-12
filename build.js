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

// Function to generate index.html that lists all generated pages
async function generateIndexHtml(pages) {
    const indexContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error Page Index</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
        }
        .page-list {
            list-style-type: none;
            padding: 0;
        }
        .page-list li {
            margin: 10px 0;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 5px;
            border-left: 4px solid #007cba;
        }
        .page-list a {
            display: block;
            text-decoration: none;
            color: #007cba;
            font-size: 18px;
            font-weight: bold;
        }
        .page-list a:hover {
            text-decoration: underline;
        }
        .filename {
            display: block;
            color: #666;
            font-size: 14px;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <ul class="page-list">
            ${pages.map(page => `
            <li>
                <a href="./${page.filename}">
                    ${page.title}
                    <span class="filename">/dist/${page.filename}</span>
                </a>
            </li>
            `).join('')}
        </ul>
    </div>
</body>
</html>
    `.trim();

    const outputPath = path.join(distDir, 'index.html');

    // Minify the index HTML
    const minified = await minify(indexContent, {
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true
    });

    fs.writeFileSync(outputPath, minified);
    console.log(`Index page generated: dist/index.html with ${pages.length} pages listed.`);
}

async function runBuild() {
    const generatedPages = [];

    // 1. Build main index.html from config.json (if it exists)
    if (fs.existsSync(path.join(__dirname, 'config.json'))) {
        await buildPage(path.join(__dirname, 'config.json'), 'index.html');
        generatedPages.push({ filename: 'index.html', title: 'Home' });
    }

    // 2. Scan configs/ directory for JSON files
    const configsDir = path.join(__dirname, 'configs');
    if (fs.existsSync(configsDir)) {
        const configFiles = fs.readdirSync(configsDir);
        for (const file of configFiles) {
            if (!file.endsWith('.json')) {
                continue;
            }

            // Check if the file looks like a config (has error_code or title) to avoid processing unrelated jsons
            try {
                const filePath = path.join(configsDir, file);
                const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                if (content.title || content.error_code) {
                    // Validate at least one error status
                    const hasError = (content.browser_status && content.browser_status.status === 'error') ||
                                     (content.cloudflare_status && content.cloudflare_status.status === 'error') ||
                                     (content.host_status && content.host_status.status === 'error');

                    if (!hasError) {
                        console.warn(`Warning: ${file} does not have any status set to 'error'.`);
                    }

                    const outputFilename = file.replace('.json', '.html');
                    await buildPage(filePath, outputFilename);

                    // Store info about generated page for index.html
                    generatedPages.push({
                        filename: outputFilename,
                        title: content.title || file.replace('.json', '')
                    });
                }
            } catch (e) {
                // ignore non-json or bad json
                console.warn(`Warning: Could not process ${file}`, e);
            }
        }
    }

    // 3. Generate index.html that lists all generated pages
    await generateIndexHtml(generatedPages);
}

await runBuild();
