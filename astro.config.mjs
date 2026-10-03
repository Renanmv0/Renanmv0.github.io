// Configuração do Astro (gerador do site).
// Se o site ganhar um domínio próprio (ex.: https://choquelacrosse.com.br),
// troque o valor de `site` abaixo: ele é usado no link de compartilhamento
// (Open Graph), no sitemap e no endereço canônico.
import { defineConfig, fontProviders } from 'astro/config';

const fonte = (pacote, arquivo) => `./node_modules/${pacote}/files/${arquivo}`;

export default defineConfig({
  site: 'https://renanmv0.github.io',
  devToolbar: { enabled: false },
  // CSS embutido no HTML: a página aparece sem esperar arquivos extras
  build: { inlineStylesheets: 'always' },

  // Fontes hospedadas no próprio site (sem depender do Google Fonts).
  // O Astro gera o @font-face, o preload e uma fonte reserva ajustada
  // para o texto não "pular" enquanto a fonte carrega.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Big Shoulders Display',
      cssVariable: '--fonte-titulo',
      fallbacks: ['Arial Narrow', 'sans-serif'],
      options: {
        variants: [
          {
            src: [fonte('@fontsource-variable/big-shoulders-display', 'big-shoulders-display-latin-wght-normal.woff2')],
            weight: '100 900',
            style: 'normal',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Big Shoulders Stencil Display',
      cssVariable: '--fonte-numero',
      fallbacks: ['Arial Narrow', 'sans-serif'],
      options: {
        variants: [
          {
            src: [fonte('@fontsource-variable/big-shoulders-stencil-display', 'big-shoulders-stencil-display-latin-wght-normal.woff2')],
            weight: '100 900',
            style: 'normal',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Barlow',
      cssVariable: '--fonte-texto',
      fallbacks: ['Arial', 'sans-serif'],
      options: {
        variants: [
          { src: [fonte('@fontsource/barlow', 'barlow-latin-400-normal.woff2')], weight: 400, style: 'normal' },
          { src: [fonte('@fontsource/barlow', 'barlow-latin-600-normal.woff2')], weight: 600, style: 'normal' },
          { src: [fonte('@fontsource/barlow', 'barlow-latin-700-normal.woff2')], weight: 700, style: 'normal' },
        ],
      },
    },
  ],
});
