// Carrega e confere os arquivos de src/data/*.json.
// Se algum campo estiver no formato errado, o build para com uma mensagem
// dizendo qual arquivo e qual campo corrigir (em vez de publicar o site quebrado).
import { z } from 'astro/zod';

import timeJson from '../data/time.json';
import elencoJson from '../data/elenco.json';
import calendarioJson from '../data/calendario.json';
import resultadosJson from '../data/resultados.json';
import galeriaJson from '../data/galeria.json';
import patrocinadoresJson from '../data/patrocinadores.json';
import perguntasJson from '../data/perguntas.json';

const texto = z.string();
const data = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'use o formato AAAA-MM-DD, ex.: 2026-11-07');
const hora = z.string().regex(/^(\d{2}:\d{2})?$/, 'use o formato HH:MM, ex.: 09:30 (ou deixe "")');

const esquemaTime = z.object({
  nome: texto,
  cidade: texto,
  estado: texto,
  fundacao: z.object({
    ano: z.number().int().min(1900),
    mes: z.number().int().min(1, 'use um mês de 1 a 12').max(12, 'use um mês de 1 a 12').default(1),
    confirmado: z.boolean(),
  }),
  descricaoSeo: texto,
  contato: z.object({
    grupoWhatsapp: texto,
    instagram: texto,
    email: texto.default(''),
  }),
  treino: z.object({
    dias: texto,
    horario: texto,
    confirmado: z.boolean(),
    locais: z
      .array(z.object({ nome: texto, endereco: texto.default(''), linkMapa: texto }))
      .min(1, 'informe pelo menos um local de treino'),
    chegada: texto,
    levar: z.array(texto),
    emprestamos: z.array(texto),
  }),
  numeros: z.array(z.object({ valor: z.number().min(0), rotulo: texto, confirmado: z.boolean() })),
  historia: z.array(texto).min(1),
  valores: z.array(z.object({ titulo: texto, texto })),
  video: z.object({ youtubeId: texto, titulo: texto }),
});

const esquemaElenco = z.object({
  membros: z.array(
    z.object({
      nome: texto,
      funcao: texto,
      detalhe: texto.default(''),
      numero: z.number().int().min(0).max(99).nullable().default(null),
      foto: texto.default(''),
      capitao: z.boolean().default(false),
    }),
  ),
});

const esquemaCalendario = z.object({
  eventos: z.array(
    z.object({
      data,
      hora: hora.default(''),
      tipo: z.enum(['jogo', 'treino', 'evento'], { error: 'use jogo, treino ou evento' }),
      titulo: texto,
      local: texto.default(''),
      detalhes: texto.default(''),
    }),
  ),
});

const esquemaResultados = z.object({
  jogos: z.array(
    z.object({
      data,
      adversario: texto,
      competicao: texto.default(''),
      placarChoque: z.number().int().min(0).nullable(),
      placarAdversario: z.number().int().min(0).nullable(),
    }),
  ),
  conquistas: z.array(z.object({ ano: z.number().int(), titulo: texto, descricao: texto.default('') })),
});

const esquemaGaleria = z.object({
  itens: z.array(
    z.discriminatedUnion('tipo', [
      z.object({ tipo: z.literal('foto'), arquivo: texto, legenda: texto }),
      z.object({ tipo: z.literal('video'), youtubeId: texto, legenda: texto }),
    ]),
  ),
});

const esquemaPatrocinadores = z.object({
  patrocinadores: z.array(z.object({ nome: texto, logo: texto.default(''), site: texto.default('') })),
  beneficios: z.array(texto),
});

const esquemaPerguntas = z.object({
  perguntas: z.array(z.object({ pergunta: texto, resposta: texto })),
});

function conferir<T extends z.ZodType>(arquivo: string, esquema: T, conteudo: unknown): z.infer<T> {
  const resultado = esquema.safeParse(conteudo);
  if (!resultado.success) {
    throw new Error(`\n\nErro em src/data/${arquivo}:\n${z.prettifyError(resultado.error)}\n`);
  }
  return resultado.data;
}

export const time = conferir('time.json', esquemaTime, timeJson);
export const elenco = conferir('elenco.json', esquemaElenco, elencoJson).membros;
export const calendario = conferir('calendario.json', esquemaCalendario, calendarioJson).eventos;
export const resultados = conferir('resultados.json', esquemaResultados, resultadosJson);
export const galeria = conferir('galeria.json', esquemaGaleria, galeriaJson).itens;
export const patrocinio = conferir('patrocinadores.json', esquemaPatrocinadores, patrocinadoresJson);
export const perguntas = conferir('perguntas.json', esquemaPerguntas, perguntasJson).perguntas;

export type Membro = (typeof elenco)[number];
export type Evento = (typeof calendario)[number];

/** A seção de placar só aparece depois do primeiro jogo ou conquista. */
export const temResultados = resultados.jogos.length > 0 || resultados.conquistas.length > 0;

// ---------------------------------------------------------------------------
// Ajudantes usados pelos componentes

/** Texto ainda não preenchido: tem [COLCHETES]. */
export const ehPlaceholder = (valor: string) => /\[[^\]]+\]/.test(valor);

/** "a, b e c" ou "a, b ou c" */
export const juntar = (itens: readonly string[], conector = 'e') =>
  itens.length > 1 ? `${itens.slice(0, -1).join(', ')} ${conector} ${itens.at(-1)}` : (itens[0] ?? '');

/** Link do grupo do WhatsApp. Sem link válido, aponta para a seção de contato. */
export const grupoPronto = () => /^https:\/\/\S+$/.test(time.contato.grupoWhatsapp.trim());
export const linkGrupo = () => (grupoPronto() ? time.contato.grupoWhatsapp.trim() : '#contato');

/** Props do botão "Venha treinar com a gente": abre o grupo do WhatsApp. */
export const botaoGrupo = () =>
  grupoPronto()
    ? { href: linkGrupo(), icone: 'whatsapp' as const, dica: '(abre o grupo do WhatsApp)' }
    : { href: '#contato', icone: 'raio' as const, dica: '' };

const usuarioInstagram = () => {
  const usuario = time.contato.instagram.replace(/^@/, '').trim();
  return !usuario || ehPlaceholder(usuario) ? null : usuario;
};
export function linkInstagram(): string | null {
  const usuario = usuarioInstagram();
  return usuario ? `https://www.instagram.com/${usuario}/` : null;
}
/** Abre uma conversa no Direct do Instagram do time. */
export function linkDirect(): string | null {
  const usuario = usuarioInstagram();
  return usuario ? `https://ig.me/m/${usuario}` : null;
}

export const emailPronto = () => !ehPlaceholder(time.contato.email) && time.contato.email.includes('@');

/** "no Centro Esportivo Tietê ou no Parque Ibirapuera" */
export const ondeTreinamos = () => juntar(time.treino.locais.map((l) => `no ${l.nome}`), 'ou');

/** Anos completos desde a fundação (mês e ano); no mínimo 1. */
export function anosDeTime(hoje = new Date()) {
  const { ano, mes } = time.fundacao;
  return Math.max(1, hoje.getFullYear() - ano - (hoje.getMonth() + 1 < mes ? 1 : 0));
}

/** Datas sempre no fuso de São Paulo e em português. */
const fuso = 'America/Sao_Paulo';
export const formatarData = (iso: string, opcoes: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('pt-BR', { timeZone: fuso, ...opcoes }).format(new Date(`${iso}T12:00:00-03:00`));
