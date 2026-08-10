/** Anexo legal e instrumentación de métricas (Legal y Metricas.dc.html).
 * Borrador de diseño — requiere revisión de abogado antes del primer usuario. */
import type { ReactNode } from 'react';
import { Card, Pill } from '../../ui/primitives';

export function LegalMetricas() {
  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '28px 20px 60px' }}>
      <Pill color="var(--rose)" bg="var(--bg-error)">Borrador de diseño · requiere revisión de abogado</Pill>
      <h1 style={{ fontSize: 26, margin: '12px 0' }}>Textos legales e instrumentación de métricas</h1>

      <Card accent="var(--rose)" style={{ marginBottom: 20 }}>
        <strong>Advertencia</strong>
        <p style={{ fontSize: 13, color: 'var(--slate)' }}>
          Estos textos definen qué debe decir el producto y en qué tono. No reemplazan la revisión de un abogado, especialmente
          en lo relativo a la Ley 19.628 sobre protección de la vida privada y a la garantía de admisibilidad, que es una
          obligación contractual real.
        </p>
      </Card>

      <Sec title="1 · Términos del servicio">
        <Sub t="1.1 Qué hacemos">
          Copiloto elabora, junto contigo, el contenido de una postulación a un fondo público: levanta la información de tu
          proyecto, redacta las secciones narrativas del formulario oficial, estructura tu presupuesto según las reglas del
          instrumento, verifica los requisitos de admisibilidad, y somete el resultado a la revisión de un formulador con
          experiencia verificable.
        </Sub>
        <Sub t="1.2 Qué garantizamos y qué no">
          Garantizamos la <strong>admisibilidad formal</strong> del expediente que entregamos: montos dentro de tope,
          estructura de cofinanciamiento, límites por categoría de gasto, secciones obligatorias completas y consistencia de
          los datos declarados. Si es declarado inadmisible por una causal bajo nuestro control, devolvemos íntegro lo pagado.
          <strong> No garantizamos la adjudicación del fondo.</strong> Tampoco la admisibilidad cuando la causal depende de ti:
          documentos que debes adjuntar, el video, la vigencia de tu sociedad, la veracidad de lo declarado, o el envío dentro
          del plazo.
        </Sub>
        <Sub t="1.3 Qué te corresponde a ti">
          Entregar información veraz; adjuntar los documentos que solo tú posees; grabar y subir el video cuando se exija; y
          presentar la postulación dentro del plazo. No presentamos la postulación en tu nombre, por decisión de diseño: la
          responsabilidad de lo declarado es tuya y debe seguir siéndolo.
        </Sub>
        <Sub t="1.4 Condiciones del piloto">
          Durante el piloto el servicio es gratuito y los cupos son limitados. A cambio pedimos un proyecto real, completar el
          levantamiento dentro del plazo y una conversación de retroalimentación al cierre. La garantía de admisibilidad rige
          igual.
        </Sub>
      </Sec>

      <Sec title="2 · Privacidad y tratamiento de datos">
        <Sub t="2.1 Qué datos recogemos">
          Datos de identificación de tu empresa y su representante legal; la información de tu proyecto, incluidas cifras
          comerciales y financieras no públicas; y datos de uso del servicio.
        </Sub>
        <Sub t="2.2 Para qué los usamos">
          Exclusivamente para elaborar tu postulación y prestarte el servicio.{' '}
          <strong>No usamos la información de tu proyecto para entrenar modelos de lenguaje</strong> ni para elaborar la
          postulación de otro cliente.
        </Sub>
        <Sub t="2.3 Con quién los compartimos">
          Con el formulador asignado (bajo confidencialidad) y con los proveedores tecnológicos necesarios, bajo condiciones
          que prohíben el uso de tus datos para fines propios, incluido el entrenamiento de modelos. Con nadie más. No vendemos
          ni cedemos datos a terceros con fines comerciales.
        </Sub>
        <Sub t="2.4 Cuánto los conservamos">
          Mientras la postulación esté activa y por 24 meses adicionales, para retomarla en la siguiente convocatoria del mismo
          instrumento. Puedes pedir su eliminación en cualquier momento escribiendo a datos@copiloto.cl.
        </Sub>
        <Sub t="2.5 Tus derechos">
          Acceder, corregir, obtener copia legible o exigir eliminación, conforme a la Ley 19.628. Respondemos dentro de 10
          días hábiles.
        </Sub>
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 14, marginTop: 10 }}>
          <div className="mono" style={{ fontSize: 11, color: 'var(--slate)' }}>Texto exacto del consentimiento en pantalla</div>
          <p style={{ fontSize: 14, fontStyle: 'italic', margin: '6px 0' }}>
            «Autorizo el tratamiento de los datos de mi empresa y de mi proyecto para elaborar esta postulación. No se usan
            para entrenar modelos ni se comparten con terceros. Ver detalle.»
          </p>
          <p style={{ fontSize: 12, color: 'var(--slate)' }}>
            Criterio: la casilla no viene premarcada, no se puede avanzar sin marcarla, y se pide en el mismo momento en que se
            piden los datos.
          </p>
        </div>
      </Sec>

      <Sec title="3 · Instrumentación de métricas">
        <p style={{ fontSize: 13, color: 'var(--slate)' }}>
          Cinco métricas deciden si el producto funciona. Si el evento no está instrumentado, la métrica no existe.
        </p>
        <div className="table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560, fontSize: 12, marginTop: 8 }}>
            <thead>
              <tr className="mono" style={{ textAlign: 'left', color: 'var(--slate)' }}>
                <th style={{ padding: 6 }}>Métrica</th><th style={{ padding: 6 }}>Eventos</th><th style={{ padding: 6 }}>Umbral</th>
              </tr>
            </thead>
            <tbody>
              {METRICAS.map((m) => (
                <tr key={m.metrica} style={{ borderTop: '1px solid var(--rule)' }}>
                  <td style={{ padding: 6 }}>{m.metrica}</td>
                  <td style={{ padding: 6 }}><code>{m.eventos}</code></td>
                  <td style={{ padding: 6, color: 'var(--slate)' }}>{m.umbral}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ borderLeft: '3px solid var(--rose)', paddingLeft: 12, marginTop: 14 }}>
          <strong style={{ fontSize: 13 }}>Regla dura sobre la analítica</strong>
          <p style={{ fontSize: 13, color: 'var(--slate)' }}>
            Ningún evento lleva contenido del proyecto del postulante — ni el texto que escribió ni sus cifras. Se emiten
            identificadores, marcas de tiempo, longitudes y categorías.
          </p>
        </div>
      </Sec>
    </div>
  );
}

