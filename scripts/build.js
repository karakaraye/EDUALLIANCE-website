const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');

[distDir, publicDir].forEach(outDir => {
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Copy root HTML and config files
  ['index.html', 'apply.html', 'tracker.html', 'vercel.json'].forEach(file => {
    const src = path.join(rootDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(outDir, file));
    }
  });

  // Copy folders
  ['css', 'js', 'assets'].forEach(dir => {
    const srcDir = path.join(rootDir, dir);
    const destDir = path.join(outDir, dir);
    if (fs.existsSync(srcDir)) {
      fs.cpSync(srcDir, destDir, { recursive: true, force: true });
    }
  });
});

console.log('Static site build succeeded for Vercel deployment.');
