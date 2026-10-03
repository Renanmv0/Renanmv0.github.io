// Menu em tela cheia: abre/fecha o <dialog>, trava a rolagem do fundo
// e anima a entrada dos links (sem animação para quem prefere menos movimento).
import { gsap } from 'gsap';

const calmo = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function abrirMenu() {
  const menu = document.querySelector<HTMLDialogElement>('[data-menu]');
  const botao = document.querySelector<HTMLButtonElement>('[data-abrir-menu]');
  if (!menu || !botao) return;

  const links = menu.querySelectorAll<HTMLElement>('.menu__link');
  let fechando = false;

  function abrir() {
    menu!.showModal();
    document.documentElement.classList.add('menu-aberto');
    botao!.setAttribute('aria-expanded', 'true');
    if (calmo()) return;
    gsap.fromTo(menu, { yPercent: -100 }, { yPercent: 0, duration: 0.5, ease: 'expo.out' });
    gsap.fromTo(
      links,
      { yPercent: 110, rotate: 3 },
      { yPercent: 0, rotate: 0, duration: 0.6, ease: 'expo.out', stagger: 0.04, delay: 0.12 },
    );
  }

  function fechar(depois?: () => void) {
    if (fechando || !menu!.open) return;
    const concluir = () => {
      menu!.close();
      gsap.set(menu, { clearProps: 'transform' });
      fechando = false;
      depois?.();
    };
    document.documentElement.classList.remove('menu-aberto');
    botao!.setAttribute('aria-expanded', 'false');
    if (calmo()) return concluir();
    fechando = true;
    gsap.to(menu, { yPercent: -100, duration: 0.35, ease: 'power3.in', onComplete: concluir });
  }

  botao.addEventListener('click', abrir);
  menu.querySelector('[data-fechar-menu]')?.addEventListener('click', () => fechar());

  // Esc: deixa a animação de saída rodar em vez de fechar seco
  menu.addEventListener('cancel', (evento) => {
    evento.preventDefault();
    fechar();
  });

  // Clique num link: fecha e depois rola até a seção
  menu.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (evento) => {
      evento.preventDefault();
      const destino = document.querySelector(link.hash);
      fechar(() => {
        destino?.scrollIntoView({ behavior: calmo() ? 'auto' : 'smooth' });
        history.replaceState(null, '', link.hash);
        botao.focus({ preventScroll: true });
      });
    });
  });

  // Clique no fundo (fora do conteúdo) também fecha
  menu.addEventListener('click', (evento) => {
    if (evento.target === menu) fechar();
  });

  menu.addEventListener('close', () => {
    document.documentElement.classList.remove('menu-aberto');
    botao.setAttribute('aria-expanded', 'false');
  });
}
