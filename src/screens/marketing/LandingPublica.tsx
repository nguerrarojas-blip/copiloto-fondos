/**
 * Sitio público de marketing (Landing Publica.dc.html) — separado de la app.
 * Todos los CTA llevan a `/app`, donde vive el diagnóstico real del Matchmaker.
 * Los datos de fondos y corpus se leen de `data/`, nunca se duplican a mano,
 * para que esta página y la app no puedan desalinearse.
 */
import { useState } from 'react';
import { CATALOGO } from '../../data/catalogo';
import { FUNDS, type FondoId } from '../../data/funds';
import { CORPUS } from '../../data/corpus';
import { fmt } from '../../domain/format';
import { DIAG_PREVIEW, EQUIPO, FAQS, FOOTER_COLS, PASOS, PROBLEMAS, STATS } from './content';

const EMAIL_RE = /.+@.+\..+/;

function hasFullRules(id: string): id is FondoId {
  return id in FUNDS;
}

export function LandingPublica() {
  return (
    <div style={{ background: 'var(--paper)', color: 'var(--ink)', overflowX: 'hidden' }}>
      <Nav />
      <Hero />
      <StatsStrip />
      <Problema />
      <ComoFunciona />
      <Casos />
      <Fondos />
      <QuienesSomos />
      <Garantia />
      <Precio />
      <Preguntas />
      <CtaFinal />
      <Footer />
    </div>
  );
}

const SECTION = { maxWidth: 1200, margin: '0 auto', padding: '0 32px' } as const;
const EYEBROW = (color: string) => ({
  fontFamily: 'var(--font-mono)',
  fontSize: 11.5,
  color,
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  marginBottom: 14,
});
const H2 = { fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 'clamp(28px, 3.4vw, 40px)', lineHeight: 1.12, letterSpacing: '-0.5px', margin: 0 };

function Nav() {
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(250,247,241,0.93)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--rule)' }}>
      <div style={{ ...SECTION, padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 20, letterSpacing: '-0.2px' }}>Copiloto</span>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--slate)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>fondos públicos</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <a href="#como" style={{ fontSize: 13.5, color: 'var(--slate)' }}>Cómo funciona</a>
          <a href="#casos" style={{ fontSize: 13.5, color: 'var(--slate)' }}>Casos</a>
          <a href="#fondos" style={{ fontSize: 13.5, color: 'var(--slate)' }}>Fondos</a>
          <a href="#nosotros" style={{ fontSize: 13.5, color: 'var(--slate)' }}>Quiénes somos</a>
          <a href="#preguntas" style={{ fontSize: 13.5, color: 'var(--slate)' }}>Preguntas</a>
          <a href="/app" style={{ background: 'var(--teal)', color: '#fff', padding: '9px 16px', borderRadius: 8, fontSize: 13.5, fontWeight: 500, boxShadow: '0 4px 12px rgba(31,111,99,0.22)' }}>
            Diagnóstico gratis
          </a>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <div style={{ position: 'relative' }}>
      <div aria-hidden style={{ position: 'absolute', top: -260, right: -180, width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(31,111,99,0.10), transparent 68%)', pointerEvents: 'none' }} />
      <div aria-hidden style={{ position: 'absolute', top: 120, left: -220, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(184,134,59,0.09), transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ ...SECTION, padding: '76px 32px 60px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 52, alignItems: 'start', position: 'relative' }}>
        <div>
          <div style={EYEBROW('var(--teal)')}>CORFO · Sercotec · ANID</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 'clamp(38px, 5vw, 60px)', lineHeight: 1.03, letterSpacing: '-1px', margin: '0 0 22px' }}>
            La postulación que sí entra a evaluación.
          </h1>
          <p style={{ fontSize: 17.5, lineHeight: 1.62, color: 'var(--slate)', maxWidth: 520, margin: '0 0 26px' }}>
            Levantamos tu proyecto conversando, armamos el presupuesto con las reglas del fondo aplicadas en vivo, y un
            formulador con proyectos adjudicados lo revisa antes de entregártelo en PDF y Word.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
            <a href="/app" style={{ background: 'var(--teal)', color: '#fff', padding: '14px 24px', borderRadius: 9, fontSize: 15, fontWeight: 500, boxShadow: '0 8px 22px rgba(31,111,99,0.26)' }}>
              Empezar el diagnóstico gratis →
            </a>
            <a href="#como" style={{ padding: '14px 20px', border: '1px solid var(--rule)', background: '#fff', borderRadius: 9, fontSize: 14.5, color: 'var(--ink)' }}>
              Ver cómo funciona
            </a>
          </div>
          <div style={{ fontSize: 13, color: '#8b9099', lineHeight: 1.55, maxWidth: 460 }}>
            Sin registro para el diagnóstico. Garantizamos que tu postulación sea{' '}
            <strong style={{ color: 'var(--slate)', fontWeight: 500 }}>admisible</strong> — no que se adjudique: esa
            decisión es del evaluador.
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--rule)', borderTop: '4px solid var(--amber)', borderRadius: 16, padding: 28, boxShadow: '0 18px 44px rgba(27,42,65,0.10)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--amber)' }} />
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Diagnóstico · 60 segundos · gratis
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 600, lineHeight: 1.25, marginBottom: 10 }}>
            ¿A qué fondo te conviene postular?
          </div>
          <p style={{ fontSize: 14, color: 'var(--slate)', lineHeight: 1.6, margin: '0 0 18px' }}>
            Cuatro preguntas sobre tu etapa, tu sector y cómo postulas. Te decimos qué instrumento te calza, con qué tope y
            cuándo cierra — incluso si no somos nosotros los que deberían ayudarte.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
            {DIAG_PREVIEW.map((d) => (
              <div key={d.n} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px', background: 'var(--paper)', border: '1px solid #EBE5D8', borderRadius: 8 }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--amber)', flexShrink: 0 }}>{d.n}</span>
                <span style={{ fontSize: 13.5, color: '#3d4b5c' }}>{d.q}</span>
              </div>
            ))}
          </div>
          <a href="/app" style={{ display: 'block', textAlign: 'center', background: 'var(--ink)', color: '#fff', padding: 13, borderRadius: 9, fontSize: 14.5, fontWeight: 500 }}>
            Hacer mi diagnóstico
          </a>
        </div>
      </div>
    </div>
  );
}

