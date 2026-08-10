/**
 * Datos del panel del formulador, portados desde `Panel Formulador.dc.html`
 * (INBOX, SECTIONS, BUDGET, FINDINGS, CHECKLIST).
 */

export interface InboxRow {
  proyecto: string;
  rut: string;
  fondo: string;
  estado: string;
  estadoColor: string;
  cierre: string;
  urgente: boolean;
  mine: boolean;
}

export const INBOX: InboxRow[] = [
  { proyecto: 'Feria Digital SpA', rut: '77.451.203-9', fondo: 'Semilla Inicia', estado: '2 secciones marcadas', estadoColor: '#B8863B', cierre: '12 días', urgente: true, mine: false },
  { proyecto: 'Cotiza Pyme Ltda.', rut: '76.902.114-2', fondo: 'Fondo Crece', estado: 'Sin hallazgos', estadoColor: '#1F6F63', cierre: '15 días', urgente: false, mine: false },
  { proyecto: 'Ruta del Maqui SpA', rut: '78.220.671-K', fondo: 'Semilla Inicia', estado: 'Cofinanciamiento bajo el mínimo', estadoColor: '#9C4A3C', cierre: '12 días', urgente: true, mine: true },
  { proyecto: 'Taller Reencuadre', rut: '77.118.400-6', fondo: 'Fondo Crece', estado: 'Admisibilidad incompleta', estadoColor: '#9C4A3C', cierre: '15 días', urgente: false, mine: false },
];

export interface PanelField {
  label: string;
  text: string;
  flag?: string;
  flagColor?: string;
  agentLabel?: string;
  agentNote?: string;
}

export interface PanelSection {
  num: string;
  title: string;
  flag: 'ok' | 'alert';
  showBudget?: boolean;
  fields: PanelField[];
}

export const SECTIONS: PanelSection[] = [
  {
    num: '01', title: 'Introducción', flag: 'ok', fields: [
      { label: '1.1 Resumen del proyecto', text: 'El proyecto consiste en una plataforma digital que permite a comerciantes de ferias libres ofrecer sus productos y gestionar cobros en línea, sin la estructura de comisiones de los marketplaces tradicionales.' },
      { label: '1.2 Usuarios y beneficiarios', text: 'Los usuarios directos son comerciantes de ferias libres de la Región Metropolitana. Los beneficiarios indirectos son los consumidores del entorno de cada feria.' },
    ],
  },
  {
    num: '02', title: 'Antecedentes generales', flag: 'ok', fields: [
      { label: 'Identificación del postulante', text: 'Feria Digital SpA · RUT 77.451.203-9 · Camila Andrade Fuentes, representante legal · Av. Irarrázaval 3421, Ñuñoa.' },
    ],
  },
  {
    num: '03', title: 'Admisibilidad', flag: 'alert', fields: [
      { label: 'Checklist del instrumento', text: 'Persona jurídica vigente ✓ · Monto dentro del tope ✓ · Cofinanciamiento 22,3% ✓ · Administración 10,1% ✓ · Video de 40 segundos pendiente.', flag: '1 pendiente', flagColor: '#9C4A3C', agentLabel: 'Agente QA', agentNote: 'El video es causal de inadmisibilidad. Debe recordárselo explícitamente al postulante antes de entregar.' },
    ],
  },
  {
    num: '04', title: 'Innovación', flag: 'alert', fields: [
      { label: '4.4 Atributos diferenciadores', text: '(i) cobro directo sin comisión; (ii) publicación de catálogo en menos de cinco minutos; (iii) entrega por retiro en el mismo puesto, sin logística de última milla.' },
      { label: '4.7 Competencia y sus debilidades', text: 'La competencia se compone de plataformas de comercio electrónico generalistas y de la venta informal por aplicaciones de mensajería.', flag: 'marcado', flagColor: '#B8863B', agentLabel: 'Agente Benchmark', agentNote: 'Los adjudicados nombran tres o cuatro competidores concretos con su debilidad. Acá está genérico: es la sección donde más puntaje se pierde.' },
    ],
  },
  {
    num: '05', title: 'Escalabilidad y presupuesto', flag: 'alert', showBudget: true, fields: [
      { label: '5.1 Modelo de ingresos', text: 'Suscripción mensual por puesto activo, sin cargo por transacción. Proyección año 2: $25.200.000, equivalente a 6% del mercado direccionable declarado.' },
    ],
  },
  {
    num: '06', title: 'Equipo', flag: 'ok', fields: [
      { label: 'Integrantes', text: 'Camila Andrade — dirección y comercial (100%) · Rodrigo Peña — desarrollo (80%) · Fernanda Lillo — terreno y capacitación (50%).' },
    ],
  },
  {
    num: '07', title: 'Datos estadísticos', flag: 'ok', fields: [
      { label: 'Datos declarados', text: 'Ventas año anterior $8.400.000 · 3 trabajadores · exportaciones $0 · capital previo $2.000.000 · mercado direccionable $420.000.000.' },
    ],
  },
];

export interface PanelBudgetRow {
  categoria: string;
  detalle: string;
  monto: string;
  aporte: string;
  flagged?: boolean;
}

export const PANEL_BUDGET: PanelBudgetRow[] = [
  { categoria: 'Recursos humanos', detalle: 'Desarrollo del módulo de pagos (4 meses)', monto: '$5.400.000', aporte: '$1.800.000' },
  { categoria: 'Servicios de terceros', detalle: 'Integración con proveedor de transferencias', monto: '$2.100.000', aporte: '$300.000' },
  { categoria: 'Equipamiento', detalle: '12 tablets para puestos piloto', monto: '$2.400.000', aporte: '$700.000', flagged: true },
  { categoria: 'Difusión y marketing', detalle: 'Campaña en 4 ferias y material impreso', monto: '$2.600.000', aporte: '$800.000' },
  { categoria: 'Gastos de administración', detalle: 'Contabilidad y arriendo de oficina', monto: '$1.400.000', aporte: '$400.000' },
];

export interface PanelFinding {
  agent: string;
  color: string;
  section: number;
  text: string;
}

export const FINDINGS: PanelFinding[] = [
  { agent: 'QA / Admisibilidad', color: '#9C4A3C', section: 2, text: 'Falta el video de 40 segundos exigido por la convocatoria.' },
  { agent: 'Benchmark · adjudicados', color: '#B8863B', section: 3, text: 'La sección de competencia está genérica frente al estándar de los expedientes adjudicados.' },
  { agent: 'Coherencia', color: '#1F6F63', section: 4, text: 'El ítem de equipamiento (12 tablets) no aparece justificado en la narrativa del proyecto.' },
];

export const CHECKLIST: string[] = [
  'Revisé todas las secciones marcadas por los agentes',
  'El checklist de admisibilidad del instrumento está completo o su pendiente quedó advertido al postulante',
  'El expediente no contiene cifras ni hechos que el postulante no haya declarado',
  'Dejé el comentario de cierre explicando qué cambié y por qué',
];
