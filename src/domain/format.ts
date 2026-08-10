/**
 * Utilidades de formato y normalización numérica.
 * Portadas literalmente desde `Copiloto Final.dc.html` (fmt, num, formalize).
 */

/** Formatea un número como monto en pesos chilenos: fmt(15000000) -> "$15.000.000". */
export function fmt(n: number | string): string {
  return '$' + (Number(n) || 0).toLocaleString('es-CL');
}

/** Extrae el valor numérico de un texto, descartando todo lo que no sea dígito. */
export function num(v: unknown): number {
  return Number(String(v == null ? '' : v).replace(/[^0-9]/g, '')) || 0;
}

/**
 * Envuelve el texto crudo del postulante en un párrafo "formal".
 * En producción esto lo genera el Agente Redactor (LLM); aquí es la plantilla del prototipo.
 */
export function formalize(text: string): string {
  const t = String(text).trim().replace(/\s+/g, ' ');
  return (
    t.charAt(0).toUpperCase() +
    t.slice(1).replace(/\.?$/, '.') +
    ' (Redactado por el Agente Redactor a partir del relato del postulante; sujeto a revisión del formulador.)'
  );
}