function StatsStrip() {
  return (
    <div style={{ borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)', background: '#fff' }}>
      <div style={{ ...SECTION, padding: '26px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 28 }}>
        {STATS.map((s) => (
          <div key={s.label}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 600, lineHeight: 1, color: s.color, marginBottom: 5 }}>{s.value}</div>
            <div style={{ fontSize: 12.5, color: 'var(--slate)', lineHeight: 1.5 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Problema() {
  return (
    <div style={{ ...SECTION, padding: '72px 32px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'start' }}>
        <div>
          <div style={EYEBROW('var(--rose)')}>El problema real</div>
          <h2 style={{ ...H2, marginBottom: 18 }}>La mayoría de las postulaciones no se pierde por mala idea.</h2>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--slate)', margin: 0 }}>
            Se pierde por un RUT mal escrito, un cofinanciamiento bajo el mínimo, un gasto que el instrumento no financia, o
            un video que nadie grabó. Errores administrativos que sacan el proyecto de la evaluación antes de que un
            evaluador lea la primera línea.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {PROBLEMAS.map((p) => (
            <div key={p.titulo} style={{ borderLeft: '3px solid var(--rose)', padding: '2px 0 2px 16px' }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{p.titulo}</div>
              <div style={{ fontSize: 13.5, color: 'var(--slate)', lineHeight: 1.6 }}>{p.copy}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComoFunciona() {
  return (
    <div id="como" style={{ ...SECTION, padding: '76px 32px 0', scrollMarginTop: 80 }}>
      <div style={EYEBROW('var(--teal)')}>Cómo funciona</div>
      <h2 style={{ ...H2, marginBottom: 12, maxWidth: 680 }}>Cuatro agentes hacen el trabajo. Un humano pone el criterio.</h2>
      <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--slate)', maxWidth: 620, margin: '0 0 34px' }}>
        Nada sale con nuestro nombre sin que un formulador con proyectos adjudicados lo haya revisado. Es lo que hace que la
        garantía de admisibilidad sea una promesa cumplible.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(238px, 1fr))', gap: 18 }}>
        {PASOS.map((p) => (
          <div key={p.n} style={{ background: '#fff', border: '1px solid var(--rule)', borderTop: `4px solid ${p.color}`, borderRadius: 14, padding: 22, boxShadow: '0 4px 20px rgba(27,42,65,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span className="mono" style={{ fontSize: 10.5, color: p.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{p.agente}</span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 600, color: '#EBE5D8', lineHeight: 1 }}>{p.n}</span>
            </div>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8, lineHeight: 1.3 }}>{p.titulo}</div>
            <div style={{ fontSize: 13.5, color: 'var(--slate)', lineHeight: 1.62 }}>{p.copy}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18, border: '1px solid var(--rule)', background: '#fff', borderLeft: '4px solid var(--ink)', borderRadius: 14, padding: '22px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 22, alignItems: 'center' }}>
        <div>
          <div style={EYEBROW('var(--ink)')}>Y al final · revisión humana</div>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>Un formulador revisa, corrige y firma</div>
          <div style={{ fontSize: 13.5, color: 'var(--slate)', lineHeight: 1.62 }}>
            Verifica admisibilidad, que cada gasto esté justificado en el relato, y que ninguna cifra sea indefendible. Te
            deja un comentario explicando qué cambió y por qué.
          </div>
        </div>
        <div style={{ borderLeft: '1px solid var(--rule)', paddingLeft: 22 }}>
          <div style={{ fontSize: 13.5, color: '#3d4b5c', lineHeight: 1.85 }}>
            Expediente en PDF y Word
            <br />
            Guión del video de 40 segundos
            <br />
            Checklist de lo que debes adjuntar tú
          </div>
        </div>
      </div>
    </div>
  );
}

function Casos() {
  return (
    <div id="casos" style={{ ...SECTION, padding: '76px 32px 0', scrollMarginTop: 80 }}>
      <div style={EYEBROW('var(--amber)')}>Casos de éxito</div>
      <h2 style={{ ...H2, marginBottom: 12, maxWidth: 700 }}>Postulaciones adjudicadas que calibran la tuya.</h2>
      <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--slate)', maxWidth: 640, margin: '0 0 34px' }}>
        Nuestros agentes no opinan desde el aire: contrastan tu expediente contra postulaciones reales que ganaron el mismo
        instrumento. No copiamos su contenido — usamos sus rangos y su estructura para calibrar el tuyo. Los mantenemos
        anónimos porque su información es de sus dueños.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(258px, 1fr))', gap: 18, marginBottom: 16 }}>
        {CORPUS.map((c) => (
          <div key={c.nombre} style={{ background: '#fff', border: '1px solid var(--rule)', borderTop: '3px solid var(--amber)', borderRadius: 14, padding: 22, boxShadow: '0 4px 20px rgba(27,42,65,0.05)' }}>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              {c.fondo} · {c.anio}
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 19, fontWeight: 600, marginBottom: 3, lineHeight: 1.25 }}>{c.nombre}</div>
            <div className="mono" style={{ fontSize: 12.5, color: 'var(--ink)', marginBottom: 13 }}>{fmt(c.monto)} adjudicado · {c.cofi}% propio</div>
            <div style={{ fontSize: 13.5, color: 'var(--slate)', lineHeight: 1.62 }}>{c.leccion}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12.5, color: '#8b9099', lineHeight: 1.6, maxWidth: 640 }}>
        Cifras de expedientes adjudicados a los que tenemos acceso con autorización de sus titulares. Publicamos rubro,
        instrumento, año y montos; nunca el nombre del proyecto ni su contenido.
      </div>
    </div>
  );
}

function Fondos() {
  const hoy = new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long' });
  return (
    <div id="fondos" style={{ ...SECTION, padding: '76px 32px 0', scrollMarginTop: 80 }}>
      <div style={EYEBROW('var(--steel)')}>Fondos que cubrimos</div>
      <h2 style={{ ...H2, marginBottom: 12, maxWidth: 640 }}>Todo el catálogo, leído desde las bases oficiales.</h2>
      <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--slate)', maxWidth: 620, margin: '0 0 24px' }}>
        No mantenemos una lista a mano. Sincronizamos las convocatorias desde la fuente oficial de cada institución y
        extraemos de sus bases el tope, el cofinanciamiento mínimo, los límites por categoría y los requisitos de
        admisibilidad. Cuando la institución cambia las bases, cambian nuestras reglas.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--teal)' }} />
        <span className="mono" style={{ fontSize: 11.5, color: 'var(--slate)' }}>Catálogo revisado contra las bases oficiales · última actualización {hoy}</span>
      </div>

      <div style={{ border: '1px solid var(--rule)', borderRadius: 14, overflow: 'hidden', background: '#fff', boxShadow: '0 4px 20px rgba(27,42,65,0.05)' }}>
        <div className="table-scroll">
          {CATALOGO.map((f) => {
            const fund = hasFullRules(f.id) ? FUNDS[f.id] : null;
            const tope = fund ? `hasta ${fmt(fund.topeMujeres)}` : '—';
            const estado = f.abierto ? f.cierre : f.apertura;
            return (
              <div key={f.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(170px,1.4fr) minmax(90px,0.7fr) minmax(130px,1fr) minmax(160px,1fr)', gap: 16, padding: '15px 22px', borderBottom: '1px solid #EBE5D8', alignItems: 'center', minWidth: 640 }}>
                <div style={{ fontWeight: 600, fontSize: 14.5 }}>{f.nombre}</div>
                <div className="mono" style={{ fontSize: 12, color: 'var(--slate)' }}>{f.institucion}</div>
                <div className="mono" style={{ fontSize: 12.5, color: 'var(--ink)' }}>{tope}</div>
                <div>
                  <span
                    className="mono"
                    style={{
                      fontSize: 10.5,
                      padding: '4px 9px',
                      borderRadius: 6,
                      background: f.abierto ? 'var(--bg-success)' : 'var(--bg-secondary)',
                      color: f.abierto ? 'var(--teal)' : 'var(--slate)',
                      border: `1px solid ${f.abierto ? 'var(--teal)' : 'var(--rule)'}`,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {estado}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function QuienesSomos() {
  return (
    <div id="nosotros" style={{ ...SECTION, padding: '76px 32px 0', scrollMarginTop: 80 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 48, alignItems: 'start' }}>
        <div>
          <div style={EYEBROW('var(--teal)')}>Quiénes somos</div>
          <h2 style={{ ...H2, marginBottom: 18 }}>Formuladores que se cansaron de ver proyectos buenos caerse en admisibilidad.</h2>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--slate)', margin: '0 0 16px' }}>
            Somos un equipo pequeño de formuladores y gente de producto en Santiago. Llevamos años preparando postulaciones
            a fondos públicos chilenos y siempre vimos el mismo patrón: el trabajo que decide una adjudicación es criterio,
            y el que consume el tiempo es transcripción.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--slate)', margin: '0 0 20px' }}>
            El Copiloto automatiza lo segundo para que el formulador dedique su hora a lo primero. Por eso cobramos una
            fracción de lo que cobra una consultora, y por eso ningún expediente sale sin revisión humana.
          </p>
          <div style={{ borderLeft: '3px solid var(--teal)', padding: '4px 0 4px 16px' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontStyle: 'italic', lineHeight: 1.5, color: '#3d4b5c' }}>
              Si estamos reescribiendo más del 40% de un expediente, el problema es nuestro producto — no tu proyecto.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {EQUIPO.map((e) => (
            <div key={e.nombre} style={{ background: '#fff', border: '1px solid var(--rule)', borderRadius: 14, padding: 20, boxShadow: '0 4px 20px rgba(27,42,65,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 7 }}>
                <div style={{ fontWeight: 600, fontSize: 15.5 }}>{e.nombre}</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--teal)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{e.rol}</div>
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--slate)', lineHeight: 1.62 }}>{e.bio}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Garantia() {
  return (
    <div style={{ ...SECTION, padding: '76px 32px 0' }}>
      <div style={{ background: 'var(--ink)', borderRadius: 18, padding: 44, color: '#fff' }}>
        <div style={{ ...EYEBROW('#9DBDB6') }}>Nuestra garantía</div>
        <h2 style={{ ...H2, fontSize: 'clamp(26px, 3.2vw, 36px)', color: '#fff', marginBottom: 12, maxWidth: 720 }}>
          Garantizamos admisibilidad. No adjudicación.
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.65, color: '#B9C4D2', maxWidth: 660, margin: '0 0 30px' }}>
          Si tu postulación es declarada inadmisible por una causal que estaba en nuestras manos, te devolvemos lo pagado.
          Si no se adjudica, no: esa decisión es del evaluador y nadie honesto puede prometerla.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 26 }}>
          <div>
            <div className="mono" style={{ fontSize: 10.5, color: '#7FB3A6', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 11 }}>Respondemos por</div>
            <div style={{ fontSize: 14, lineHeight: 1.95, color: '#E4E9EF' }}>
              Datos administrativos y validación de RUT
              <br />
              Presupuesto dentro de las reglas del instrumento
              <br />
              Todas las secciones del formulario completas
              <br />
              Coherencia entre narrativa, números y equipo
            </div>
          </div>
          <div>
            <div className="mono" style={{ fontSize: 10.5, color: '#D9AE6E', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 11 }}>Depende de ti</div>
            <div style={{ fontSize: 14, lineHeight: 1.95, color: '#E4E9EF' }}>
              Grabar el video que exige la convocatoria
              <br />
              Adjuntar cédula, escritura y vigencia
              <br />
              Enviar en la plataforma antes del cierre
              <br />
              Que lo que nos declaraste sea verdad
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Precio() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const valid = EMAIL_RE.test(email);

  return (
    <div style={{ ...SECTION, padding: '76px 32px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 22, alignItems: 'stretch' }}>
        <div style={{ background: '#fff', border: '1px solid var(--rule)', borderTop: '5px solid var(--teal)', borderRadius: 16, padding: 30, boxShadow: '0 8px 28px rgba(27,42,65,0.07)' }}>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Piloto abierto · 20 cupos</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 44, fontWeight: 600, lineHeight: 1, marginBottom: 6 }}>Gratis</div>
          <div style={{ fontSize: 14, color: 'var(--slate)', lineHeight: 1.6, marginBottom: 20 }}>
            Expediente completo, revisión de formulador y entrega en PDF y Word, sin costo. A cambio te pedimos que nos
            cuentes qué falló.
          </div>
          <div style={{ fontSize: 13.5, color: '#3d4b5c', lineHeight: 1.95, marginBottom: 24 }}>
            ✓ Diagnóstico del fondo que te calza
            <br />
            ✓ Levantamiento guiado, 40–60 minutos
            <br />
            ✓ Presupuesto validado contra el instrumento
            <br />
            ✓ Revisión de un formulador con adjudicados
            <br />
            ✓ Expediente en PDF y Word + guión del video
          </div>
          <a href="/app" style={{ display: 'block', textAlign: 'center', background: 'var(--teal)', color: '#fff', padding: 14, borderRadius: 9, fontSize: 15, fontWeight: 500, boxShadow: '0 6px 18px rgba(31,111,99,0.24)' }}>
            Tomar un cupo del piloto
          </a>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--rule)', borderRadius: 16, padding: 30, display: 'flex', flexDirection: 'column' }}>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Después del piloto</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 500, lineHeight: 1.25, marginBottom: 12 }}>El precio lo fijamos con lo que aprendamos del piloto.</div>
          <p style={{ fontSize: 14.5, color: 'var(--slate)', lineHeight: 1.65, margin: '0 0 18px' }}>
            Preferimos no inventar una cifra antes de saber cuánto trabajo humano requiere de verdad cada expediente. Lo
            que sí sabemos: será una fracción de lo que cobra una consultora, y el diagnóstico seguirá siendo gratis.
          </p>
          <div style={{ marginTop: 'auto', borderTop: '1px solid var(--rule)', paddingTop: 18 }}>
            <div style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 10 }}>Déjanos tu correo y te avisamos cuando abramos cupos o publiquemos precio.</div>
            {!subscribed ? (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  style={{ flex: 1, minWidth: 170, padding: '11px 13px', border: '1px solid var(--rule)', borderRadius: 8, fontSize: 14, background: '#fff' }}
                />
                <button
                  onClick={() => valid && setSubscribed(true)}
                  disabled={!valid}
                  style={{ padding: '11px 18px', background: 'var(--ink)', color: '#fff', borderRadius: 8, fontSize: 14, opacity: valid ? 1 : 0.5 }}
                >
                  Avísame
                </button>
              </div>
            ) : (
              <div style={{ fontSize: 13.5, color: 'var(--teal)', background: 'var(--bg-success)', border: '1px solid var(--teal)', borderRadius: 8, padding: '11px 13px' }}>
                ✓ Listo. Te escribimos a {email}.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Preguntas() {
  const [open, setOpen] = useState(0);
  return (
    <div id="preguntas" style={{ maxWidth: 860, margin: '0 auto', padding: '76px 32px 0', scrollMarginTop: 80 }}>
      <div style={EYEBROW('var(--slate)')}>Preguntas frecuentes</div>
      <h2 style={{ ...H2, marginBottom: 30 }}>Lo que nos preguntan antes de partir.</h2>
      <div style={{ borderTop: '1px solid var(--rule)' }}>
        {FAQS.map((f, i) => (
          <div key={f.q} style={{ borderBottom: '1px solid var(--rule)' }}>
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              aria-expanded={open === i}
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, textAlign: 'left', padding: '18px 2px', background: 'none' }}
            >
              <span style={{ fontSize: 15.5, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.4 }}>{f.q}</span>
              <span className="mono" style={{ fontSize: 17, color: 'var(--teal)', flexShrink: 0, lineHeight: 1 }}>{open === i ? '−' : '+'}</span>
            </button>
            {open === i && <div style={{ padding: '0 40px 20px 2px', fontSize: 14.5, color: 'var(--slate)', lineHeight: 1.68 }}>{f.a}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function CtaFinal() {
  return (
    <div style={{ ...SECTION, padding: '76px 32px 0' }}>
      <div style={{ border: '1px solid var(--rule)', background: '#fff', borderRadius: 18, padding: '48px 40px', textAlign: 'center', boxShadow: '0 8px 28px rgba(27,42,65,0.06)' }}>
        <h2 style={{ ...H2, fontSize: 'clamp(28px, 3.6vw, 42px)', margin: '0 auto 16px', maxWidth: 640 }}>Empieza por saber si te conviene postular.</h2>
        <p style={{ fontSize: 16, color: 'var(--slate)', lineHeight: 1.6, maxWidth: 520, margin: '0 auto 26px' }}>
          El diagnóstico es gratis, toma un minuto y no pide registro. Si no te calza ningún fondo que cubramos, te lo
          decimos ahí mismo.
        </p>
        <a href="/app" style={{ display: 'inline-block', background: 'var(--teal)', color: '#fff', padding: '15px 30px', borderRadius: 9, fontSize: 15.5, fontWeight: 500, boxShadow: '0 8px 22px rgba(31,111,99,0.26)' }}>
          Hacer el diagnóstico gratis →
        </a>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div style={{ marginTop: 76, borderTop: '1px solid var(--rule)', background: '#fff' }}>
      <div style={{ ...SECTION, padding: '44px 32px 30px', display: 'grid', gridTemplateColumns: 'minmax(240px,1.5fr) repeat(auto-fit, minmax(150px,1fr))', gap: 36 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 19 }}>Copiloto</span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>fondos públicos</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.65, maxWidth: 320 }}>
            Elaboramos postulaciones admisibles a fondos públicos chilenos, con agentes que hacen el trabajo y formuladores
            que ponen el criterio.
          </div>
        </div>
        {FOOTER_COLS.map((c) => (
          <div key={c.titulo}>
            <div className="mono" style={{ fontSize: 10.5, color: '#8b9099', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>{c.titulo}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {c.links.map((l) => (
                <a key={l.label} href={l.href} style={{ fontSize: 13.5, color: 'var(--slate)' }}>{l.label}</a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid #EBE5D8' }}>
        <div style={{ ...SECTION, padding: '18px 32px', display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#8b9099' }}>
          <span>© {new Date().getFullYear()} Copiloto de Postulación · Santiago, Chile</span>
          <span>Servicio privado, sin relación con CORFO, Sercotec ni ANID</span>
        </div>
      </div>
    </div>
  );
}
