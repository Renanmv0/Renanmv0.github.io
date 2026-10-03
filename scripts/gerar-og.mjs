// Gera public/og.jpg (imagem que aparece ao compartilhar o link no WhatsApp,
// Instagram, Facebook etc.) a partir de scripts/og.html.
// Rode com: npm run og   (precisa do Playwright: npx playwright install chromium)
import { chromium } from 'playwright';
import sharp from 'sharp';
import { fileURLToPath, pathToFileURL } from 'node:url';

const modelo = pathToFileURL(fileURLToPath(new URL('./og.html', import.meta.url))).href;
const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 } });
await pagina.goto(modelo, { waitUntil: 'networkidle' });
await pagina.evaluate(() => document.fonts.ready);
const png = await pagina.screenshot({ type: 'png' });
await navegador.close();
await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toFile('public/og.jpg');
console.log('public/og.jpg gerada (1200 x 630)');
