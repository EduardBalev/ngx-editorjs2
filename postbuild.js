// File: postbuild.js

const fs = require('fs');
const path = require('path');

/**
 * Moves style assets from /src/styles/ to /styles/ for each Angular library in /dist
 * so they can be imported cleanly by consumers.
 */

const DIST_DIR = path.resolve(__dirname, 'dist');

const LIBS = fs.readdirSync(DIST_DIR).filter((name) => {
  const libPath = path.join(DIST_DIR, name);
  return fs.statSync(libPath).isDirectory();
});

LIBS.forEach((libName) => {
  const libDistPath = path.join(DIST_DIR, libName);
  const srcStylesPath = path.join(libDistPath, 'src/styles');
  const targetStylesPath = path.join(libDistPath, 'styles');

  if (fs.existsSync(srcStylesPath)) {
    fs.mkdirSync(targetStylesPath, { recursive: true });

    fs.readdirSync(srcStylesPath).forEach((file) => {
      const srcFile = path.join(srcStylesPath, file);
      const destFile = path.join(targetStylesPath, file);

      fs.copyFileSync(srcFile, destFile);
      console.log(`[postbuild] Copied ${srcFile} → ${destFile}`);
    });
  }
});