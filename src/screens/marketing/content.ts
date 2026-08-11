/**
 * Copy estático del sitio público (Landing Publica.dc.html). Lo que sí puede
 * derivarse de datos reales de la app (fondos, corpus de adjudicados) se lee
 * desde `data/catalogo.ts`, `data/funds.ts` y `data/corpus.ts` en
 * `LandingPublica.tsx`, para que el marketing y la app nunca se desalineen.
 */

export const STATS = [
  { value: 'Todo el catálogo', label: 'de CORFO, Sercotec y ANID, sincronizado desde la fuente oficial', color: 'var(--teal)' },
  { value: '40–60 min', label: 'de levantamiento, pausable en cualquier momento', color: 'var(--ink)' },
  { value: '100%', label: 'de los expedientes revisados por un formulador humano', color: 'var(--amber)' },
  { value: '0', label: 'datos inventados: todo sale de lo que tú declaras', color: 'var(--steel)' },
];

export const PROBLEMAS = [
  { titulo: 'Errores administrativos', copy: 'Un RUT con el dígito verificador malo o un certificado de vigencia vencido bastan para que el expediente no llegue a evaluación.' },
  { titulo: 'Presupuestos fuera de las reglas', copy: 'Cada instrumento topa el monto, exige un cofinanciamiento mínimo y limita categorías como administración. Casi nadie lee ese detalle a tiempo.' },
  { titulo: 'Secciones que se leen en blanco', copy: '"No tenemos competencia" o una proyección de ventas sin respaldo son las respuestas que más puntaje descuentan.' },
];

export const PASOS = [
  { n: '01', agente: 'Matchmaker', color: 'var(--amber)', titulo: 'Qué fondo te calza', copy: 'Cruza tu perfil con las convocatorias abiertas del catálogo oficial y te da el instrumento, su tope y cuándo cierra. Si ninguna te calza, también te lo dice.' },
  { n: '02', agente: 'Redactor + Intake', color: 'var(--teal)', titulo: 'Levantamos tu proyecto', copy: 'La narrativa se conversa; los números se llenan en formularios con las reglas del fondo aplicadas mientras escribes.' },
  { n: '03', agente: 'QA + Coherencia', color: 'var(--rose)', titulo: 'Verificamos admisibilidad', copy: 'Cada causal de inadmisibilidad revisada, y cada contradicción entre lo que dice tu relato y lo que dicen tus cifras.' },
  { n: '04', agente: 'Benchmark', color: 'var(--amber)', titulo: 'Calibramos contra adjudicados', copy: 'Contrastamos tus montos y proyecciones con postulaciones que ganaron el mismo instrumento. Te avisamos si quedas fuera de rango.' },
];

export const EQUIPO = [
  { nombre: 'Formuladores asociados', rol: 'revisión', bio: 'Cada expediente lo revisa un formulador con proyectos adjudicados en el mismo instrumento. Trabajan por expediente revisado, no por hora, y firman lo que aprueban.' },
  { nombre: 'Equipo de producto', rol: 'plataforma', bio: 'Diseño y desarrollo del levantamiento, los agentes y el panel de revisión. Medimos cuánto tiene que corregir el formulador: si sube, es señal de que el producto falló.' },
  { nombre: 'Corpus de referencia', rol: 'datos', bio: 'Postulaciones adjudicadas cedidas por sus titulares, que usamos para calibrar rangos de monto, cofinanciamiento y proyecciones. Anónimas por diseño.' },
];

