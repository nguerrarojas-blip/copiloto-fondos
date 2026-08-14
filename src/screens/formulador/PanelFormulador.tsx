/** Panel interno del formulador. Con backend conectado (VITE_API_URL), todo sale
 * de la base real: bandeja, expediente, hallazgos de los agentes y comentarios.
 * Sin backend, se muestra el wireframe de demo con datos ficticios (portado de
 * `Panel Formulador.dc.html`) para que la demo autónoma siga abriendo sin servidor. */
import { useEffect, useState } from 'react';
import { INBOX, SECTIONS, PANEL_BUDGET, FINDINGS, CHECKLIST } from '../../data/formulador';
import { Card, Button, Pill, AgentFinding, Field } from '../../ui/primitives';
import { FUNDS } from '../../data/funds';
import type { Block } from '../../state/types';
import {
  apiEnabled,
  formuladorApi,
  getFormuladorEmail,
  setFormuladorEmail,
  clearFormuladorEmail,
  ApiError,
  type BandejaRow,
  type ExpedienteFormulador,
  type FormuladorKpis,
} from '../../api/client';

type View = 'bandeja' | 'expediente' | 'aprobar';
type Tab = 'pendientes' | 'mios' | 'entregados';

export function PanelFormulador() {
  return apiEnabled() ? <PanelFormuladorReal /> : <PanelFormuladorDemo />;
}

function fondoNombre(fondoId: string): string {
  return (FUNDS as Record<string, { nombre: string }>)[fondoId]?.nombre ?? fondoId;
}

function blockForKind(kind: string): Block {
  switch (kind) {
    case 'identidad':
      return 'identidad';
    case 'narrativa':
      return 'narrativa';
    case 'narrativa+presupuesto':
      return 'presupuesto';
    case 'admisibilidad':
      return 'verificacion';
    default:
      return 'datos'; // equipo, datos
  }
}

function CenteredNote({ text }: { text: string }) {
  return <div style={{ maxWidth: 720, margin: '80px auto', padding: '0 20px', textAlign: 'center', color: 'var(--slate)' }}>{text}</div>;
}

