// =============================================================================
// Animações de rolagem e interação (GSAP + ScrollTrigger).
// Tudo aqui é "extra": sem JavaScript, ou com "reduzir movimento" ligado no
// celular/computador, o conteúdo aparece completo e parado.
//
// Vocabulário do Choque:
//   descarga -> chega rápido e freia seco (títulos, entradas)
//   corte    -> painel que varre e revela (fotos e cards)
//   corrente -> movimento contínuo ligado à rolagem (faixas, parallax, fio)
//   ligar    -> números que piscam e acendem (contadores)
//
// Desempenho: a entrada do topo é em CSS. Este arquivo só começa a trabalhar
// depois que a página carregou, e as revelações simples usam
// IntersectionObserver (mais leve). ScrollTrigger fica só para o que acompanha
// a rolagem quadro a quadro.
// =============================================================================
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const $$ = <T extends Element = HTMLElement>(seletor: string, raiz: ParentNode = document) =>
  Array.from(raiz.querySelectorAll<T>(seletor));

/** Chama `aoAparecer` (em lotes, para permitir escalonar) quando os elementos entram na tela. */
function aoEntrar(elementos: HTMLElement[], aoAparecer: (lote: HTMLElement[]) => void, margem = '0px 0px -12% 0px') {
  if (!elementos.length) return () => {};
  let fila: HTMLElement[] = [];
  let quadro = 0;
  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        fila.push(entrada.target as HTMLElement);
        observador.unobserve(entrada.target);
      }
      if (fila.length && !quadro) {
        quadro = requestAnimationFrame(() => {
          const lote = fila;
          fila = [];
          quadro = 0;
          aoAparecer(lote);
        });
      }
    },
    { rootMargin: margem },
  );
  elementos.forEach((el) => observador.observe(el));
  return () => observador.disconnect();
}

// ---------------------------------------------------------------------------
// Contadores: o número final já está no HTML; aqui só animamos a contagem
// ---------------------------------------------------------------------------
function prepararContadores(animar: boolean) {
  const contadores = $$('[data-contador]');
  const alvos = new Map<HTMLElement, number>();
  contadores.forEach((el) => {
    // anos de time: recalculado no navegador para nunca ficar desatualizado
    const fundacao = Number(el.dataset.fundacao);
    const alvo = fundacao ? Math.max(1, new Date().getFullYear() - fundacao) : Number(el.dataset.contador);
    const leitor = el.nextElementSibling;
    if (leitor?.classList.contains('sr-only')) leitor.textContent = String(alvo);
    el.textContent = String(alvo);
    if (animar && Number.isFinite(alvo)) {
      alvos.set(el, alvo);
      el.textContent = '0';
    }
  });
  if (!animar) return () => {};
  return aoEntrar([...alvos.keys()], (lote) =>
    lote.forEach((el, i) => {
      const alvo = alvos.get(el)!;
      const estado = { valor: 0 };
      // "liga" piscando como painel elétrico e depois conta
      gsap
        .timeline({ delay: i * 0.12 })
        .to(el, { opacity: 0.2, duration: 0.05, repeat: 3, yoyo: true, ease: 'steps(1)' })
        .to(estado, {
          valor: alvo,
          duration: Math.min(1.6, 0.6 + alvo / 40),
          ease: 'power3.out',
          onUpdate: () => {
            el.textContent = String(Math.round(estado.valor));
          },
        });
    }),
  );
}

