# Choque Lacrosse — notas para o Claude Code

Site de página única do time Choque Lacrosse (São Paulo). Astro 7 + GSAP 3 (ScrollTrigger, SplitText). O Choque joga **sixes** (6 contra 6). Público: iniciantes, famílias, atletas e patrocinadores. Idioma: português do Brasil.

## Comandos
- `npm run dev` (http://localhost:4321) · `npm run build` (gera `dist/`) · `npm run preview`
- `npm run qa` com o site rodando: prints 390/768/1440 + axe em `qa/` (`-- --calmo`, `-- --sem-js`)
- `npm run og` regenera `public/og.jpg`; `node scripts/gerar-icones.mjs` regenera os ícones
- Deploy: `.github/workflows/publicar.yml` publica o `main` no GitHub Pages

## Estrutura
- Conteúdo editável pelo dono do site: `src/data/*.json`, validado com zod em `src/lib/dados.ts` (mensagens de erro em português). Fotos ficam em `src/assets/`, resolvidas por `src/lib/imagens.ts`.
- Uma seção por componente em `src/components/`; ordem em `src/pages/index.astro`.
- Animações em `src/scripts/animacoes.ts`. A entrada do hero é CSS puro (em `Hero.astro`), para não atrasar o LCP.

## Direção de arte (manter)
- Conceito: placa de "risco de choque elétrico" com as cores do uniforme.
- Cores (tokens em `src/styles/global.css`): `--noite` #0B0E1A, `--amarelo` #FFE02E, `--ouro` #D7A730 (só escudo e conquistas), `--giz` #F1F2F6.
- Tipografia: Big Shoulders Display (títulos, caixa alta), Big Shoulders Stencil (só números ou palavras de "uniforme/placar"), Barlow (texto).
- Assinatura: o Q de CHOQUE com perna de raio (`PalavraChoque.astro`; a versão animada está no hero).
- Motivos: bordas em zigue-zague (`Corte.astro`), fita zebrada, placas triangulares, cantos chanfrados. Evitar cards arredondados iguais, sombras suaves, gradientes decorativos, rótulos em caixa alta sobre cada título e `→` em botões.
- Movimento: descarga (entrada rápida com freio seco), corte (painel `.varredura` que revela), corrente (scrub ligado à rolagem), ligar (contadores piscando). Animar só transform e opacity. Revelações usam IntersectionObserver e opacidade (nunca `visibility`, para não tirar elementos da ordem do Tab).

## Regras
- Tom: intenso e acolhedor, mas profissional. Evitar coloquialismos como "a gente", "pra/pro", "é só", "chama", "vem" (use "emprestamos", "fale conosco", "venha"). O CTA "Venha treinar com a gente" foi pedido pelo dono e fica.
- Sem JavaScript ou com `prefers-reduced-motion`, todo o conteúdo precisa aparecer parado.
- Placeholders sempre entre colchetes (`[PREENCHER]`): `Ph.astro` os marca com fita amarela. Informação não verificada leva `"confirmado": false`.
- Não afirmar fatos não confirmados (ex.: "primeiro time do Brasil" foi removido porque não há comprovação). Lacrosse **volta** às Olimpíadas em LA 2028 (foi olímpico em 1904 e 1908); quem estreia é o formato sixes.
- Antes de entregar mudanças visuais: `npm run build`, `npm run preview` e `npm run qa` sem violações; Lighthouse mobile ≥ 90.

## Problemas conhecidos
- Samsung Internet com modo escuro repinta o site (amarelo vira marrom, zigue-zague azul vira branco) e ignora o `color-scheme: dark`. `only dark` também não resolve: no Chromium, auto dark com preferência clara força a repintura (`SetUsedColorScheme` em `computed_style.cc`, igual desde a versão 110). Para simular: CDP `Emulation.setAutoDarkModeOverride` + `colorScheme: 'light'` no Playwright, medindo pixels em prints da tela (print de página inteira ou de elemento maior que a tela desliga o auto dark). Contorno testado e não aplicado: pintar o amarelo em negativo (`#001fd1`, texto `#f4f1e5`) e inverter com `filter: invert(1)`.
