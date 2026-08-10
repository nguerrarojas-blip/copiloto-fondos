/**
 * Instrumentación de métricas (Legal y Metricas §3).
 *
 * REGLA DURA: ningún evento lleva contenido del proyecto del postulante — ni el
 * texto que escribió ni sus cifras. Solo identificadores, marcas de tiempo,
 * longitudes y categorías. Por eso `track()` filtra las props a tipos permitidos
 * y rechaza strings largas que podrían ser contenido.
 */

export type MetricEvent =
  | 'levantamiento_iniciado'
  | 'expediente_enviado_revision'
  | 'expediente_abierto_formulador'
  | 'expediente_aprobado'
  | 'seccion_editada'
  | 'enlace_abierto'
  | 'enlace_vencido'
  | 'resultado_admisibilidad'
  | 'precio_declarado'
  // Eventos secundarios
  | 'agente_redactor_fallo'
  | 'respuesta_libre_usada'
  | 'sugerencia_usada'
  | 'alerta_presupuesto_mostrada'
  | 'comentario_devuelto'
  | 'comentario_resuelto'
  | 'costo_llm_expediente';

/** Solo se permiten props numéricas, booleanas, marcas de tiempo o categorías cortas. */
export type MetricProps = Record<string, number | boolean | undefined>;

interface TrackedEvent {
  event: MetricEvent;
  ts: number;
  props: MetricProps;
}

const buffer: TrackedEvent[] = [];

/** Descarta cualquier valor que no sea número/booleano (evita filtrar contenido). */
function sanitize(props?: MetricProps): MetricProps {
  const out: MetricProps = {};
  if (!props) return out;
  for (const [k, v] of Object.entries(props)) {
    if (typeof v === 'number' || typeof v === 'boolean') out[k] = v;
  }
  return out;
}

export function track(event: MetricEvent, props?: MetricProps): void {
  buffer.push({ event, ts: Date.now(), props: sanitize(props) });
  // En producción: enviar a la herramienta de analítica. Aquí queda en memoria.
  if (typeof console !== 'undefined' && import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[metric]', event, buffer[buffer.length - 1].props);
  }
}

/** Expuesto para pruebas / depuración. */
export function _events(): ReadonlyArray<TrackedEvent> {
  return buffer;
}
