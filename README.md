# Cloudflare Error Page Generator

📢 **Update (2025/12/09)**: All icons used in the error page have been fully redrawn as vector assets. These icons along with the stylesheet are also inlined into a single file of the error page, eliminating any need of hosting additional resources and ensuring better experience for you and your end users.

## What does this project do?

This project creates customized error pages that mimic the well-known Cloudflare error page. You can also embed it into your website. The project generates self-contained HTML files with inlined CSS and JavaScript.

## Quickstart

### Prerequisites

- Node.js (Latest LTS recommended)
- NPM

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/donlon/cloudflare-error-page.git
cd cloudflare-error-page
npm install
```

### Development

To start the development server with live reload:

```bash
npx vite
```

This command will:
1. Run the build script to generate HTML files from your configurations.
2. Serve the generated pages from the `dist/` directory.
3. Watch the `configs/` directory. If you modify, add, or delete a configuration file, it will automatically rebuild and reload the page.

### Build for Production

To generate the static HTML files without starting a server:

```bash
npm run build
```

This will generate HTML files in the `dist/` directory corresponding to your JSON configurations (e.g., `dist/my-error.html`). It also generates an `index.html` listing all generated pages.

## Configuration

You can customize the error page by creating a JSON file. The build script looks for JSON files in `configs/` (and optionally `config.json` in the root).

### Example Configuration

```json
{
    "title": "Internal server error",
    "error_code": 500,
    "browser_status": {
        "status": "ok",
        "status_text": "Working"
    },
    "cloudflare_status": {
        "status": "error",
        "status_text": "Error",
        "location": "London"
    },
    "host_status": {
        "status": "ok",
        "status_text": "Working",
        "location": "example.com"
    },
    "error_source": "cloudflare",
    "what_happened": "<p>There is an internal server error on Cloudflare's network.</p>",
    "what_can_i_do": "<p>Please try again in a few minutes.</p>"
}
```

### Full Parameter Reference

```javascript
{
    "html_title": "cloudflare.com | 500: Internal server error", // Browser tab title
    "title": "Internal server error", // Main title on the page
    "error_code": 500, // Error code displayed
    "time": "2025-11-18 12:34:56 UTC",  // if not set, current client time is shown

    // Configuration for "Visit ... for more information" line
    "more_information": {
        "hidden": false,
        "text": "cloudflare.com",
        "link": "https://www.cloudflare.com/",
        "for": "more information",
    },

    // Configuration for the Browser/Cloudflare/Host status
    "browser_status": {
        "status": "ok", // "ok" or "error"
        "location": "You",
        "name": "Browser",
        "status_text": "Working",
        "status_text_color": "#9bca3e",
    },
    "cloudflare_status": {
        "status": "error",
        "location": "Cloud",
        "name": "Cloudflare",
        "status_text": "Error",
        "status_text_color": "#bd2426",
    },
    "host_status": {
        "status": "ok",
        "location": "The Site", // Defaults to window.location.origin if not set
        "name": "Host",
        "status_text": "Working",
        "status_text_color": "#9bca3e",
    },
    "error_source": "host", // Position of the error indicator, can be "browser", "cloudflare", or "host"

    "what_happened": "<p>There is an internal server error on Cloudflare's network.</p>",
    "what_can_i_do": "<p>Please try again in a few minutes.</p>",

    "ray_id": '0123456789abcdef',  // if not set, random hex string is generated client-side
    "client_ip": '1.1.1.1', // if not set, fetches from external API client-side

    // Configuration for 'Performance & security by ...' in the footer
    "perf_sec_by": {
        "text": "Cloudflare",
        "link": "https://www.cloudflare.com/",
    },
}
```

## More Examples

### Catastrophic infrastructure failure

```json
{
    "title": "Catastrophic infrastructure failure",
    "more_information": {
        "for": "no information"
    },
    "browser_status": {
        "status": "error",
        "status_text": "Out of Memory"
    },
    "cloudflare_status": {
        "status": "error",
        "location": "Everywhere",
        "status_text": "Error"
    },
    "host_status": {
        "status": "error",
        "location": "example.com",
        "status_text": "On Fire"
    },
    "error_source": "cloudflare",
    "what_happened": "<p>There is a catastrophic failure.</p>",
    "what_can_i_do": "<p>Please try again in a few years.</p>"
}
```

![Catastrophic infrastructure failure](https://github.com/donlon/cloudflare-error-page/blob/images/example.png?raw=true)

### Web server is working

```json
{
    "title": "Web server is working",
    "error_code": 200,
    "more_information": {
        "hidden": true
    },
    "browser_status": {
        "status": "ok",
        "status_text": "Seems Working"
    },
    "cloudflare_status": {
        "status": "ok",
        "status_text": "Often Working"
    },
    "host_status": {
        "status": "ok",
        "location": "example.com",
        "status_text": "Almost Working"
    },
    "error_source": "host",
    "what_happened": "<p>This site is still working. And it looks great.</p>",
    "what_can_i_do": "<p>Visit the site before it crashes someday.</p>"
}
```

![Web server is working](https://github.com/donlon/cloudflare-error-page/blob/images/example2.png?raw=true)

## FAQ

### How to show real user IP / Cloudflare Ray ID / data center location in the error page?

Ray ID and user IP field in the error page can be set by `ray_id` and `client_ip` properties in the JSON configuration.

By default (if not provided in JSON):
- **Ray ID**: A random 16-character hex string is generated client-side.
- **Client IP**: The page attempts to fetch the user's IP from an external API (`https://api-mininxd.vercel.app/ip`) via JavaScript.
- **Data Center Location**: This is static content in the HTML based on your configuration (e.g. `cloudflare_status.location`).

If you are serving this HTML via a backend (like Nginx with SSI, or a dynamic server), you can inject the real `Cf-Ray` header values or client IP into the HTML before serving it.

## See also

- [cloudflare-error-page-3th.pages.dev](https://cloudflare-error-page-3th.pages.dev/): Error page of every HTTP status code.
- [oftx/cloudflare-error-page](https://github.com/oftx/cloudflare-error-page): React reimplementation.
