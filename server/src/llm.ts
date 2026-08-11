/**
 * Capa de IA (Agente Redactor). Convierte el relato del postulante en un párrafo
 * formal para el formulario oficial, usando Claude.
 *
 * Regla dura del producto (Manual del formulador): NUNCA inventar un dato que el
 * postulante no haya declarado. El prompt lo hace explícito y el fallback sin llave
 * se limita a envolver el texto, sin agregar información.
 *
 * Si no hay ANTHROPIC_API_KEY, cae a la plantilla local `formalize` — así el
 * producto funciona (degradado) mientras conectas la llave.
 */
import Anthropic from '@anthropic-ai/sdk';
import { env, features } from './env.ts';
import { formalize } from '../../src/domain/format.ts';

const client = features.llm ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }) : null;

export interface RedactorInput {
  raw: string; // relato del postulante
  field: string; // campo del formulario (p. ej. "Atributos diferenciadores")
  fondo: string; // nombre del instrumento
  /** Instrucción oficial de las bases para este campo, si ya fue verificada
   * (ver src/data/bibliografia.ts). Nunca es un dato del proyecto. */
  officialContext?: string;
}

const SYSTEM = [
  'Eres el Agente Redactor de un copiloto que ayuda a emprendedores chilenos a postular a fondos públicos (CORFO, Sercotec).',
  'Tu tarea: reescribir el relato del postulante como un párrafo formal, claro y verificable, en el registro que usa un formulario oficial.',
  'Reglas estrictas:',
  '- No inventes ningún dato, cifra, nombre ni hecho que el postulante no haya declarado.',
  '- No exageres ni agregues promesas. Si el relato es vago, mantén la vaguedad; no la rellenes.',
  '- Español de Chile, tercera persona, sin jerga de marketing.',
  '- Devuelve solo el párrafo, sin encabezados ni comillas.',
  '- Si se entrega la instrucción oficial de las bases para este campo, alinea el énfasis y el orden del párrafo a lo que esa instrucción pide explícitamente — sin agregar ningún hecho que no venga del relato del postulante.',
].join('\n');

/** Genera el párrafo formal. Lanza si el proveedor falla (el caller decide el fallback de UI). */
export async function formalizeWithLLM({ raw, field, fondo, officialContext }: RedactorInput): Promise<string> {
  if (!client) {
    // Sin llave: fallback determinista (misma plantilla del prototipo).
    return formalize(raw);
  }
  const contextoOficial = officialContext
    ? `\n\nInstrucción oficial de las bases para este campo:\n"""\n${officialContext}\n"""`
    : '';
  const msg = await client.messages.create({
    model: env.ANTHROPIC_MODEL,
    max_tokens: 800,
    system: SYSTEM,
    messages: [
      {
        role: 'user',
        content: `Instrumento: ${fondo}\nCampo del formulario: ${field}${contextoOficial}\n\nRelato del postulante:\n"""\n${raw}\n"""\n\nReescríbelo como el párrafo formal para ese campo.`,
      },
    ],
  });
  const text = msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();
  return text || formalize(raw);
}

export const llmEnabled = features.llm;
