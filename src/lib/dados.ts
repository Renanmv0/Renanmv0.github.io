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
  fundacao: z.object({ ano: z.number().int().min(1900), confirmado: z.boolean() }),
  descricaoSeo: texto,
  contato: z.object({
    whatsapp: texto,
    mensagemWhatsapp: texto,
    mensagemPatrocinio: texto,
    instagram: texto,
    email: texto,
  }),
  treino: z.object({
    local: texto,
    endereco: texto,
    linkMapa: texto,
    dias: texto,
    horario: texto,
    confirmado: z.boolean(),
    chegada: texto,
    levar: z.array(texto),
    emprestamos: z.array(texto),
  }),
  numeros: z.array(z.object({ valor: z.number().min(0), rotulo: texto, confirmado: z.boolean() })),
  historia: z.array(texto).min(1),
  valores: z.array(z.object({ titulo: texto, texto })),
  video: z.object({ youtubeId: texto, titulo: texto }),
});

export const POSICOES = ['Ataque', 'Meio', 'Defesa', 'Goleiro'] as const;

const esquemaElenco = z.object({
  atletas: z.array(
    z.object({
      nome: texto,
      numero: z.number().int().min(0).max(99),
      posicao: z.enum(POSICOES, { error: 'use Ataque, Meio, Defesa ou Goleiro' }),
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
export const elenco = conferir('elenco.json', esquemaElenco, elencoJson).atletas;
export const calendario = conferir('calendario.json', esquemaCalendario, calendarioJson).eventos;
export const resultados = conferir('resultados.json', esquemaResultados, resultadosJson);
export const galeria = conferir('galeria.json', esquemaGaleria, galeriaJson).itens;
export const patrocinio = conferir('patrocinadores.json', esquemaPatrocinadores, patrocinadoresJson);
export const perguntas = conferir('perguntas.json', esquemaPerguntas, perguntasJson).perguntas;

export type Atleta = (typeof elenco)[number];
export type Evento = (typeof calendario)[number];

// ---------------------------------------------------------------------------
// Ajudantes usados pelos componentes

/** Texto ainda não preenchido: tem [COLCHETES]. */
export const ehPlaceholder = (valor: string) => /\[[^\]]+\]/.test(valor);

const soDigitos = (valor: string) => valor.replace(/\D/g, '');

/** Link do WhatsApp com mensagem pronta. Sem número válido, aponta para a seção de contato. */
export function linkWhatsapp(mensagem = time.contato.mensagemWhatsapp): string {
  const numero = soDigitos(time.contato.whatsapp);
  if (numero.length < 12) return '#contato';
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

export const whatsappPronto = () => soDigitos(time.contato.whatsapp).length >= 12;

export function linkInstagram(): string | null {
  const usuario = time.contato.instagram.replace(/^@/, '').trim();
  if (!usuario || ehPlaceholder(usuario)) return null;
  return `https://www.instagram.com/${usuario}/`;
}

export const anosDeTime = (hoje = new Date()) => Math.max(1, hoje.getFullYear() - time.fundacao.ano);

/** Datas sempre no fuso de São Paulo e em português. */
const fuso = 'America/Sao_Paulo';
export const formatarData = (iso: string, opcoes: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('pt-BR', { timeZone: fuso, ...opcoes }).format(new Date(`${iso}T12:00:00-03:00`));
