/**
 * Bibliografía oficial del Agente Redactor: la instrucción literal que cada
 * convocatoria da para un campo del formulario, para que el párrafo generado
 * se alinee con lo que el instrumento realmente pide — no con una idea
 * genérica de "innovación" o "modelo de ingresos".
 *
 * Regla dura (Manual del Formulador): esto es contexto sobre qué pide el
 * FORMULARIO, nunca un dato del proyecto. El postulante sigue siendo la única
 * fuente de los hechos; esto solo informa el registro y el énfasis.
 *
 * Cada entrada cita su fuente pública para poder auditarla y actualizarla
 * cuando la institución publique bases nuevas — ver README §El catálogo de
 * fondos viene de la fuente oficial.
 */
import type { FondoId } from './funds';

export interface OfficialContext {
  /** Instrucción oficial, citada o resumida fielmente desde la fuente. */
  texto: string;
  /** Documento público de origen, para auditar y refrescar. */
  fuente: string;
}

/**
 * Semilla Inicia (CORFO): extraído literalmente del formulario oficial de
 * postulación publicado por Corfo.
 * Fuente: "Versión en Word del formulario de postulación Semilla Inicia",
 * https://www.corfo.cl/sites/cpp/inf/semilla-inicia
 */
const SEMILLA_INICIA: Record<string, OfficialContext> = {
  q1: {
    texto:
      'Resumen Ejecutivo: "Haz un resumen de tu proyecto considerando: qué problema o necesidad resuelve, cuál es la solución, cómo ésta resuelve el problema, a quién va dirigida, cuál es el tamaño de mercado, cuál es la competencia, cuál es la innovación y cómo piensas comercializarla."',
    fuente: 'Formulario oficial de postulación Semilla Inicia (CORFO)',
  },
  q3: {
    texto:
      '"Describe cuál es la oportunidad o el problema que buscas resolver con tu solución." Menciona dónde está presente el problema o la oportunidad (comuna, región, zona territorial, etc.).',
    fuente: 'Formulario oficial de postulación Semilla Inicia (CORFO), sección Innovación',
  },
  q4: {
    texto:
      '"Describe por qué es relevante para tu potencial cliente resolver este problema o atender la oportunidad identificada." Explica por qué es importante para esa industria resolverlo.',
    fuente: 'Formulario oficial de postulación Semilla Inicia (CORFO), sección Innovación',
  },
  q5: {
    texto: '"Describe en qué consiste tu producto y/o servicio": qué es, qué hace, cómo funciona.',
    fuente: 'Formulario oficial de postulación Semilla Inicia (CORFO), sección Innovación',
  },
  q6: {
    texto:
      'La sección pide referirse a los 3 atributos más relevantes de la solución frente a la competencia, explicando qué características de la solución justifican los beneficios que recibiría el cliente y por qué la preferiría sobre otras alternativas.',
    fuente: 'Formulario oficial de postulación Semilla Inicia (CORFO), sección Innovación',
  },
  q7: {
    texto:
      'Indicar en qué componente del proyecto se hace la principal innovación (pueden ser varios, pero se debe señalar el principal).',
    fuente: 'Formulario oficial de postulación Semilla Inicia (CORFO), sección Innovación',
  },
  q8: {
    texto:
      'Describir el estado de desarrollo señalando pasos e hitos relevantes logrados (testeos, avances, pruebas o pilotos realizados), y el estado de protección del producto o servicio (patentes u otra propiedad industrial).',
    fuente: 'Formulario oficial de postulación Semilla Inicia (CORFO), sección Innovación',
  },
  q9: {
    texto:
      '"Describe a tus principales competidores o soluciones existentes en el mercado indicando sus atributos y debilidades en relación al problema detectado" — competidores directos o que resuelven el problema con productos sustitutos.',
    fuente: 'Formulario oficial de postulación Semilla Inicia (CORFO), sección Innovación',
  },
  q10: {
    texto:
      '"Describa el modelo de ingresos" refiriéndose a precios de venta, costos de operación, márgenes de utilidad y estrategias de venta.',
    fuente: 'Formulario oficial de postulación Semilla Inicia (CORFO), sección Escalabilidad',
  },
};

/**
 * Capital Abeja Emprende (Sercotec): el formulario de proyecto de negocio usa
 * la metodología Canvas (Osterwalder), con ámbitos y ponderaciones definidos
 * en las bases. Se cita la estructura oficial, no una convocatoria regional
 * específica (los montos y plazos varían por región; la metodología no).
 * Fuente: Bases de convocatoria Capital Abeja Emprende (Sercotec),
 * sección 2.3.4 "Formulario Proyecto de Negocio (CANVAS)".
 */
