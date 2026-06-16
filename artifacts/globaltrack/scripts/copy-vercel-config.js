import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcVercel = path.join(__dirname, '..', 'vercel.json');
const destVercel = path.join(__dirname, '..', 'dist', 'public', 'vercel.json');

const srcRedirects = path.join(__dirname, '..', '_redirects');
const destRedirects = path.join(__dirname, '..', 'dist', 'public', '_redirects');

try {
  if (fs.existsSync(srcVercel)) {
    fs.mkdirSync(path.dirname(destVercel), { recursive: true });
    fs.copyFileSync(srcVercel, destVercel);
    console.log('Copied vercel.json to dist/public');
  }
} catch (err) {
  console.error('Error copying vercel.json:', err);
}

try {
  if (fs.existsSync(srcRedirects)) {
    fs.mkdirSync(path.dirname(destRedirects), { recursive: true });
    fs.copyFileSync(srcRedirects, destRedirects);
    console.log('Copied _redirects to dist/public');
  }
} catch (err) {
  console.error('Error copying _redirects:', err);
}
