// README.md から README.pdf を生成するスクリプト。
// 以前は md-to-pdf を使っていたが、新しい puppeteer との組み合わせで
// 変換処理が待ち続けたまま止まってしまうため、puppeteer を直接使う方式に置き換えた。
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { marked } from 'marked';
import puppeteer from 'puppeteer';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const md = readFileSync(path.join(rootDir, 'README.md'), 'utf8');
const body = marked.parse(md);
const css = readFileSync(
  path.join(rootDir, 'node_modules/github-markdown-css/github-markdown.css'),
  'utf8',
);
const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style><style>.markdown-body{box-sizing:border-box;min-width:200px;max-width:980px;margin:0 auto;padding:45px;}</style></head><body class="markdown-body">${body}</body></html>`;

const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
try {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: path.join(rootDir, 'README.pdf'),
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
  });
  console.log('README.pdf を生成しました');
} finally {
  await browser.close();
}
