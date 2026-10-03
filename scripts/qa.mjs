// Teste visual e de acessibilidade do site.
// Uso: com o site rodando (npm run dev ou npm run preview), execute:
//   npm run qa                     -> prints em 390, 768 e 1440 px + checagem axe
//   npm run qa -- --calmo          -> simula "reduzir movimento" do sistema
//   npm run qa -- --sem-js         -> página com JavaScript desligado
//   npm run qa -- --larguras=390   -> só uma largura
//   QA_URL=http://localhost:4321 npm run qa
// Os arquivos vão para a pasta qa/ (ignorada pelo git).
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);
const URL_BASE = process.env.QA_URL || args.url || 'http://localhost:4321/';
const larguras = String(args.larguras || '390,768,1440').split(',').map(Number);
const alturas = { 390: 844, 768: 1024, 1440: 900 };
const calmo = Boolean(args.calmo);
const semJs = Boolean(args['sem-js']);
const paginaInteira = !args['so-topo'];
const sufixo = [calmo && 'calmo', semJs && 'semjs'].filter(Boolean).join('-');
const saida = String(args.saida || 'qa');
await mkdir(saida, { recursive: true });

const navegador = await chromium.launch();
const relatorio = [];

for (const largura of larguras) {
  const contexto = await navegador.newContext({
    viewport: { width: largura, height: alturas[largura] || 900 },
    deviceScaleFactor: largura < 800 ? 2 : 1,
    reducedMotion: calmo ? 'reduce' : 'no-preference',
    javaScriptEnabled: !semJs,
    hasTouch: largura < 800,
    isMobile: largura < 800,
  });
  const pagina = await contexto.newPage();
  const erros = [];
  pagina.on('console', (m) => m.type() === 'error' && erros.push(m.text()));
  pagina.on('pageerror', (e) => erros.push(String(e)));

  await pagina.goto(URL_BASE, { waitUntil: 'networkidle' });
  await pagina.waitForTimeout(2200); // deixa a entrada do hero terminar
  const nome = (p) => `${saida}/${p}-${largura}${sufixo ? '-' + sufixo : ''}.png`;
  await pagina.screenshot({ path: nome('topo') });

  // Mede rolagem horizontal indesejada (não pode existir). Sem JS não dá para medir.
  const vazamento = semJs ? 0 : await pagina.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

  if (paginaInteira && !semJs) {
    // Rola devagar para disparar as animações de rolagem antes do print inteiro
    await pagina.evaluate(async () => {
      const passo = Math.round(window.innerHeight * 0.6);
      for (let y = 0; y < document.documentElement.scrollHeight; y += passo) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 140));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 400));
    });
  }
  if (paginaInteira) await pagina.screenshot({ path: nome('inteira'), fullPage: true });

  let violacoes = [];
  if (!semJs) {
    const axe = await new AxeBuilder({ page: pagina }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    violacoes = axe.violations.map((v) => ({
      regra: v.id,
      impacto: v.impact,
      ajuda: v.help,
      alvos: v.nodes.slice(0, 5).map((n) => n.target.join(' ')),
    }));
  }

  relatorio.push({ largura, vazamentoHorizontalPx: vazamento, errosNoConsole: erros, violacoesAxe: violacoes });
  await contexto.close();
}

await navegador.close();
await writeFile(`${saida}/relatorio${sufixo ? '-' + sufixo : ''}.json`, JSON.stringify(relatorio, null, 2));

for (const r of relatorio) {
  const ok = r.vazamentoHorizontalPx <= 0 && r.errosNoConsole.length === 0 && r.violacoesAxe.length === 0;
  console.log(
    `${ok ? '✓' : '✗'} ${r.largura}px  rolagem lateral: ${r.vazamentoHorizontalPx}px  erros: ${r.errosNoConsole.length}  axe: ${r.violacoesAxe.length}`,
  );
  r.errosNoConsole.forEach((e) => console.log('   erro:', e.slice(0, 200)));
  r.violacoesAxe.forEach((v) => console.log(`   axe [${v.impacto}] ${v.regra}: ${v.ajuda}\n      ${v.alvos.join('\n      ')}`));
}