const CAPITAL_ABEJA: Record<string, OfficialContext> = {
  q1: {
    texto:
      'El formulario Canvas pide describir el elemento diferenciador u oferta de valor: "características que destaquen y diferencien tu proyecto por sobre los demás".',
    fuente: 'Bases Capital Abeja Emprende (Sercotec), Formulario Proyecto de Negocio (CANVAS)',
  },
  c1: {
    texto:
      'El ámbito "Clientes" del Canvas pide identificar a qué clientes apunta la propuesta y por qué te preferirían por sobre otras alternativas — se evalúa explícitamente el nivel de detalle con que se describen las características de esos clientes.',
    fuente: 'Bases Capital Abeja Emprende (Sercotec), Formulario Proyecto de Negocio (CANVAS)',
  },
  q3: {
    texto:
      'El ámbito "Ingresos" del Canvas pide describir qué ingresos recibirá el negocio y a través de qué medios de pago los percibirá.',
    fuente: 'Bases Capital Abeja Emprende (Sercotec), Formulario Proyecto de Negocio (CANVAS)',
  },
};

/**
 * Fondo Crece (Sercotec): el Formulario de Proyecto de Negocio también usa la
 * metodología Canvas, con 9 ámbitos evaluados según una pauta oficial que trae
 * la pregunta exacta de cada uno. Solo se citan los tres ámbitos que
 * corresponden de forma directa a un campo narrativo ya existente en la app
 * (Beneficiarios → Clientes, Descripción del producto → Oferta de Valor,
 * Modelo de ingresos → Ingresos). Los ámbitos sin equivalente en la app hoy
 * (Canales de distribución, Relación con clientes, Recursos/Actividades
 * clave, Costos, Alianzas clave) y los campos de la app sin pregunta oficial
 * explícita en este instrumento (Resumen, Problema u oportunidad, Mejora
 * productiva a financiar) se dejan sin contexto — mejor sin cita que una
 * forzada o que no corresponda.
 * Fuente: Bases de Convocatoria Crece – Fondo de Desarrollo de Negocios 2025
 * (Multisectorial Urbano, Sercotec), Anexo N°5 "Criterios de Evaluación
 * Técnica", tabla "Proyecto de Negocio (60%)".
 */
const FONDO_CRECE: Record<string, OfficialContext> = {
  q2: {
    texto:
      'Ámbito "Clientes" del Canvas: "¿Quiénes son los clientes a los cuales les estamos entregando valor? ¿Cuáles son los segmentos más importantes de clientes que apunta nuestro negocio?" Se evalúa mejor si los segmentos se describen con más de un tipo de variable de segmentación (geográfica, demográfica, psicográfica o conductual).',
    fuente: 'Bases de Convocatoria Crece 2025 (Sercotec), Anexo N°5, ámbito "1. Clientes"',
  },
  q5: {
    texto:
      'Ámbito "Oferta de Valor/Elemento diferenciador" del Canvas: "¿Por qué deberían preferirme el segmento de clientes que apunta mi Proyecto de Negocio, y no quedarse con la competencia?" Se evalúa mejor si la propuesta especifica las diferencias concretas con la competencia, no solo que "resuelve el problema".',
    fuente: 'Bases de Convocatoria Crece 2025 (Sercotec), Anexo N°5, ámbito "2. Oferta de Valor/Elemento diferenciador"',
  },
  q10: {
    texto:
      'Ámbito "Ingresos" del Canvas: "¿Por qué están dispuestos a pagar nuestros diferentes segmentos de clientes? ¿Por qué pagan actualmente nuestros segmentos potenciales de clientes? ¿Por qué medio prefiere pagar cada segmento de clientes?" Se evalúa describir cada ingreso del negocio y a través de qué medio se percibirá.',
    fuente: 'Bases de Convocatoria Crece 2025 (Sercotec), Anexo N°5, ámbito "5. Ingresos"',
  },
};

const BY_FONDO: Partial<Record<FondoId, Record<string, OfficialContext>>> = {
  'semilla-inicia': SEMILLA_INICIA,
  'capital-abeja': CAPITAL_ABEJA,
  'fondo-crece': FONDO_CRECE,
};

/** Instrucción oficial para un campo, si ya fue verificada contra la fuente pública. */
export function getOfficialContext(fondoId: FondoId, qid: string): OfficialContext | undefined {
  return BY_FONDO[fondoId]?.[qid];
}
