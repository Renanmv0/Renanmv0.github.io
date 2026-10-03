// Encontra as fotos citadas nos JSON dentro de src/assets/.
// Ex.: "elenco/joao.jpg" -> src/assets/elenco/joao.jpg
// O Astro converte cada foto usada para AVIF/WebP em vários tamanhos no build.
import type { ImageMetadata } from 'astro';

const arquivos = import.meta.glob<{ default: ImageMetadata }>('/src/assets/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG}', {
  eager: true,
});

export function imagem(caminho: string, pasta = ''): ImageMetadata | undefined {
  if (!caminho || /\[[^\]]+\]/.test(caminho)) return undefined;
  const relativo = caminho.replace(/^\/+/, '').replace(/^src\/assets\//, '');
  const candidatos = [`/src/assets/${relativo}`, `/src/assets/${pasta}/${relativo}`];
  for (const chave of candidatos) {
    if (arquivos[chave]) return arquivos[chave].default;
  }
  console.warn(`\n[imagem] Não achei "${caminho}" em src/assets/${pasta ? pasta + '/' : ''}. Confira o nome do arquivo.\n`);
  return undefined;
}
