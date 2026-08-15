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
 * Capital Abeja Emprende (Sercotec): el Formulario Proyecto de Negocio (Canvas)
 * tiene 10 ámbitos evaluados con pregunta oficial explícita — los 9 del Canvas
 * más "Sustentabilidad", propio de este instrumento. Se cita cada uno con la
 * pregunta literal de la pauta de evaluación; "Costos" no tiene cita propia
 * porque ya lo cubre el cuadro de presupuesto real de la app (categoría,
 * detalle, monto, aporte), no un campo narrativo separado.
 * Fuente: Bases de Convocatoria Capital Abeja Emprende 2025 (Metropolitana,
 * Sercotec), Anexo N°6 "Criterios de Evaluación Técnica", tabla "Formulario
 * Modelo de Proyecto de Negocio (60%)".
 */
const CAPITAL_ABEJA: Record<string, OfficialContext> = {
  canvas_clientes: {
    texto:
      'Ámbito "Clientes": "¿Quiénes son los principales clientes? ¿A qué tipo de clientes apunta nuestro negocio?" Se evalúa mejor si se describen las características de los clientes con detalle (edad, género, ubicación geográfica, poder adquisitivo, frecuencia de compra), no solo se les nombra.',
    fuente: 'Bases Capital Abeja Emprende 2025 (Sercotec), Anexo N°6, ámbito "1. Clientes"',
  },
  canvas_oferta: {
    texto:
      'Ámbito "Elemento diferenciador u Oferta de Valor": "¿Por qué los clientes deberían preferirme por sobre los demás? ¿Por qué los clientes deberían preferir mi producto/servicio por sobre los demás?"',
    fuente: 'Bases Capital Abeja Emprende 2025 (Sercotec), Anexo N°6, ámbito "2. Elemento diferenciador/Oferta de Valor"',
  },
  canvas_canales: {
    texto:
      'Ámbito "Medios de distribución/atención": "¿A través de qué medios realizo las ventas a mis clientes? ¿Cuáles son los medios, para dar a conocer mi producto/servicio, que prefieren mi/s tipo/s de clientes? ¿Cuáles son los medios con los que obtendría mayor venta en mi modelo de negocio?" Se evalúa mejor si se justifica por qué esos medios son los más adecuados para cada tipo de cliente.',
    fuente: 'Bases Capital Abeja Emprende 2025 (Sercotec), Anexo N°6, ámbito "3. Medios de distribución/atención"',
  },
  canvas_relacion: {
    texto:
      'Ámbito "Relación con los clientes": "¿Qué relación tiene o espera tener con cada tipo de cliente descrito? ¿Alguno de los medios por los cuales busca relacionarse con el cliente, tiene algún costo asociado?"',
    fuente: 'Bases Capital Abeja Emprende 2025 (Sercotec), Anexo N°6, ámbito "4. Relación con los clientes"',
  },
  q10: {
    texto:
      'Ámbito "Ingresos": "¿Por cuál tipo de producto/servicio estarían dispuestos a pagar más nuestros clientes? ¿Por cuál tipo de producto/servicio pagan actualmente los clientes? ¿Qué tipo de medio de pago prefieren utilizar mis clientes?"',
    fuente: 'Bases Capital Abeja Emprende 2025 (Sercotec), Anexo N°6, ámbito "5. Ingresos"',
  },
  canvas_recursos: {
    texto:
      'Ámbito "Elementos clave": "¿Qué elementos se debe adquirir para generar mi producto/servicio y entregue a los diferentes tipos de clientes?" Se evalúa mejor si se describen al menos dos elementos clave, no solo se mencionan.',
    fuente: 'Bases Capital Abeja Emprende 2025 (Sercotec), Anexo N°6, ámbito "6. Elementos clave"',
  },
  canvas_actividades: {
    texto:
      'Ámbito "Acciones/actividades clave": "¿Qué acciones se deben realizar para que mi producto/servicio se entregue a los diferentes tipos de clientes?"',
    fuente: 'Bases Capital Abeja Emprende 2025 (Sercotec), Anexo N°6, ámbito "7. Acciones/actividades clave"',
  },
  canvas_alianzas: {
    texto:
      'Ámbito "Alianzas clave": "¿Cuáles son las alianzas realizadas o a realizar para mejorar la satisfacción de mis clientes?"',
    fuente: 'Bases Capital Abeja Emprende 2025 (Sercotec), Anexo N°6, ámbito "9. Alianzas clave"',
  },
  canvas_sustentabilidad: {
    texto:
      'Ámbito "Sustentabilidad": "¿Qué acciones puedo implementar en mi negocio, desde el punto de vista de la eficiencia energética, energías renovables y economía circular, de manera de hacer mi producto o servicio más sustentable? ¿Tenía ya incorporada alguna de estas acciones en el proceso de mi producto o servicio?"',
    fuente: 'Bases Capital Abeja Emprende 2025 (Sercotec), Anexo N°6, ámbito "10. Sustentabilidad"',
  },
};

