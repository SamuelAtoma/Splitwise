/**
 * After `expo export --platform web`, dist/index.html is Expo's tiny generated
 * shell. This script extracts the <script> and <link rel="stylesheet"> tags
 * that reference _expo/static/... from that shell, then injects them into our
 * custom landing-page index.html and writes the result to dist/index.html.
 */

const fs = require('fs');
const path = require('path');

const distHtml  = path.resolve(__dirname, '../dist/index.html');
const srcHtml   = path.resolve(__dirname, '../index.html');

const expoGenerated = fs.readFileSync(distHtml, 'utf8');
const customLanding = fs.readFileSync(srcHtml,  'utf8');

// Extract <link rel="stylesheet" ...> tags pointing to _expo/static
const cssLinks = [...expoGenerated.matchAll(/<link[^>]+_expo\/static[^>]*>/g)]
  .map(m => m[0])
  .join('\n  ');

// Extract <script ...> tags pointing to _expo/static
const jsScripts = [...expoGenerated.matchAll(/<script[^>]+_expo\/static[^>]*><\/script>/g)]
  .map(m => m[0])
  .join('\n');

// Inject CSS into <head> (before </head>)
let merged = customLanding.replace('</head>', `  ${cssLinks}\n</head>`);

// Inject JS before </body>
merged = merged.replace('</body>', `${jsScripts}\n</body>`);

fs.writeFileSync(distHtml, merged, 'utf8');
console.log('✓ Merged landing page with Expo bundles →', distHtml);
