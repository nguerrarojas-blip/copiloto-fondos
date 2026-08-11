/**
 * Guión del video de 40 segundos exigido por la convocatoria. Se arma con lo que
 * el postulante ya escribió (resumen del proyecto + siguiente atributo
 * narrativo disponible) — no es un texto fijo para cualquier proyecto.
 *
 * Cubre los dos contenidos que estas convocatorias piden mostrar: quién es el
 * equipo y qué problema ataca, y qué ofrece el producto y por qué este fondo.
 */
import type { DocumentModel } from './model';

export function buildGuionText(model: DocumentModel): string {
  const quienSomos = model.resumenProyecto
    ? model.resumenProyecto
    : `Presenta a ${model.razonSocial} y en una frase, qué hace tu proyecto.`;

  const queOfrece = model.atributoClave
    ? model.atributoClave
    : `Explica qué tiene tu producto que no tenga la competencia, y qué esperas lograr con ${model.fondoNombre}.`;

  return [
    `GUIÓN DEL VIDEO DE PRESENTACIÓN — 40 SEGUNDOS`,
    `${model.razonSocial} · ${model.fondoNombre} (${model.fondoInstitucion})`,
    ``,
    `Este guión es un punto de partida a partir de lo que ya contaste en el levantamiento. Grábalo con tus palabras — no lo leas literal frente a cámara.`,
    ``,
    `PARTE 1 · Quién eres y qué problema resuelves (0:00 – 0:20)`,
    quienSomos,
    ``,
    `PARTE 2 · Qué ofreces y por qué este fondo (0:20 – 0:40)`,
    queOfrece,
    ``,
    `Recordatorios de admisibilidad:`,
    `- Máximo 40 segundos, hablado por ti o alguien del equipo (no un locutor externo).`,
    `- Sin música con derechos de autor de fondo si la vas a subir a una plataforma pública.`,
    `- Sube el archivo de video junto con el resto de tus documentos antes del cierre de la convocatoria.`,
  ].join('\n');
}
