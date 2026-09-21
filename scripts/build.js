const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copy root HTML files
['index.html', 'apply.html', 'tracker.html'].forEach(file => {
  const src = path.join(rootDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(publicDir, file));
  }
});

// Copy folders
['css', 'js', 'assets'].forEach(dir => {
  const srcDir = path.join(rootDir, dir);
  const destDir = path.join(publicDir, dir);
  if (fs.existsSync(srcDir)) {
    fs.cpSync(srcDir, destDir, { recursive: true, force: true });
  }
});

console.log('Build completed successfully.');