const METRICAS = [
  { metrica: 'Completitud del levantamiento', eventos: 'levantamiento_iniciado → expediente_enviado_revision', umbral: 'Bajo 40% el producto no existe.' },
  { metrica: 'Trabajo del formulador', eventos: 'expediente_abierto_formulador → expediente_aprobado; seccion_editada', umbral: 'Sobre 40% reescrito, el agente no aporta margen.' },
  { metrica: 'Retorno por enlace', eventos: 'enlace_abierto (sesión distinta); enlace_vencido', umbral: 'Valida no pedir cuenta.' },
  { metrica: 'Admisibilidad efectiva', eventos: 'resultado_admisibilidad (manual)', umbral: 'Inadmisibilidad por causal nuestra = incidente.' },
  { metrica: 'Precio de referencia', eventos: 'precio_declarado (conversación de cierre)', umbral: 'Define el precio de la fase 2.' },
];

function Sec({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card style={{ marginBottom: 18 }}>
      <h2 style={{ fontSize: 20, marginBottom: 8 }}>{title}</h2>
      {children}
    </Card>
  );
}

function Sub({ t, children }: { t: string; children: ReactNode }) {
  return (
    <div style={{ marginTop: 10 }}>
      <strong style={{ fontSize: 14 }}>{t}</strong>
      <p style={{ fontSize: 13, color: 'var(--slate)', margin: '4px 0 0' }}>{children}</p>
    </div>
  );
}
