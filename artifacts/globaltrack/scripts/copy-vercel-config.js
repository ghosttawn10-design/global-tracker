import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.resolve(__dirname, '..');
const targetDir = path.resolve(__dirname, '..', 'dist', 'public');

// Copy _redirects file
const redirectsSource = path.join(sourceDir, '_redirects');
const redirectsTarget = path.join(targetDir, '_redirects');

if (fs.existsSync(redirectsSource)) {
  fs.copyFileSync(redirectsSource, redirectsTarget);
  console.log('Copied _redirects to dist/public/');
} else {
  console.error('_redirects not found in source directory');
}

// Copy vercel.json file
const vercelSource = path.join(sourceDir, 'vercel.json');
const vercelTarget = path.join(targetDir, 'vercel.json');

if (fs.existsSync(vercelSource)) {
  fs.copyFileSync(vercelSource, vercelTarget);
  console.log('Copied vercel.json to dist/public/');
} else {
  console.error('vercel.json not found in source directory');
}

console.log('Vercel configuration files copied successfully');