export const FAQS = [
  { q: '¿Ustedes envían la postulación por mí?', a: 'No. Te entregamos el expediente completo en PDF y Word, y tú lo transcribes y envías en la plataforma de la institución. Hacerlo en tu nombre requiere tus credenciales, y no queremos tenerlas.' },
  { q: '¿Qué significa exactamente "garantizamos admisibilidad"?', a: 'Que respondemos por las causales de inadmisibilidad que están en nuestras manos: datos administrativos, reglas del presupuesto, secciones completas, coherencia interna. Si tu postulación es declarada inadmisible por una de esas, te devolvemos lo pagado. Lo que depende de ti — grabar el video, adjuntar tus documentos, enviar antes del cierre — no lo podemos garantizar, y te lo advertimos explícitamente en la entrega.' },
  { q: '¿Es una IA la que escribe mi postulación?', a: 'Los agentes redactan las secciones narrativas a partir de lo que tú declaras, y tú apruebas cada párrafo antes de que entre al expediente. Después un formulador humano con proyectos adjudicados lo revisa completo. Nunca sale nada que tú no hayas dicho: los agentes no inventan datos, cifras ni competidores.' },
  { q: '¿Cuánto tiempo me toma?', a: 'El diagnóstico, un minuto. El levantamiento completo entre 40 y 60 minutos, y se puede pausar en cualquier momento — te mandamos un enlace para retomar donde quedaste. La revisión del formulador toma hasta 48 horas hábiles.' },
  { q: '¿Qué pasa con los datos de mi proyecto?', a: 'Se usan solo para elaborar tu postulación. No entrenamos modelos con ellos, no se comparten con terceros y puedes pedir que se eliminen en cualquier momento. Te pedimos el consentimiento explícito antes de recoger los datos de tu empresa, no enterrado en los términos.' },
  { q: '¿De dónde salen las reglas de cada fondo?', a: 'De las bases publicadas por la propia institución. Sincronizamos el catálogo desde la fuente oficial y extraemos de cada convocatoria su tope, el cofinanciamiento mínimo, los límites por categoría de gasto, los requisitos de admisibilidad y la fecha de cierre. Cuando la institución publica bases nuevas, las reglas se actualizan — no dependen de que alguien acá se acuerde de cambiarlas.' },
  { q: 'Ningún fondo abierto me calza. ¿Y ahora?', a: 'El diagnóstico te dice qué instrumento te calzaría y cuándo se espera que abra su próxima convocatoria. Te registramos el correo y te avisamos ese día, con el diagnóstico ya hecho para que solo continúes. Preferimos eso a hacerte postular a un fondo equivocado por no dejarte ir.' },
  { q: '¿En qué se diferencia de contratar una consultora?', a: 'Una consultora cobra por las horas que dedica a transcribir tu proyecto a un formulario. Nosotros automatizamos esa transcripción y dejamos la hora del formulador para lo que decide una adjudicación: criterio, cifras defendibles y detectar lo que no dijiste. Cobramos una fracción, y te decimos cuando no te conviene postular.' },
];

export const DIAG_PREVIEW = [
  { n: '01', q: '¿Ya sabes a qué fondo quieres postular?' },
  { n: '02', q: '¿Cómo postulas?' },
  { n: '03', q: '¿En qué etapa está tu proyecto?' },
  { n: '04', q: '¿Cuál describe mejor tu sector?' },
];

export interface FooterLink {
  label: string;
  href: string;
}
export const FOOTER_COLS: { titulo: string; links: FooterLink[] }[] = [
  {
    titulo: 'Producto',
    links: [
      { label: 'Cómo funciona', href: '#como' },
      { label: 'Casos de éxito', href: '#casos' },
      { label: 'Fondos que cubrimos', href: '#fondos' },
      { label: 'Diagnóstico gratis', href: '/app' },
    ],
  },
  {
    titulo: 'Nosotros',
    links: [
      { label: 'Quiénes somos', href: '#nosotros' },
      { label: 'Preguntas frecuentes', href: '#preguntas' },
      { label: 'contacto@copilotofondos.cl', href: 'mailto:contacto@copilotofondos.cl' },
    ],
  },
  {
    titulo: 'Legal',
    links: [
      { label: 'Términos y condiciones', href: '/interno/legal' },
      { label: 'Política de privacidad', href: '/interno/legal' },
      { label: 'Tratamiento de datos', href: '/interno/legal' },
      { label: 'Alcance de la garantía', href: '/interno/legal' },
    ],
  },
];