/**
 * Fondo Crece (Sercotec): el Formulario Proyecto de Negocio también usa
 * Canvas, con 9 ámbitos evaluados según pauta oficial. La redacción de cada
 * pregunta difiere de la de Capital Abeja aunque el ámbito sea el mismo
 * concepto, así que se cita el texto propio de esta convocatoria y no el de
 * Abeja. "Costos" no tiene cita propia por la misma razón que en Abeja: ya
 * lo cubre el cuadro de presupuesto real de la app.
 * Fuente: Bases de Convocatoria Crece – Fondo de Desarrollo de Negocios 2025
 * (Multisectorial Urbano, Sercotec), Anexo N°5 "Criterios de Evaluación
 * Técnica", tabla "Proyecto de Negocio (60%)".
 */
const FONDO_CRECE: Record<string, OfficialContext> = {
  canvas_clientes: {
    texto:
      'Ámbito "Clientes": "¿Quiénes son los clientes a los cuales les estamos entregando valor? ¿Cuáles son los segmentos más importantes de clientes que apunta nuestro negocio?" Se evalúa mejor si los segmentos se describen con más de un tipo de variable de segmentación (geográfica, demográfica, psicográfica o conductual).',
    fuente: 'Bases de Convocatoria Crece 2025 (Sercotec), Anexo N°5, ámbito "1. Clientes"',
  },
  canvas_oferta: {
    texto:
      'Ámbito "Oferta de Valor/Elemento diferenciador": "¿Por qué deberían preferirme el segmento de clientes que apunta mi Proyecto de Negocio, y no quedarse con la competencia?" Se evalúa mejor si la propuesta especifica las diferencias concretas con la competencia, no solo que "resuelve el problema".',
    fuente: 'Bases de Convocatoria Crece 2025 (Sercotec), Anexo N°5, ámbito "2. Oferta de Valor/Elemento diferenciador"',
  },
  canvas_canales: {
    texto:
      'Ámbito "Canales de distribución": "¿A través de qué canales quiero llegar a mis clientes? ¿Cuáles son los canales que funcionan mejor de acuerdo con mi segmento de clientes? ¿Cuáles son los canales más rentables de mi modelo de negocio?"',
    fuente: 'Bases de Convocatoria Crece 2025 (Sercotec), Anexo N°5, ámbito "3. Canales de distribución"',
  },
  canvas_relacion: {
    texto:
      'Ámbito "Relación con los clientes": "¿Qué relación espera tener con cada segmento de clientes descrito? ¿Cuál es el costo de establecer cada una de las formas de relacionarse con cada segmento?"',
    fuente: 'Bases de Convocatoria Crece 2025 (Sercotec), Anexo N°5, ámbito "4. Relación con los clientes"',
  },
  q10: {
    texto:
      'Ámbito "Ingresos": "¿Por qué están dispuestos a pagar nuestros diferentes segmentos de clientes? ¿Por qué pagan actualmente nuestros segmentos potenciales de clientes? ¿Por qué medio prefiere pagar cada segmento de clientes?" Se evalúa describir cada ingreso del negocio y a través de qué medio se percibirá.',
    fuente: 'Bases de Convocatoria Crece 2025 (Sercotec), Anexo N°5, ámbito "5. Ingresos"',
  },
  canvas_recursos: {
    texto:
      'Ámbito "Recursos claves": "¿Qué recursos clave se deben gestionar para que nuestra oferta de valor llegue a los diferentes segmentos de clientes definidos en el modelo de negocios?" Se evalúa mejor si se describen al menos tres recursos clave.',
    fuente: 'Bases de Convocatoria Crece 2025 (Sercotec), Anexo N°5, ámbito "6. Recursos claves"',
  },
  canvas_actividades: {
    texto:
      'Ámbito "Actividades claves": "¿Qué actividades clave se deben desarrollar para que nuestra oferta de valor llegue a los diferentes segmentos de clientes definidos en el modelo de negocios?"',
    fuente: 'Bases de Convocatoria Crece 2025 (Sercotec), Anexo N°5, ámbito "7. Actividades claves"',
  },
  canvas_alianzas: {
    texto:
      'Ámbito "Alianzas claves": "Identifique las alianzas claves que lo ayudan a mejorar la satisfacción de sus actuales y/o potenciales clientes a través de la oferta de valor de su proyecto de negocio (proveedores, empresas afines, entre otros)."',
    fuente: 'Bases de Convocatoria Crece 2025 (Sercotec), Anexo N°5, ámbito "9. Alianzas claves"',
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
