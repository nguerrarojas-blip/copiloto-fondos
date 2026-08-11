/** Landing + diagnóstico del Matchmaker (README §Pantallas del postulante → Landing). */
import { useApp } from '../../state/AppContext';
import { FUNDS } from '../../data/funds';
import { CATALOGO } from '../../data/catalogo';
import { CORPUS, AVG_MONTO, AVG_COFI } from '../../data/corpus';
import { findFondo } from '../../domain/matchmaker';
import { fmt } from '../../domain/format';
import { Card, Button, Pill } from '../../ui/primitives';
import { FundsCatalog } from './FundsCatalog';

const EMAIL_RE = /.+@.+\..+/;
const CORPUS_RESUMEN = `Tenemos ${CORPUS.length} postulaciones adjudicadas de referencia. Monto promedio ${fmt(AVG_MONTO)}, con ${AVG_COFI}% de cofinanciamiento propio.`;

export function Landing() {
  const { state, dispatch } = useApp();
  const fund = FUNDS[state.fondoId];

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -160,
          right: -120,
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(31,111,99,0.09), transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 260,
          left: -160,
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(184,134,59,0.07), transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', maxWidth: 1180, margin: '0 auto', padding: '40px 20px 72px' }}>
        <section style={{ display: 'grid', gap: 32, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', alignItems: 'start' }}>
          <div>
            <Pill color="var(--amber)" bg="var(--bg-warning)">Fondos públicos chilenos · CORFO · Sercotec</Pill>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 'clamp(30px, 4.2vw, 46px)', lineHeight: 1.08, letterSpacing: '-0.01em', margin: '18px 0 16px' }}>
              Tu postulación completa, calibrada contra proyectos que sí se adjudicaron.
            </h1>
            <p style={{ color: 'var(--slate)', fontSize: 17, lineHeight: 1.55, maxWidth: 480 }}>
              Levantamos tu proyecto conversando, armamos el presupuesto con las reglas del instrumento aplicadas en vivo,
              contrastamos tus cifras contra postulaciones ya adjudicadas, y un formulador revisa antes de entregarte el
              expediente en PDF y Word.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '18px 0 4px' }}>
              <span style={{ fontSize: 13, background: '#fff', border: '1px solid var(--rule)', borderRadius: 999, padding: '6px 12px' }}>
                Piloto gratuito · 20 cupos
              </span>
              <span style={{ fontSize: 13, background: '#fff', border: '1px solid var(--rule)', borderRadius: 999, padding: '6px 12px' }}>
                Semilla Inicia, Fondo Crece y Capital Abeja
              </span>
            </div>
            <div style={{ marginTop: 20 }}>
              <Button variant="ink" onClick={() => dispatch({ type: 'LOAD_DEMO' })}>▶ Recorrer con el caso de ejemplo</Button>
              <p style={{ fontSize: 12, color: '#8b9099', marginTop: 8 }}>
                Precarga un proyecto completo y consistente para ver el expediente final sin llenar nada. Reversible desde
                «Reiniciar».
              </p>
            </div>
          </div>

          <Card accent="var(--amber)" style={{ position: 'relative', zIndex: 1 }}>
            <Pill color="var(--amber)" bg="var(--bg-warning)">Agente Matchmaker · gratis</Pill>
            <Diagnostico />
          </Card>
        </section>

        <FundsCatalog />

        <section style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: 22, margin: '0 0 4px' }}>Proyectos adjudicados de referencia</h2>
          <p style={{ color: 'var(--slate)', fontSize: 14, marginBottom: 16 }}>{CORPUS_RESUMEN} Siempre anónimas.</p>
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {CORPUS.map((c) => (
              <Card key={c.nombre}>
                <div className="mono" style={{ fontSize: 11, color: 'var(--slate)' }}>
                  {c.fondo} · {c.anio}
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, margin: '4px 0' }}>{c.nombre}</div>
                <div className="mono" style={{ fontSize: 12, color: 'var(--ink)' }}>
                  {fmt(c.monto)} · cofi {c.cofi}% · penetración {c.penetracion}%
                </div>
                <p style={{ fontSize: 13, color: 'var(--slate)', marginTop: 8 }}>{c.leccion}</p>
              </Card>
            ))}
          </div>
        </section>

        {state.diagStep === 'result' && (
          <div style={{ position: 'sticky', bottom: 16, marginTop: 24 }}>
            <Card accent="var(--teal)" style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <strong>Tu fondo: {fund.nombre} ({fund.institucion})</strong>
                <p style={{ fontSize: 13, color: 'var(--slate)', margin: '4px 0 0' }}>{fund.motivo}</p>
              </div>
              <Button variant="teal" onClick={() => dispatch({ type: 'GO_PILOTO' })}>Entrar al piloto →</Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function Opt({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ display: 'block', width: '100%', textAlign: 'left', border: '1px solid var(--rule)', background: '#fff', borderRadius: 10, padding: '11px 13px', marginTop: 8, fontSize: 14 }}
    >
      {label}
    </button>
  );
}