function iniciar() {
  // Topo fica sólido depois que o hero começa a sair da tela (em qualquer ponto abaixo disso)
  const topo = document.querySelector<HTMLElement>('[data-topo]');
  if (topo) {
    let agendado = false;
    const atualizarTopo = () => {
      agendado = false;
      topo.classList.toggle('is-solido', window.scrollY > window.innerHeight * 0.25);
    };
    window.addEventListener(
      'scroll',
      () => {
        if (!agendado) {
          agendado = true;
          requestAnimationFrame(atualizarTopo);
        }
      },
      { passive: true },
    );
    atualizarTopo();
  }

  const mm = gsap.matchMedia();
  mm.add(
    {
      movimento: '(prefers-reduced-motion: no-preference)',
      calmo: '(prefers-reduced-motion: reduce)',
      computador: '(min-width: 1024px)',
      largo: '(min-width: 900px)',
      ponteiroFino: '(hover: hover) and (pointer: fine)',
    },
    (contexto) => {
      const { movimento, computador, largo, ponteiroFino } = contexto.conditions as Record<string, boolean>;
      const limpezas: Array<() => void> = [prepararContadores(movimento)];
      if (!movimento) return () => limpezas.forEach((fn) => fn());

      // --- corrente: efeitos ligados à rolagem (ScrollTrigger com scrub) ---

      // Barra de voltagem no topo: progresso da leitura
      gsap.to('[data-voltagem]', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

      // Parallax: data-parallax="12" anda 12% mais devagar que a página
      $$('[data-parallax]').forEach((el) => {
        const intensidade = Number(el.dataset.parallax) || 10;
        gsap.fromTo(
          el,
          { yPercent: -intensidade / 2 },
          {
            yPercent: intensidade / 2,
            ease: 'none',
            scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        );
      });

      // Palavras gigantes de fundo que deslizam de lado
      $$('[data-deslizar]').forEach((el) => {
        gsap.fromTo(
          el,
          { xPercent: 0 },
          {
            xPercent: Number(el.dataset.deslizar) || -20,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        );
      });

      // Linhas gigantes que entram de lado (chamada final)
      $$('[data-entrada-lateral]').forEach((el) => {
        gsap.from(el, {
          xPercent: Number(el.dataset.entradaLateral) || 12,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 50%', scrub: true },
        });
      });

      // Bordas em zigue-zague se mexem de leve (energia passando)
      $$('[data-corte] svg').forEach((el, i) => {
        gsap.fromTo(
          el,
          { xPercent: i % 2 ? -3 : 3 },
          {
            xPercent: i % 2 ? 3 : -3,
            ease: 'none',
            scrollTrigger: { trigger: el.closest('section, footer') ?? el, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        );
      });

      // Fio dos passos de "Como entrar": a corrente enche conforme a leitura
      $$('[data-fio]').forEach((caixa) => {
        const carga = caixa.querySelector<HTMLElement>('[data-fio-carga]');
        if (!carga) return;
        const eixo = largo ? 'scaleX' : 'scaleY';
        gsap.fromTo(
          carga,
          { [eixo]: 0 },
          { [eixo]: 1, ease: 'none', scrollTrigger: { trigger: caixa, start: 'top 75%', end: 'bottom 55%', scrub: true } },
        );
      });

      // Faixas zebradas: aceleram e inclinam com a velocidade da rolagem
      const fitas = document.querySelector<HTMLElement>('[data-fitas]');
      if (fitas) {
        const animacoesCss = $$('.fita__trilho', fitas).flatMap((t) => t.getAnimations());
        const inclinar = $$('.fita', fitas).map((f) => gsap.quickTo(f, 'skewX', { duration: 0.4, ease: 'power3' }));
        const ritmo = { valor: 1 };
        const aplicarRitmo = () => {
          if (!fitas.classList.contains('is-pausado')) animacoesCss.forEach((a) => (a.playbackRate = ritmo.valor));
        };
        const voltarAoNormal = gsap.delayedCall(0.15, () => inclinar.forEach((fn) => fn(0))).pause();
        ScrollTrigger.create({
          trigger: fitas,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => {
            const v = self.getVelocity();
            gsap.to(ritmo, {
              valor: 1 + Math.min(Math.abs(v) / 250, 6),
              duration: 0.2,
              overwrite: true,
              onUpdate: aplicarRitmo,
              onComplete: () => {
                gsap.to(ritmo, { valor: 1, duration: 0.8, ease: 'power2.out', onUpdate: aplicarRitmo });
              },
            });
            inclinar.forEach((fn) => fn(gsap.utils.clamp(-8, 8, v / -300)));
            voltarAoNormal.restart(true);
          },
        });
      }

      // "O que é lacrosse" no computador: a seção trava e os cards correm na horizontal
      const palco = document.querySelector<HTMLElement>('[data-horizontal]');
      const secaoHorizontal = palco?.closest('section');
      if (computador && palco && secaoHorizontal) {
        secaoHorizontal.classList.add('is-horizontal');
        const janela = palco.querySelector<HTMLElement>('.lacrosse__janela')!;
        const trilho = palco.querySelector<HTMLElement>('.lacrosse__trilho')!;
        const distancia = () => Math.max(0, trilho.scrollWidth - janela.clientWidth);
        gsap.to(trilho, {
          x: () => -distancia(),
          ease: 'none',
          scrollTrigger: {
            trigger: palco,
            start: 'top top',
            end: () => `+=${distancia()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
        limpezas.push(() => secaoHorizontal.classList.remove('is-horizontal'));
      }

      // --- descarga e corte: revelações ao entrar na tela (IntersectionObserver) ---

      // Títulos: as palavras batem de baixo para cima
      const titulos = $$('[data-titulo]');
      const palavrasPorTitulo = new Map<HTMLElement, Element[]>();
      titulos.forEach((titulo) => {
        const divisao = SplitText.create(titulo, { type: 'words', mask: 'words', wordsClass: 'palavra' });
        palavrasPorTitulo.set(titulo, divisao.words);
        gsap.set(divisao.words, { yPercent: 115, rotate: 4 });
      });
      limpezas.push(
        aoEntrar(titulos, (lote) =>
          lote.forEach((titulo) =>
            gsap.to(palavrasPorTitulo.get(titulo)!, { yPercent: 0, rotate: 0, duration: 0.8, ease: 'expo.out', stagger: 0.07 }),
          ),
        ),
      );

      // Carimbo: a assinatura CHOQUE bate na tela, com tremor
      const carimbos = $$('[data-carimbo]');
      gsap.set(carimbos, { scale: 1.35, opacity: 0, transformOrigin: '30% 60%' });
      limpezas.push(
        aoEntrar(carimbos, (lote) =>
          lote.forEach((el) =>
            gsap
              .timeline()
              .to(el, { scale: 1, opacity: 1, duration: 0.42, ease: 'expo.in' })
              .to(el, { keyframes: { x: [-6, 5, -3, 2, 0], y: [2, -2, 1, 0, 0] }, duration: 0.3, ease: 'none' }),
          ),
        ),
      );

      // Cards e fotos: painel varre e revela (ou só aparecem, se não tiverem painel)
      const revelaveis = $$('[data-revela]');
      revelaveis.forEach((el) => {
        // opacidade (e não visibility) para o conteúdo continuar acessível pelo teclado
        if (el.querySelector(':scope > .varredura')) gsap.set($$(':scope > :not(.varredura)', el), { opacity: 0 });
        else gsap.set(el, { opacity: 0, y: 28 });
      });
      limpezas.push(
        aoEntrar(
          revelaveis,
          (lote) =>
            lote.forEach((el, i) => {
              const painel = el.querySelector<HTMLElement>(':scope > .varredura');
              const tl = gsap.timeline({ delay: i * 0.09 });
              if (painel) {
                tl.fromTo(painel, { scaleX: 0, transformOrigin: 'left' }, { scaleX: 1, duration: 0.32, ease: 'power3.in' })
                  .set($$(':scope > :not(.varredura)', el), { opacity: 1 })
                  .to(painel, { scaleX: 0, transformOrigin: 'right', duration: 0.45, ease: 'expo.out' });
              } else {
                tl.to(el, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' });
              }
            }),
          '0px 0px -8% 0px',
        ),
      );

      // Texto corrido: só aparece suave (sem deslizar, para não cansar)
      const textos = $$('[data-surge]');
      gsap.set(textos, { opacity: 0 });
      limpezas.push(
        aoEntrar(textos, (lote) => gsap.to(lote, { opacity: 1, duration: 0.8, stagger: 0.08, ease: 'power1.out' })),
      );

      // Quem navega pelo teclado não espera animação: o bloco que recebe foco aparece na hora
      const revelarNoFoco = (evento: FocusEvent) => {
        const alvo = evento.target as HTMLElement;
        const bloco = alvo.closest<HTMLElement>('[data-surge], [data-revela]');
        if (!bloco) return;
        gsap.set([bloco, ...$$(':scope > :not(.varredura)', bloco)], { opacity: 1, y: 0 });
        const painel = bloco.querySelector<HTMLElement>(':scope > .varredura');
        if (painel) gsap.set(painel, { scaleX: 0 });
        const titulo = bloco.closest('section')?.querySelector<HTMLElement>('[data-titulo]');
        if (titulo) gsap.set(palavrasPorTitulo.get(titulo) ?? [], { yPercent: 0, rotate: 0 });
      };
      document.addEventListener('focusin', revelarNoFoco);
      limpezas.push(() => document.removeEventListener('focusin', revelarNoFoco));

      // Botões magnéticos (só com mouse)
      if (ponteiroFino) {
        $$('[data-magnetico]').forEach((botao) => {
          const x = gsap.quickTo(botao, 'x', { duration: 0.4, ease: 'power3' });
          const y = gsap.quickTo(botao, 'y', { duration: 0.4, ease: 'power3' });
          const mover = (e: PointerEvent) => {
            const r = botao.getBoundingClientRect();
            x(((e.clientX - r.left) / r.width - 0.5) * 12);
            y(((e.clientY - r.top) / r.height - 0.5) * 10);
          };
          const soltar = () => {
            x(0);
            y(0);
          };
          botao.addEventListener('pointermove', mover);
          botao.addEventListener('pointerleave', soltar);
          limpezas.push(() => {
            botao.removeEventListener('pointermove', mover);
            botao.removeEventListener('pointerleave', soltar);
          });
        });
      }

      return () => limpezas.forEach((fn) => fn());
    },
  );
}

// Começa depois do carregamento, quando o navegador estiver livre
// (a entrada do topo já está rodando em CSS e não depende disto)
const quandoLivre = (fn: () => void) =>
  'requestIdleCallback' in window ? window.requestIdleCallback(fn, { timeout: 1500 }) : window.setTimeout(fn, 200);
if (document.readyState === 'complete') quandoLivre(iniciar);
else window.addEventListener('load', () => quandoLivre(iniciar), { once: true });