function EmptyState({ tab, onGoPendientes }: { tab: Tab; onGoPendientes: () => void }) {
  const content =
    tab === 'entregados'
      ? { titulo: 'Todavía no has entregado ningún expediente', copy: 'Acá quedan los expedientes aprobados, con su fecha de entrega y el resultado de admisibilidad cuando la institución lo publique. Es tu historial verificable.', cta: '' }
      : tab === 'mios'
        ? { titulo: 'No tienes expedientes tomados', copy: 'Cuando tomes uno de la bandeja de pendientes aparece acá, con el plazo del fondo a la vista. Nadie te asigna trabajo: tú tomas lo que puedes atender.', cta: 'Ir a pendientes' }
        : { titulo: 'Bandeja al día', copy: 'No hay expedientes esperando revisión. Cuando un postulante termine su levantamiento y los agentes lo verifiquen, aparece acá ordenado por el fondo que cierra antes.', cta: '' };
  return (
    <Card style={{ textAlign: 'center', padding: 32 }}>
      <h3 style={{ fontSize: 18 }}>{content.titulo}</h3>
      <p style={{ color: 'var(--slate)', fontSize: 14, maxWidth: 460, margin: '8px auto 0' }}>{content.copy}</p>
      {content.cta && <Button onClick={onGoPendientes} style={{ marginTop: 12 }}>{content.cta}</Button>}
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Panel real: todo sale de la API.
// ─────────────────────────────────────────────────────────────────────────────

function IdentifyFormulador({ onReady }: { onReady: (nombre: string) => void }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function entrar() {
    setError('');
    setLoading(true);
    setFormuladorEmail(email.trim());
    try {
      const k = await formuladorApi.kpis();
      onReady(k.nombre);
    } catch (e) {
      clearFormuladorEmail();
      setError(e instanceof ApiError && e.status === 403 ? 'Ese correo no está autorizado como formulador.' : 'No se pudo verificar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '80px auto', padding: '0 20px' }}>
      <Card>
        <h1 style={{ fontSize: 20 }}>Panel del formulador</h1>
        <p style={{ fontSize: 13, color: 'var(--slate)' }}>Identifícate con el correo con el que te registraron como formulador.</p>
        <div style={{ marginTop: 12 }}>
          <Field
            label="Correo"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            placeholder="nombre@copiloto.cl"
          />
        </div>
        <Button variant="teal" disabled={!email.includes('@') || loading} onClick={entrar} style={{ marginTop: 12 }}>
          {loading ? 'Verificando…' : 'Entrar'}
        </Button>
      </Card>
    </div>
  );
}

function PanelFormuladorReal() {
  const [status, setStatus] = useState<'checking' | 'identify' | 'ready'>('checking');
  const [nombre, setNombre] = useState('');
  const [kpis, setKpis] = useState<FormuladorKpis | null>(null);
  const [view, setView] = useState<View>('bandeja');
  const [tab, setTab] = useState<Tab>('pendientes');
  const [rows, setRows] = useState<BandejaRow[]>([]);
  const [loadingBandeja, setLoadingBandeja] = useState(false);
  const [actionError, setActionError] = useState('');
  const [exp, setExp] = useState<ExpedienteFormulador | null>(null);
  const [section, setSection] = useState(0);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerText, setComposerText] = useState('');
  const [checked, setChecked] = useState([false, false, false, false]);
  const [aprobado, setAprobado] = useState(false);

  useEffect(() => {
    if (!getFormuladorEmail()) {
      setStatus('identify');
      return;
    }
    formuladorApi
      .kpis()
      .then((k) => {
        setNombre(k.nombre);
        setKpis(k);
        setStatus('ready');
      })
      .catch(() => {
        clearFormuladorEmail();
        setStatus('identify');
      });
  }, []);

  useEffect(() => {
    if (status !== 'ready' || view !== 'bandeja') return;
    setLoadingBandeja(true);
    formuladorApi
      .bandeja(tab)
      .then((r) => setRows(r.expedientes))
      .finally(() => setLoadingBandeja(false));
  }, [status, view, tab]);

  async function refreshKpis() {
    try {
      setKpis(await formuladorApi.kpis());
    } catch {
      /* no crítico para la vista actual */
    }
  }

  async function abrir(id: string) {
    setActionError('');
    const e = await formuladorApi.expediente(id);
    setExp(e);
    setSection(0);
    setChecked([false, false, false, false]);
    setAprobado(false);
    setView('expediente');
  }

  async function tomarYAbrir(id: string) {
    setActionError('');
    try {
      await formuladorApi.tomar(id);
      await abrir(id);
      await refreshKpis();
    } catch {
      setActionError('Alguien más ya tomó ese expediente.');
      formuladorApi.bandeja(tab).then((r) => setRows(r.expedientes));
    }
  }

  async function enviarComentario() {
    if (!exp) return;
    const sec = exp.sections[section];
    await formuladorApi.comentar({
      postulacionId: exp.id,
      seccion: `${sec.num} · ${sec.title}`,
      block: blockForKind(sec.kind),
      texto: composerText,
    });
    setComposerOpen(false);
    setComposerText('');
    setExp(await formuladorApi.expediente(exp.id));
  }

  async function aprobarYEntregar() {
    if (!exp) return;
    await formuladorApi.aprobar(exp.id);
    setAprobado(true);
    refreshKpis();
  }

  if (status === 'checking') return <CenteredNote text="Verificando…" />;
  if (status === 'identify') return <IdentifyFormulador onReady={(n) => { setNombre(n); setStatus('ready'); formuladorApi.kpis().then(setKpis); }} />;

  if (view === 'bandeja') {
    return (
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 20px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h1 style={{ fontSize: 26 }}>Bandeja del formulador</h1>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--slate)' }}>{nombre}</span>
          <button
            onClick={() => { clearFormuladorEmail(); setStatus('identify'); }}
            style={{ border: 'none', background: 'none', color: 'var(--slate)', fontSize: 12, textDecoration: 'underline', cursor: 'pointer' }}
          >
            cambiar
          </button>
        </div>
        <p style={{ color: 'var(--slate)', fontSize: 14 }}>Sin asignación automática: tomas el expediente que puedes atender y queda registrado.</p>

        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', margin: '16px 0' }}>
          <Card accent="#B8863B" style={{ padding: 14 }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--slate)' }}>Pendientes</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 30 }}>{kpis?.pendientes ?? '—'}</div>
          </Card>
          <Card accent="#1F6F63" style={{ padding: 14 }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--slate)' }}>Míos en revisión</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 30 }}>{kpis?.mios ?? '—'}</div>
          </Card>
          <Card accent="#45566B" style={{ padding: 14 }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--slate)' }}>Entregados</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 30 }}>{kpis?.entregados ?? '—'}</div>
          </Card>
        </div>

        <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid var(--rule)', marginBottom: 8, flexWrap: 'wrap' }}>
          {([['pendientes', 'Pendientes'], ['mios', 'En revisión mía'], ['entregados', 'Entregados']] as const).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              style={{ border: 'none', background: 'none', padding: '8px 12px', fontSize: 13, fontWeight: tab === k ? 600 : 400, color: tab === k ? 'var(--ink)' : 'var(--slate)', borderBottom: `2px solid ${tab === k ? 'var(--ink)' : 'transparent'}` }}
            >
              {l}
            </button>
          ))}
        </div>

        {actionError && <p style={{ color: 'var(--rose)', fontSize: 13 }}>{actionError}</p>}

        {loadingBandeja ? (
          <p style={{ fontSize: 13, color: 'var(--slate)' }}>Cargando…</p>
        ) : rows.length ? (
          <div className="table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead>
                <tr className="mono" style={{ fontSize: 11, textAlign: 'left', color: 'var(--slate)' }}>
                  <th style={{ padding: 8 }}>Correo</th><th style={{ padding: 8 }}>Fondo</th><th style={{ padding: 8 }}>Estado de agentes</th><th style={{ padding: 8 }} />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} style={{ borderTop: '1px solid var(--rule)' }}>
                    <td style={{ padding: 8, fontSize: 13 }}>{r.piloto_email}</td>
                    <td style={{ padding: 8, fontSize: 13 }}>{fondoNombre(r.fondo_id)}</td>
                    <td style={{ padding: 8, fontSize: 12, color: r.hard_issues > 0 ? 'var(--amber)' : 'var(--teal)' }}>
                      {r.estado_label}{r.hard_issues > 0 ? ` · ${r.hard_issues} hallazgo(s)` : ''}
                    </td>
                    <td style={{ padding: 8 }}>
                      <Button variant={tab === 'mios' ? 'ink' : 'ghost'} onClick={() => (tab === 'pendientes' ? tomarYAbrir(r.id) : abrir(r.id))}>
                        {tab === 'pendientes' ? 'Tomar' : tab === 'mios' ? 'Continuar' : 'Ver'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState tab={tab} onGoPendientes={() => setTab('pendientes')} />
        )}
      </div>
    );
  }

  if (view === 'aprobar' && exp) {
    const checklistOk = checked.every(Boolean);
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px 60px' }}>
        <button onClick={() => setView('expediente')} style={{ background: 'none', border: 'none', color: 'var(--slate)', fontSize: 13 }}>← volver al expediente</button>
        <h1 style={{ fontSize: 24, marginTop: 8 }}>Aprobar y entregar</h1>
        <p style={{ color: 'var(--slate)', fontSize: 14 }}>El checklist obligatorio es lo que sostiene la promesa de admisibilidad.</p>
        <Card style={{ marginTop: 12 }}>
          {CHECKLIST.map((label, i) => (
            <button key={i} onClick={() => setChecked((c) => c.map((v, j) => (j === i ? !v : v)))} role="checkbox" aria-checked={checked[i]} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', textAlign: 'left', background: 'none', border: 'none', padding: '9px 0', width: '100%', borderBottom: '1px solid var(--rule)' }}>
              <span aria-hidden style={{ flexShrink: 0, width: 20, height: 20, borderRadius: 5, background: checked[i] ? 'var(--teal)' : '#fff', border: `1px solid ${checked[i] ? 'var(--teal)' : 'var(--rule)'}`, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>{checked[i] ? '✓' : ''}</span>
              <span style={{ fontSize: 14 }}>{label}</span>
            </button>
          ))}
          {aprobado ? (
            <p style={{ color: 'var(--teal)', marginTop: 12 }}>Expediente aprobado y entregado. Se envió el correo «Expediente listo» al postulante.</p>
          ) : (
            <Button variant="teal" disabled={!checklistOk} onClick={aprobarYEntregar} style={{ marginTop: 12 }}>Aprobar y entregar</Button>
          )}
        </Card>
      </div>
    );
  }

  if (!exp) return <CenteredNote text="Cargando expediente…" />;

  const sec = exp.sections[section];
  const puedeActuar = exp.mine && exp.levStage !== 'done';
  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '20px 20px 60px' }}>
      <button onClick={() => { setExp(null); setView('bandeja'); }} style={{ background: 'none', border: 'none', color: 'var(--slate)', fontSize: 13 }}>← bandeja</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 22 }}>{exp.identidad.razonSocial || exp.pilotoEmail}</h1>
        <Pill color="#fff" bg="var(--amber)">{fondoNombre(exp.fondoId)}</Pill>
        <span className="mono" style={{ fontSize: 11, color: 'var(--slate)' }}>{exp.estadoLabel}</span>
        {puedeActuar && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <Button variant="teal" onClick={() => setView('aprobar')}>Aprobar y entregar</Button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'minmax(180px, 220px) 1fr minmax(220px, 280px)', alignItems: 'start', marginTop: 14 }}>
        <nav>
          {exp.sections.map((s, i) => (
            <button key={s.num} onClick={() => setSection(i)} style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%', textAlign: 'left', border: 'none', background: section === i ? '#fff' : 'transparent', borderLeft: `3px solid ${section === i ? 'var(--ink)' : 'transparent'}`, padding: '8px 10px', fontSize: 13, color: section === i ? 'var(--ink)' : 'var(--slate)' }}>
              <span className="mono" style={{ fontSize: 11 }}>{s.num}</span>
              {s.title}
              <span style={{ marginLeft: 'auto', color: s.docState === 'completa' ? 'var(--teal)' : 'var(--amber)' }}>{s.docState === 'completa' ? '✓' : '⚠'}</span>
            </button>
          ))}
        </nav>

        <div>
          <h2 style={{ fontSize: 18 }}>{sec.num} · {sec.title}</h2>

          {sec.kind === 'identidad' && (
            <div style={{ border: '1px solid var(--rule)', borderRadius: 10, padding: 12, marginTop: 10 }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--slate)' }}>Identificación del postulante</div>
              <div style={{ fontSize: 14, marginTop: 6 }}>
                {exp.identidad.razonSocial} · RUT {exp.identidad.rut} · {exp.identidad.repLegal}, representante legal · {exp.identidad.direccion}, {exp.identidad.comuna}.
              </div>
            </div>
          )}

          {sec.paragraphs.length === 0 && sec.kind !== 'identidad' && sec.kind !== 'equipo' && (
            <p style={{ fontSize: 13, color: 'var(--slate)', marginTop: 10 }}>{sec.emptyNote || 'Sin contenido en esta sección.'}</p>
          )}
          {sec.paragraphs.map((p, i) => (
            <div key={i} style={{ border: `1px solid ${p.raw ? 'var(--amber)' : 'var(--rule)'}`, background: p.raw ? 'var(--bg-warning)' : '#fff', borderRadius: 10, padding: 12, marginTop: 10 }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--slate)' }}>
                {p.field}{p.raw && <span style={{ color: 'var(--amber)', marginLeft: 8 }}>● sin redactar por el agente</span>}
              </div>
              <div style={{ fontSize: 14, marginTop: 6 }}>{p.text}</div>
            </div>
          ))}

          {sec.kind === 'equipo' && (
            <div style={{ border: '1px solid var(--rule)', borderRadius: 10, padding: 12, marginTop: 10 }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--slate)' }}>Integrantes</div>
              <div style={{ fontSize: 14, marginTop: 6 }}>
                {exp.team.filter((t) => t.nombre).map((t) => `${t.nombre} — ${t.rol} (${t.dedicacion}%)`).join(' · ') || 'Sin integrantes declarados.'}
              </div>
            </div>
          )}

          {sec.kind === 'narrativa+presupuesto' && (
            <div className="table-scroll" style={{ marginTop: 12 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480, fontSize: 13 }}>
                <thead><tr className="mono" style={{ fontSize: 11, textAlign: 'left', color: 'var(--slate)' }}><th style={{ padding: 6 }}>Categoría</th><th style={{ padding: 6 }}>Detalle</th><th style={{ padding: 6 }}>Monto</th><th style={{ padding: 6 }}>Aporte</th></tr></thead>
                <tbody>
                  {exp.budget.map((b, i) => (
                    <tr key={i} style={{ borderTop: '1px solid var(--rule)' }}>
                      <td style={{ padding: 6 }}>{b.categoria}</td><td style={{ padding: 6 }}>{b.detalle}</td><td style={{ padding: 6 }}>{b.monto}</td><td style={{ padding: 6 }}>{b.aporte}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {puedeActuar && !composerOpen && (
            <button onClick={() => { setComposerOpen(true); setComposerText(''); }} style={{ marginTop: 12, border: '1px solid var(--rule)', background: '#fff', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>
              Comentar al postulante sobre esta sección
            </button>
          )}

          {composerOpen && (
            <Card style={{ marginTop: 12 }} accent="var(--amber)">
              <strong style={{ fontSize: 14 }}>Comentario al postulante — {sec.num} · {sec.title.toLowerCase()}</strong>
              <textarea value={composerText} onChange={(e) => setComposerText(e.target.value)} placeholder="Explica qué corregir y por qué. Viaja por correo al postulante." style={{ width: '100%', minHeight: 70, padding: 8, borderRadius: 6, border: '1px solid var(--rule)', marginTop: 8 }} />
              <div style={{ marginTop: 8 }}>
                <Button variant="teal" disabled={composerText.trim().length <= 5} onClick={enviarComentario}>Enviar comentario</Button>{' '}
                <Button onClick={() => { setComposerOpen(false); setComposerText(''); }}>Cancelar</Button>
              </div>
            </Card>
          )}
        </div>

        <aside>
          <Card style={{ padding: 14 }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--slate)' }}>Hallazgos de agentes</div>
            {exp.agents.flatMap((ag) =>
              ag.findings.map((f, i) => (
                <AgentFinding key={`${ag.label}-${i}`} color={ag.color}>
                  <span className="mono" style={{ fontSize: 10, color: ag.color }}>{ag.label}</span>
                  <div>{f}</div>
                </AgentFinding>
              )),
            )}
          </Card>
          <Card style={{ padding: 14, marginTop: 12 }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--slate)' }}>Comentarios al postulante ({exp.comentarios.length})</div>
            {exp.comentarios.map((c) => (
              <div key={c.id} style={{ borderLeft: '3px solid var(--amber)', paddingLeft: 10, margin: '8px 0' }}>
                <span className="mono" style={{ fontSize: 10, color: 'var(--amber)' }}>{c.seccion}</span>
                <p style={{ fontSize: 12, margin: '2px 0' }}>{c.texto}</p>
                {c.respuesta && <p style={{ fontSize: 12, margin: '2px 0' }}>↳ {c.respuesta}</p>}
                <span className="mono" style={{ fontSize: 10, color: c.resuelto ? 'var(--teal)' : 'var(--slate)' }}>{c.resuelto ? 'resuelto' : 'esperando respuesta'}</span>
              </div>
            ))}
          </Card>
        </aside>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Panel de demo (sin backend): wireframe con datos ficticios, portado literal de
// `Panel Formulador.dc.html`. Solo se usa cuando VITE_API_URL no está definida.
// ─────────────────────────────────────────────────────────────────────────────

interface DemoComentario { seccion: string; texto: string; estado: string }

const KPIS = [
  { label: 'Pendientes', value: '4', color: '#B8863B', valueColor: 'var(--ink)' },
  { label: 'Míos en revisión', value: '1', color: '#1F6F63', valueColor: 'var(--ink)' },
  { label: 'Cierran esta semana', value: '2', color: '#9C4A3C', valueColor: '#9C4A3C' },
  { label: 'Entregados este mes', value: '7', color: '#45566B', valueColor: 'var(--ink)' },
];

function PanelFormuladorDemo() {
  const [view, setView] = useState<View>('bandeja');
  const [tab, setTab] = useState<Tab>('pendientes');
  const [vacio, setVacio] = useState(false);
  const [section, setSection] = useState(2);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerText, setComposerText] = useState('');
  const [comentarios, setComentarios] = useState<DemoComentario[]>([
    { seccion: '05 · presupuesto', texto: 'El ítem de equipamiento no está justificado en la narrativa: hablas de una app pero pides 12 tablets. Explica por qué el piloto las necesita.', estado: 'enviado · esperando respuesta' },
  ]);
  const [checked, setChecked] = useState([false, false, false, false]);
  const [aprobado, setAprobado] = useState(false);

  if (view === 'bandeja') {
    return (
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 20px 60px' }}>
        <h1 style={{ fontSize: 26 }}>Bandeja del formulador</h1>
        <p style={{ color: 'var(--slate)', fontSize: 14 }}>Sin asignación automática: tomas el expediente que puedes atender y queda registrado.</p>

        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', margin: '16px 0' }}>
          {KPIS.map((k) => (
            <Card key={k.label} accent={k.color} style={{ padding: 14 }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--slate)' }}>{k.label}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 30, color: k.valueColor }}>{k.value}</div>
            </Card>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid var(--rule)', marginBottom: 8, flexWrap: 'wrap' }}>
          {([['pendientes', 'Pendientes (4)'], ['mios', 'En revisión mía (1)'], ['entregados', 'Entregados']] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} style={{ border: 'none', background: 'none', padding: '8px 12px', fontSize: 13, fontWeight: tab === k ? 600 : 400, color: tab === k ? 'var(--ink)' : 'var(--slate)', borderBottom: `2px solid ${tab === k ? 'var(--ink)' : 'transparent'}` }}>{l}</button>
          ))}
          <button onClick={() => setVacio((v) => !v)} style={{ marginLeft: 'auto', border: '1px solid var(--rule)', background: '#fff', borderRadius: 8, padding: '4px 10px', fontSize: 11 }}>
            {vacio ? 'ver bandeja con expedientes' : 'ver bandeja vacía'}
          </button>
        </div>

        {tab === 'pendientes' && !vacio ? (
          <div className="table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead>
                <tr className="mono" style={{ fontSize: 11, textAlign: 'left', color: 'var(--slate)' }}>
                  <th style={{ padding: 8 }}>Proyecto</th><th style={{ padding: 8 }}>Fondo</th><th style={{ padding: 8 }}>Estado de agentes</th><th style={{ padding: 8 }}>Cierra</th><th />
                </tr>
              </thead>
              <tbody>
                {INBOX.map((r) => (
                  <tr key={r.rut} style={{ borderTop: '1px solid var(--rule)' }}>
                    <td style={{ padding: 8 }}><strong style={{ fontSize: 13 }}>{r.proyecto}</strong><div className="mono" style={{ fontSize: 11, color: 'var(--slate)' }}>{r.rut}</div></td>
                    <td style={{ padding: 8, fontSize: 13 }}>{r.fondo}</td>
                    <td style={{ padding: 8 }}><span style={{ fontSize: 12, color: r.estadoColor }}>● {r.estado}</span></td>
                    <td style={{ padding: 8, fontSize: 13, color: r.urgente ? 'var(--rose)' : 'var(--slate)' }}>{r.cierre}</td>
                    <td style={{ padding: 8 }}>
                      <Button variant={r.mine ? 'ink' : 'ghost'} onClick={() => setView('expediente')}>{r.mine ? 'Continuar' : 'Tomar'}</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState tab={tab} onGoPendientes={() => setTab('pendientes')} />
        )}
      </div>
    );
  }

  if (view === 'aprobar') {
    const checklistOk = checked.every(Boolean);
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px 60px' }}>
        <button onClick={() => setView('expediente')} style={{ background: 'none', border: 'none', color: 'var(--slate)', fontSize: 13 }}>← volver al expediente</button>
        <h1 style={{ fontSize: 24, marginTop: 8 }}>Aprobar y entregar</h1>
        <p style={{ color: 'var(--slate)', fontSize: 14 }}>El checklist obligatorio es lo que sostiene la promesa de admisibilidad.</p>
        <Card style={{ marginTop: 12 }}>
          {CHECKLIST.map((label, i) => (
            <button key={i} onClick={() => setChecked((c) => c.map((v, j) => (j === i ? !v : v)))} role="checkbox" aria-checked={checked[i]} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', textAlign: 'left', background: 'none', border: 'none', padding: '9px 0', width: '100%', borderBottom: '1px solid var(--rule)' }}>
              <span aria-hidden style={{ flexShrink: 0, width: 20, height: 20, borderRadius: 5, background: checked[i] ? 'var(--teal)' : '#fff', border: `1px solid ${checked[i] ? 'var(--teal)' : 'var(--rule)'}`, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>{checked[i] ? '✓' : ''}</span>
              <span style={{ fontSize: 14 }}>{label}</span>
            </button>
          ))}
          {aprobado ? (
            <p style={{ color: 'var(--teal)', marginTop: 12 }}>Expediente aprobado y entregado. Se disparó el correo «Expediente listo» al postulante.</p>
          ) : (
            <Button variant="teal" disabled={!checklistOk} onClick={() => setAprobado(true)} style={{ marginTop: 12 }}>Aprobar y entregar</Button>
          )}
        </Card>
      </div>
    );
  }

  // Expediente en revisión
  const sec = SECTIONS[section];
  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '20px 20px 60px' }}>
      <button onClick={() => setView('bandeja')} style={{ background: 'none', border: 'none', color: 'var(--slate)', fontSize: 13 }}>← bandeja</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 22 }}>Feria Digital SpA</h1>
        <Pill color="#fff" bg="var(--amber)">Semilla Inicia</Pill>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <Button onClick={() => setView('expediente')}>Devolver con comentarios</Button>
          <Button variant="teal" onClick={() => setView('aprobar')}>Aprobar y entregar</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'minmax(180px, 220px) 1fr minmax(220px, 280px)', alignItems: 'start', marginTop: 14 }}>
        {/* Navegación por secciones */}
        <nav>
          {SECTIONS.map((s, i) => (
            <button key={s.num} onClick={() => setSection(i)} style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%', textAlign: 'left', border: 'none', background: section === i ? '#fff' : 'transparent', borderLeft: `3px solid ${section === i ? 'var(--ink)' : 'transparent'}`, padding: '8px 10px', fontSize: 13, color: section === i ? 'var(--ink)' : 'var(--slate)' }}>
              <span className="mono" style={{ fontSize: 11 }}>{s.num}</span>
              {s.title}
              <span style={{ marginLeft: 'auto', color: s.flag === 'alert' ? 'var(--amber)' : 'var(--teal)' }}>{s.flag === 'alert' ? '⚠' : '✓'}</span>
            </button>
          ))}
        </nav>

        {/* Contenido de la sección (demo, ilustrativo) */}
        <div>
          <h2 style={{ fontSize: 18 }}>{sec.num} · {sec.title}</h2>
          {sec.fields.map((f, i) => (
            <div key={i} style={{ border: `1px solid ${f.flag ? 'var(--amber)' : 'var(--rule)'}`, background: f.flag ? 'var(--bg-warning)' : '#fff', borderRadius: 10, padding: 12, marginTop: 10 }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--slate)' }}>{f.label}{f.flag && <span style={{ color: f.flagColor, marginLeft: 8 }}>● {f.flag}</span>}</div>
              <div style={{ fontSize: 14, marginTop: 6 }}>{f.text}</div>
              {f.agentNote && <AgentFinding color={f.flagColor || 'var(--amber)'}><span className="mono" style={{ fontSize: 10, color: f.flagColor }}>{f.agentLabel}</span><div>{f.agentNote}</div></AgentFinding>}
              <button onClick={() => { setSection(section); setComposerOpen(true); setComposerText(''); }} style={{ marginTop: 8, border: '1px solid var(--rule)', background: '#fff', borderRadius: 8, padding: '4px 10px', fontSize: 12 }}>Comentar al postulante</button>
            </div>
          ))}
          {sec.showBudget && (
            <div className="table-scroll" style={{ marginTop: 12 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480, fontSize: 13 }}>
                <thead><tr className="mono" style={{ fontSize: 11, textAlign: 'left', color: 'var(--slate)' }}><th style={{ padding: 6 }}>Categoría</th><th style={{ padding: 6 }}>Detalle</th><th style={{ padding: 6 }}>Monto</th><th style={{ padding: 6 }}>Aporte</th></tr></thead>
                <tbody>
                  {PANEL_BUDGET.map((b, i) => (
                    <tr key={i} style={{ borderTop: '1px solid var(--rule)', background: b.flagged ? 'var(--bg-warning)' : '#fff' }}>
                      <td style={{ padding: 6 }}>{b.categoria}</td><td style={{ padding: 6 }}>{b.detalle}</td><td style={{ padding: 6 }}>{b.monto}</td><td style={{ padding: 6 }}>{b.aporte}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {composerOpen && (
            <Card style={{ marginTop: 12 }} accent="var(--amber)">
              <strong style={{ fontSize: 14 }}>Comentario al postulante — {sec.num} · {sec.title.toLowerCase()}</strong>
              <textarea value={composerText} onChange={(e) => setComposerText(e.target.value)} placeholder="Explica qué corregir y por qué. Viaja por correo al postulante." style={{ width: '100%', minHeight: 70, padding: 8, borderRadius: 6, border: '1px solid var(--rule)', marginTop: 8 }} />
              <div style={{ marginTop: 8 }}>
                <Button variant="teal" disabled={composerText.trim().length <= 5} onClick={() => { setComentarios((c) => [...c, { seccion: `${sec.num} · ${sec.title.toLowerCase()}`, texto: composerText, estado: 'enviado · esperando respuesta' }]); setComposerOpen(false); setComposerText(''); }}>Enviar comentario</Button>{' '}
                <Button onClick={() => { setComposerOpen(false); setComposerText(''); }}>Cancelar</Button>
              </div>
            </Card>
          )}
        </div>

        {/* Hallazgos + comentarios */}
        <aside>
          <Card style={{ padding: 14 }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--slate)' }}>Hallazgos de agentes</div>
            {FINDINGS.map((f, i) => (
              <AgentFinding key={i} color={f.color}>
                <button onClick={() => setSection(f.section)} style={{ background: 'none', border: 'none', textAlign: 'left', padding: 0, cursor: 'pointer' }}>
                  <span className="mono" style={{ fontSize: 10, color: f.color }}>{f.agent}</span>
                  <div style={{ fontSize: 12 }}>{f.text}</div>
                </button>
              </AgentFinding>
            ))}
          </Card>
          <Card style={{ padding: 14, marginTop: 12 }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--slate)' }}>Comentarios al postulante ({comentarios.length})</div>
            {comentarios.map((c, i) => (
              <div key={i} style={{ borderLeft: '3px solid var(--amber)', paddingLeft: 10, margin: '8px 0' }}>
                <span className="mono" style={{ fontSize: 10, color: 'var(--amber)' }}>{c.seccion}</span>
                <p style={{ fontSize: 12, margin: '2px 0' }}>{c.texto}</p>
                <span className="mono" style={{ fontSize: 10, color: 'var(--slate)' }}>{c.estado}</span>
              </div>
            ))}
          </Card>
        </aside>
      </div>
    </div>
  );
}