function Diagnostico() {
  const { state, dispatch } = useApp();
  const s = state;

  const back = (
    <button onClick={() => dispatch({ type: 'DIAG_BACK' })} style={{ background: 'none', border: 'none', color: 'var(--slate)', fontSize: 12, marginTop: 10 }}>
      ← atrás
    </button>
  );

  if (s.diagStep === 'ask')
    return (
      <div style={{ marginTop: 10 }}>
        <h3 style={{ fontSize: 18 }}>¿Ya sabes a qué fondo quieres postular?</h3>
        <Opt label="Sí, ya sé" onClick={() => dispatch({ type: 'DIAG_YES' })} />
        <Opt label="No, ayúdenme a elegir" onClick={() => dispatch({ type: 'DIAG_NO' })} />
      </div>
    );

  if (s.diagStep === 'manual')
    return (
      <div style={{ marginTop: 10 }}>
        <h3 style={{ fontSize: 18 }}>¿A cuál?</h3>
        <input
          value={s.diagFondoManual}
          onChange={(e) => dispatch({ type: 'DIAG_SET_MANUAL', value: e.target.value })}
          placeholder="ej. semilla inicia"
          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--rule)', marginTop: 8 }}
        />
        <Button variant="teal" disabled={!s.diagFondoManual.trim()} onClick={() => dispatch({ type: 'DIAG_BUSCAR' })} style={{ marginTop: 10 }}>
          Buscar en el catálogo
        </Button>
        {back}
      </div>
    );

  if (s.diagStep === 'manualConfirm') {
    const m = findFondo(s.diagFondoManual);
    return (
      <div style={{ marginTop: 10 }}>
        {m ? (
          <>
            <h3 style={{ fontSize: 18 }}>¿Te refieres a {m.nombre}?</h3>
            <p style={{ fontSize: 13, color: 'var(--slate)' }}>{m.institucion}</p>
            <Button variant="teal" onClick={() => dispatch({ type: 'DIAG_CONFIRMAR' })} style={{ marginTop: 8 }}>Sí, ese es</Button>{' '}
            <Button onClick={() => dispatch({ type: 'DIAG_CORREGIR' })}>No, corregir</Button>
          </>
        ) : (
          <>
            <p style={{ fontSize: 16, lineHeight: 1.55 }}>
              No encontramos "{s.diagFondoManual}" en nuestro catálogo. Puede ser que se llame distinto o que no lo cubramos
              todavía.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Opt label="Corregir el nombre" onClick={() => dispatch({ type: 'DIAG_CORREGIR' })} />
              <Opt label="Mejor ayúdenme a encontrarlo" onClick={() => dispatch({ type: 'DIAG_NO' })} />
            </div>
          </>
        )}
      </div>
    );
  }

  if (s.diagStep === 'tipo')
    return (
      <div style={{ marginTop: 10 }}>
        <h3 style={{ fontSize: 18 }}>¿Cómo postulas?</h3>
        <Opt label="Persona natural" onClick={() => dispatch({ type: 'DIAG_PICK_TIPO', value: 'natural' })} />
        <Opt label="Empresa (persona jurídica)" onClick={() => dispatch({ type: 'DIAG_PICK_TIPO', value: 'juridica' })} />
        {back}
      </div>
    );

  if (s.diagStep === 'etapa')
    return (
      <div style={{ marginTop: 10 }}>
        <h3 style={{ fontSize: 18 }}>¿En qué etapa está tu proyecto?</h3>
        <Opt label="Idea o prototipo, sin ventas todavía" onClick={() => dispatch({ type: 'DIAG_PICK_ETAPA', value: 'idea' })} />
        <Opt label="Ventas iniciales, buscando crecer" onClick={() => dispatch({ type: 'DIAG_PICK_ETAPA', value: 'ventas' })} />
        <Opt label="Empresa con facturación consolidada" onClick={() => dispatch({ type: 'DIAG_PICK_ETAPA', value: 'consolidada' })} />
        {back}
      </div>
    );

  if (s.diagStep === 'sector')
    return (
      <div style={{ marginTop: 10 }}>
        <h3 style={{ fontSize: 18 }}>¿Cuál describe mejor tu sector?</h3>
        <Opt label="Base científico-tecnológica" onClick={() => dispatch({ type: 'DIAG_PICK_SECTOR', value: 'cientifica' })} />
        <Opt label="Tecnología o software" onClick={() => dispatch({ type: 'DIAG_PICK_SECTOR', value: 'tech' })} />
        <Opt label="Comercio, servicios, manufactura u otro" onClick={() => dispatch({ type: 'DIAG_PICK_SECTOR', value: 'otro' })} />
        {back}
      </div>
    );

  if (s.diagStep === 'mujeres')
    return (
      <div style={{ marginTop: 10 }}>
        <h3 style={{ fontSize: 18 }}>¿Es un emprendimiento liderado por mujeres?</h3>
        <p style={{ fontSize: 12, color: 'var(--slate)' }}>En Semilla Inicia sube el tope de $15M a $17M.</p>
        <Opt label="Sí" onClick={() => dispatch({ type: 'DIAG_PICK_MUJERES', value: true })} />
        <Opt label="No" onClick={() => dispatch({ type: 'DIAG_PICK_MUJERES', value: false })} />
        {back}
      </div>
    );

  if (s.diagStep === 'result') {
    const fund = FUNDS[s.fondoId];
    return (
      <div style={{ marginTop: 10 }}>
        <Pill color="var(--teal)" bg="var(--bg-success)">Tenemos un match</Pill>
        <h3 style={{ fontSize: 18, marginTop: 8 }}>{fund.nombre}</h3>
        <p style={{ fontSize: 13, color: 'var(--slate)' }}>{fund.motivo}</p>
        <p className="mono" style={{ fontSize: 12, marginTop: 6, marginBottom: 16 }}>
          Tope {fmt(s.mujeres ? fund.topeMujeres : fund.tope)} · cierra en {fund.dias} días
        </p>
        <div style={{ borderLeft: '3px solid var(--amber)', padding: '8px 0 8px 12px' }}>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--amber)', textTransform: 'uppercase', marginBottom: 4 }}>
            Agente Benchmark
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--slate)', lineHeight: 1.55 }}>{CORPUS_RESUMEN}</div>
        </div>
      </div>
    );
  }

  if (s.diagStep === 'cerrado') return <Cerrado />;

  return null;
}

