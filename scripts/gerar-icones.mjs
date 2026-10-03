// Gera os ícones do site (favicon.ico, apple-touch-icon e ícones do manifest)
// a partir de public/favicon.svg. Rode com: node scripts/gerar-icones.mjs
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';

const svg = await readFile('public/favicon.svg');
const marinho = { r: 11, g: 14, b: 26, alpha: 1 };

// Ícone quadrado com fundo marinho e o escudo centralizado (iPhone e Android)
async function quadrado(tamanho, arquivo, margem = 0.14) {
  const interno = Math.round(tamanho * (1 - margem * 2));
  const escudo = await sharp(svg, { density: 600 }).resize(interno, interno).png().toBuffer();
  await sharp({ create: { width: tamanho, height: tamanho, channels: 4, background: marinho } })
    .composite([{ input: escudo, gravity: 'center' }])
    .png()
    .toFile(arquivo);
}

await quadrado(180, 'public/apple-touch-icon.png');
await quadrado(192, 'public/icone-192.png');
await quadrado(512, 'public/icone-512.png');

// favicon.ico com 16, 32 e 48 px (formato ICO com PNGs embutidos)
const tamanhos = [16, 32, 48];
const pngs = await Promise.all(tamanhos.map((t) => sharp(svg, { density: 600 }).resize(t, t).png().toBuffer()));
const cabecalho = Buffer.alloc(6 + 16 * pngs.length);
cabecalho.writeUInt16LE(0, 0);
cabecalho.writeUInt16LE(1, 2);
cabecalho.writeUInt16LE(pngs.length, 4);
let deslocamento = cabecalho.length;
pngs.forEach((png, i) => {
  const t = tamanhos[i];
  const base = 6 + 16 * i;
  cabecalho.writeUInt8(t, base);
  cabecalho.writeUInt8(t, base + 1);
  cabecalho.writeUInt8(0, base + 2);
  cabecalho.writeUInt8(0, base + 3);
  cabecalho.writeUInt16LE(1, base + 4);
  cabecalho.writeUInt16LE(32, base + 6);
  cabecalho.writeUInt32LE(png.length, base + 8);
  cabecalho.writeUInt32LE(deslocamento, base + 12);
  deslocamento += png.length;
});
await writeFile('public/favicon.ico', Buffer.concat([cabecalho, ...pngs]));
console.log('Ícones gerados em public/');
