# Choque Lacrosse — site oficial

Site de página única do Choque Lacrosse (São Paulo), feito com [Astro](https://astro.build) e animações com [GSAP](https://gsap.com).
O conteúdo (elenco, agenda, resultados, fotos, contatos) fica em arquivos JSON fáceis de editar,
sem precisar mexer no código.

- Paleta tirada do uniforme: marinho quase preto `#0B0E1A` e o amarelo da faixa `#FFE02E`; o dourado do escudo `#D7A730` aparece só nas conquistas.
- Fontes: Big Shoulders Display (títulos), Big Shoulders Stencil (números) e Barlow (texto), hospedadas no próprio site.
- Funciona sem JavaScript e respeita a opção "reduzir movimento" do celular e do computador.

---

## 1. Rodar no seu computador

Você precisa do **Node.js 22 ou mais novo** (baixe a versão "LTS" em <https://nodejs.org>).

```bash
npm install        # só na primeira vez (instala as dependências)
npm run dev        # abre o site em modo de edição
```

Abra <http://localhost:4321> no navegador. Cada arquivo salvo atualiza a página sozinho.

Outros comandos:

| Comando | Para quê |
|---|---|
| `npm run build` | Gera a versão final do site na pasta `dist/` (é o que vai para o ar) |
| `npm run preview` | Mostra a versão final gerada, igual ao site publicado |

> No modo `dev` as fotos são convertidas na hora e podem demorar alguns segundos para aparecer da primeira vez. No site publicado elas já vêm prontas.

---

## 2. Atualizar o conteúdo (sem mexer no código)

Tudo o que muda com frequência está em **`src/data/`**:

| O que você quer mudar | Arquivo |
|---|---|
| WhatsApp, Instagram, e-mail, local e horário do treino, números do time, história, valores, vídeo | `src/data/time.json` |
| Atletas (nome, número, posição, foto) | `src/data/elenco.json` |
| Jogos, treinos especiais e eventos | `src/data/calendario.json` |
| Placares e conquistas | `src/data/resultados.json` |
| Fotos e vídeos da galeria | `src/data/galeria.json` |
| Patrocinadores e benefícios | `src/data/patrocinadores.json` |
| Perguntas frequentes | `src/data/perguntas.json` |

**Regras que valem para todos:**

- Troque só o texto **entre aspas**. Mantenha as aspas, as vírgulas e as chaves `{ }` / colchetes `[ ]`.
- Tudo que estiver entre colchetes, como `[PREENCHER]` ou `[NOME DO ATLETA]`, aparece no site com uma **fita amarela listrada**. É para ninguém esquecer de trocar.
- Campos `"confirmado": false` mostram o selo **[confirmar]** ao lado da informação. Quando ela estiver certa, troque para `true`.
- Se algo for escrito no formato errado, o site **não é publicado quebrado**: o build para e mostra qual arquivo e qual campo corrigir.

### Contatos (faça isto primeiro)

Em `src/data/time.json`, dentro de `"contato"`:

```json
"whatsapp": "5511987654321",
"instagram": "choquelacrosse",
"email": "contato@choquelacrosse.com.br"
```

- **WhatsApp**: só números, com `55` + DDD + número. Assim que estiver preenchido, todos os botões "Venha treinar com a gente" passam a abrir o WhatsApp com a mensagem pronta (`mensagemWhatsapp`).
- **Instagram**: o usuário sem o `@`.

### Elenco e fotos dos atletas

1. Coloque a foto em **`src/assets/elenco/`** (ex.: `joao-silva.jpg`). Use nomes sem espaços nem acentos. De preferência, foto **vertical (3:4)** com pelo menos 800 px de altura.
2. Em `src/data/elenco.json`, cada atleta é um bloco:

```json
{ "nome": "João Silva", "numero": 7, "posicao": "Ataque", "foto": "joao-silva.jpg", "capitao": false }
```

- `posicao`: `Ataque`, `Meio`, `Defesa` ou `Goleiro`.
- `foto`: o nome do arquivo. Deixe `""` para usar a silhueta do capacete.
- `capitao`: `true` mostra o selo **C** no card.
- Para acrescentar um atleta, copie um bloco, cole depois de uma vírgula e edite. O último bloco da lista **não** leva vírgula depois.

Não precisa se preocupar com o tamanho da foto: no build, o site gera versões leves (AVIF e WebP) em vários tamanhos.

### Agenda

Em `src/data/calendario.json`:

```json
{ "data": "2026-11-07", "hora": "10:00", "tipo": "jogo", "titulo": "Choque × Time Tal", "local": "Centro Esportivo Tietê", "detalhes": "" }
```

- `data` no formato **AAAA-MM-DD** e `hora` no formato **HH:MM** (ou `""`).
- `tipo`: `jogo`, `treino` ou `evento`.
- Eventos com data passada **saem da lista sozinhos**, e o próximo ganha o selo "Próximo". Depois do jogo, lance o placar em `resultados.json`.
- O treino semanal fixo (dias, horário e local) fica em `time.json`, no bloco `"treino"`.

### Resultados

Em `src/data/resultados.json`, use `null` no placar de um jogo que ainda não tem resultado. Vitória, empate ou derrota é calculado sozinho.

### Galeria

1. Coloque as fotos em **`src/assets/galeria/`**.
2. Em `src/data/galeria.json`:

```json
{ "tipo": "foto", "arquivo": "galeria/final-2026.jpg", "legenda": "Final do torneio de 2026" },
{ "tipo": "video", "youtubeId": "bw8KCj1uzNA", "legenda": "Melhores momentos" }
```

- A **legenda** também é lida por leitores de tela, então descreva a foto.
- O primeiro item da lista aparece grande.
- `youtubeId` é o código que vem depois de `v=` no link do YouTube.

### Patrocinadores

Logos em **`src/assets/patrocinadores/`** (PNG com fundo transparente fica melhor) e dados em `src/data/patrocinadores.json`. O primeiro da lista aparece em destaque.

### Editar direto pelo site do GitHub (sem instalar nada)

1. No GitHub, abra o repositório e navegue até o arquivo (ex.: `src/data/elenco.json`).
2. Clique no **lápis** ("Edit this file"), faça a alteração e clique em **Commit changes**.
3. Para subir fotos: entre na pasta (ex.: `src/assets/elenco`), clique em **Add file → Upload files**, arraste as fotos e confirme.
4. Em 1 a 2 minutos o site publicado se atualiza sozinho. Acompanhe na aba **Actions**: se aparecer um ❌, clique nele para ver qual campo corrigir.

---

## 3. Mudar cores, fontes e textos fixos

- **Cores**: no topo de `src/styles/global.css` (bloco `CORES`). Mudou ali, muda no site inteiro.
- **Fontes**: em `astro.config.mjs`.
- **Textos fixos das seções** (ex.: a explicação do lacrosse ou o hero): no componente da seção, em `src/components/` (ex.: `Lacrosse.astro`, `Hero.astro`). Cada arquivo começa com um comentário explicando o que ele é.
- **Ordem das seções**: `src/pages/index.astro`.

---

## 4. Publicar de graça

### Opção A — GitHub Pages (recomendada; este repositório já está pronto)

Este repositório se chama `renanmv0.github.io`, então o endereço do site é **https://renanmv0.github.io**.

1. No GitHub, vá em **Settings → Pages**.
2. Em **Build and deployment → Source**, escolha **GitHub Actions**.
   > Faça isso **antes ou junto** do passo 3. Se a fonte continuar como "Deploy from a branch", o site antigo deixa de aparecer, porque o `index.html` antigo foi movido para `_antigo/`.
3. Leve as mudanças para o branch `main`. Pelo GitHub: abra um *Pull Request* do branch `claude/site-choque-lacrosse` para `main` e clique em **Merge**.
4. Abra a aba **Actions** e espere o "Publicar site" ficar verde (cerca de 1 a 2 minutos).
5. Pronto. Dali em diante, toda alteração no `main` publica sozinha (é o arquivo `.github/workflows/publicar.yml`).

**Domínio próprio** (ex.: `choquelacrosse.com.br`): em Settings → Pages → *Custom domain*, informe o domínio e configure o DNS como o GitHub indicar. Depois troque o valor de `site` em `astro.config.mjs` para o novo endereço. Isso corrige o link de compartilhamento e o sitemap.

### Opção B — Netlify

1. Crie uma conta em <https://netlify.com> e clique em **Add new site → Import an existing project**.
2. Conecte o GitHub e escolha este repositório.
3. Build command: `npm run build`. Publish directory: `dist`. Clique em **Deploy**.
4. Troque `site` em `astro.config.mjs` para o endereço que a Netlify der (ou para o seu domínio).

### Opção C — Vercel

1. Crie uma conta em <https://vercel.com> e clique em **Add New → Project**.
2. Importe este repositório. A Vercel reconhece o Astro sozinha (build `npm run build`, saída `dist`).
3. Clique em **Deploy** e depois ajuste `site` em `astro.config.mjs` com o endereço final.

---

## 5. Testes e utilitários (opcional)

| Comando | O que faz |
|---|---|
| `npm run qa` | Com o site rodando (`npm run dev` ou `npm run preview`), tira prints em 390, 768 e 1440 px e roda a checagem de acessibilidade (axe). Prints e relatório vão para a pasta `qa/`. Use `npm run qa -- --calmo` para simular "reduzir movimento" e `npm run qa -- --sem-js` para testar sem JavaScript. |
| `npm run og` | Gera de novo a imagem de compartilhamento `public/og.jpg` (modelo em `scripts/og.html`). |
| `node scripts/gerar-icones.mjs` | Gera de novo os ícones a partir de `public/favicon.svg`. |

Os dois primeiros usam o Playwright. Na primeira vez, rode `npx playwright install chromium`.

Para medir velocidade e acessibilidade do site publicado, cole o endereço em <https://pagespeed.web.dev>.

**O amarelo aparece marrom em algum celular Samsung?** É o modo escuro do navegador Samsung Internet, que repinta todos os sites por conta própria (não é defeito do site). Para ver as cores certas: menu ☰ → Configurações → Labs → ative "Usar tema escuro do site" (o nome pode variar um pouco conforme a versão), ou desligue o modo escuro do navegador.

---

## 6. O que ainda falta preencher

- [ ] WhatsApp, Instagram e e-mail (`time.json`)
- [ ] Ano de fundação e números do time (`time.json`; hoje são valores de exemplo com o selo [confirmar])
- [ ] Confirmar dias, horários e local do treino (`time.json`)
- [ ] Elenco real com fotos (`elenco.json` + `src/assets/elenco/`)
- [ ] Próximos jogos e eventos (`calendario.json`)
- [ ] Placares e conquistas (`resultados.json`)
- [ ] Mais fotos e vídeos (`galeria.json` + `src/assets/galeria/`)
- [ ] Patrocinadores e benefícios das cotas (`patrocinadores.json`)
- [ ] Respostas de "Tem idade mínima?", "Quanto custa?" e "Mulheres podem jogar?" (`perguntas.json`)
- [ ] Conferir se o vídeo do YouTube que veio do site antigo é o certo (`time.json` → `video`)

---

## 7. Estrutura das pastas

```
src/
  data/         conteúdo editável (JSON)
  assets/       fotos (fotos/, elenco/, galeria/, patrocinadores/) e o escudo (marca/)
  components/   uma seção ou peça visual por arquivo
  layouts/      <head> com SEO, Open Graph e fontes
  pages/        a página (index.astro), a 404, o sitemap e o robots.txt
  scripts/      animações (animacoes.ts) e menu
  styles/       cores, tipografia e estilos globais
  lib/          leitura e conferência dos JSON, busca das fotos
public/         ícones, imagem de compartilhamento (og.jpg) e manifest
scripts/        testes visuais e geradores de imagens
_antigo/        páginas do site anterior, guardadas sem alteração
Imagens/        imagens originais do site anterior (não são usadas diretamente)
.claude/skills/ skills do Claude Code usadas no projeto (com licenças)
```

## Créditos

- Fontes Big Shoulders e Barlow: licença SIL Open Font License, via Fontsource.
- GSAP: gratuito para uso comercial, licença da GreenSock/Webflow.
- Ilustrações (taco, bola, gol, campo, capacete) e ícones: feitos para este site.
- Fotos: acervo do Choque Lacrosse.