/** Convocatoria cerrada: el fondo que le calza al usuario no está abierto hoy.
 * Se le nombra el fondo, cuándo se espera que abra, qué está abierto por si le
 * sirve, y se captura el correo — nunca se lo empuja a un fondo equivocado. */
function Cerrado() {
  const { state, dispatch } = useApp();
  const f = CATALOGO.find((c) => c.id === state.diagManualMatchId);
  const nombre = f ? `${f.nombre} (${f.institucion})` : 'ese fondo';
  const apertura = f?.apertura || 'la próxima convocatoria aún no tiene fecha publicada';
  const abiertos = CATALOGO.filter((c) => c.abierto).map((c) => c.nombre);
  const alternativaAbierta = abiertos.length
    ? `Hoy están abiertas ${abiertos.slice(0, -1).join(', ')} y ${abiertos[abiertos.length - 1]}, pero por tu perfil no son las que te convienen.`
    : '';

  return (
    <div style={{ marginTop: 10 }}>
      <Pill color="var(--amber)" bg="var(--bg-warning)">Convocatoria cerrada</Pill>
      <p style={{ fontSize: 16, lineHeight: 1.55, margin: '8px 0 12px' }}>
        Por tu perfil te calza <strong>{nombre}</strong>, pero {apertura}.
      </p>
      <p style={{ fontSize: 13.5, color: 'var(--slate)', lineHeight: 1.6, marginBottom: 14 }}>
        {alternativaAbierta} Guardamos tu diagnóstico y te escribimos el día que abra, para que solo continúes desde donde
        quedaste.
      </p>
      <EmailCapture
        done={state.diagEmailSent}
        value={state.diagEmail}
        onChange={(v) => dispatch({ type: 'DIAG_SET_EMAIL', value: v })}
        onSubmit={() => dispatch({ type: 'DIAG_SUBMIT_EMAIL' })}
      />
      <button onClick={() => dispatch({ type: 'DIAG_BACK' })} style={{ background: 'none', border: 'none', color: 'var(--slate)', fontSize: 12, marginTop: 10 }}>
        ← atrás
      </button>
    </div>
  );
}

function EmailCapture({ done, value, onChange, onSubmit }: { done: boolean; value: string; onChange: (v: string) => void; onSubmit: () => void }) {
  if (done)
    return <p style={{ fontSize: 13, color: 'var(--teal)', marginTop: 10 }}>Listo, te escribimos a {value}. Gracias.</p>;
  return (
    <div style={{ marginTop: 10 }}>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="tu@correo.cl" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--rule)' }} />
      <Button variant="teal" disabled={!EMAIL_RE.test(value)} onClick={onSubmit} style={{ marginTop: 8 }}>Avísenme</Button>
    </div>
  );
}
