/** Maqueta del entregable (Expediente - Documento.dc.html): el PDF/Word que se
 * genera desde el expediente. Se arma con el estado del caso de ejemplo, de modo
 * que refleja el mismo generador que usaría producción. */
import { demoState } from '../../state/demoState';
import { FUNDS } from '../../data/funds';
import { computeSections } from '../../state/selectors';
import { computeBudget } from '../../domain/budget';
import { computePenetration } from '../../domain/penetration';
import { fmt } from '../../domain/format';

export function ExpedienteDoc() {
  const s = demoState();
  const fund = FUNDS[s.fondoId];
  const { sections } = computeSections(s);
  const b = computeBudget(s.budget, fund, s.mujeres);
  const pen = computePenetration(s.stats);
  const tope = s.mujeres ? fund.topeMujeres : fund.tope;

  return (
    <div style={{ background: 'var(--bg-secondary)', padding: '28px 12px 60px' }}>
      <div style={{ maxWidth: 780, margin: '0 auto', background: '#fff', border: '1px solid var(--rule)', borderRadius: 6, padding: '48px 56px', boxShadow: 'var(--shadow-card)' }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--slate)', borderBottom: '1px solid var(--rule)', paddingBottom: 8 }}>
          {s.identidad.razonSocial} · {fund.nombre} 2026 · Generado por Copiloto de Postulación · revisado por M. Riquelme
        </div>

        <h1 style={{ fontSize: 30, margin: '20px 0 4px' }}>Expediente de postulación</h1>
        <p style={{ color: 'var(--slate)' }}>
          Canal de venta digital para comerciantes de ferias libres, con cobro directo entre casero y comprador.
        </p>

        <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '6px 16px', fontSize: 13, margin: '16px 0' }}>
          <dt className="mono" style={{ color: 'var(--slate)' }}>Instrumento</dt>
          <dd style={{ margin: 0 }}>{fund.nombre} · {fund.institucion} · convocatoria 2026</dd>
          <dt className="mono" style={{ color: 'var(--slate)' }}>Postulante</dt>
          <dd style={{ margin: 0 }}>{s.identidad.razonSocial} · RUT {s.identidad.rut}</dd>
          <dt className="mono" style={{ color: 'var(--slate)' }}>Monto solicitado</dt>
          <dd style={{ margin: 0 }}>{fmt(b.solicitado)} · cofinanciamiento propio {b.cofi}% ({fmt(b.aporteTot)}) · tope {fmt(tope)}</dd>
          <dt className="mono" style={{ color: 'var(--slate)' }}>Estado</dt>
          <dd style={{ margin: 0, color: 'var(--teal)' }}>Revisado y aprobado por Marcela Riquelme, formuladora</dd>
        </dl>

        <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 14, fontSize: 13 }}>
          <strong>Cómo usar este documento.</strong> Cada sección corresponde a un campo del formulario oficial de {fund.nombre} y
          está identificada con su numeración. Copia el contenido campo por campo en la plataforma de {fund.institucion}. Este
          documento no constituye una postulación presentada: el envío lo realizas tú.
        </div>

        {sections.map((sec) => (
          <section key={sec.num} style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 18, borderBottom: '1px solid var(--rule)', paddingBottom: 4 }}>{sec.num} · {sec.title}</h2>

            {sec.kind === 'identidad' && (
              <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '4px 14px', fontSize: 13, marginTop: 8 }}>
                <dt className="mono" style={{ color: 'var(--slate)' }}>Razón social</dt><dd style={{ margin: 0 }}>{s.identidad.razonSocial}</dd>
                <dt className="mono" style={{ color: 'var(--slate)' }}>RUT</dt><dd style={{ margin: 0 }}>{s.identidad.rut} · ✓ dígito verificador validado</dd>
                <dt className="mono" style={{ color: 'var(--slate)' }}>Representante legal</dt><dd style={{ margin: 0 }}>{s.identidad.repLegal}</dd>
                <dt className="mono" style={{ color: 'var(--slate)' }}>Domicilio</dt><dd style={{ margin: 0 }}>{s.identidad.direccion}, {s.identidad.comuna}</dd>
                <dt className="mono" style={{ color: 'var(--slate)' }}>Contacto</dt><dd style={{ margin: 0 }}>{s.pilotoEmail} · {s.identidad.telefono}</dd>
              </dl>
            )}

            {sec.kind === 'admisibilidad' && (
              <ul style={{ fontSize: 13, marginTop: 8, paddingLeft: 18 }}>
                <li>Postulante constituido como persona jurídica vigente — cumple</li>
                <li>Monto solicitado dentro del tope del instrumento ({fmt(tope)}) — cumple</li>
                <li>Cofinanciamiento propio igual o superior a {fund.cofiMin}% — cumple ({b.cofi}%)</li>
                <li>Gastos de administración bajo {fund.adminMax}% del subsidio — cumple ({b.adminPct}%)</li>
                <li style={{ color: 'var(--rose)' }}>Video de presentación de 40 segundos — pendiente del postulante</li>
              </ul>
            )}

            {sec.paragraphs.map((p, i) => (
              <div key={i} style={{ marginTop: 10 }}>
                <div className="mono" style={{ fontSize: 11, color: 'var(--slate)' }}>{p.field}</div>
                <p style={{ fontSize: 14, margin: '2px 0 0' }}>{p.text}</p>
              </div>
            ))}

            {sec.kind === 'narrativa+presupuesto' && (
              <div className="table-scroll" style={{ marginTop: 10 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 460 }}>
                  <thead><tr className="mono" style={{ textAlign: 'left', color: 'var(--slate)' }}><th style={{ padding: 5 }}>Categoría</th><th style={{ padding: 5 }}>Detalle</th><th style={{ padding: 5 }}>Monto</th><th style={{ padding: 5 }}>Aporte</th></tr></thead>
                  <tbody>
                    {s.budget.map((r, i) => (
                      <tr key={i} style={{ borderTop: '1px solid var(--rule)' }}>
                        <td style={{ padding: 5 }}>{r.categoria}</td><td style={{ padding: 5 }}>{r.detalle}</td><td style={{ padding: 5 }}>{fmt(Number(r.monto))}</td><td style={{ padding: 5 }}>{fmt(Number(r.aporte))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {sec.kind === 'equipo' && (
              <ul style={{ fontSize: 13, marginTop: 8, paddingLeft: 18 }}>
                {s.team.map((t, i) => <li key={i}>{t.nombre} — {t.rol} ({t.dedicacion}%)</li>)}
              </ul>
            )}

            {sec.kind === 'datos' && (
              <p style={{ fontSize: 13, marginTop: 8 }}>
                Ventas año anterior {fmt(Number(s.stats.ventasAnterior))} · {s.stats.empleados} trabajadores · exportaciones{' '}
                {fmt(Number(s.stats.exportaciones))} · capital previo {fmt(Number(s.stats.capitalPrevio))} · mercado direccionable{' '}
                {fmt(Number(s.stats.mercado))} · proyección año 2 {fmt(pen.proyeccion)} ({pen.penetracion}% de penetración).
              </p>
            )}
          </section>
        ))}

        <section style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 18, borderBottom: '1px solid var(--rule)', paddingBottom: 4 }}>Anexo B · Documentos que debe adjuntar el postulante</h2>
          <ul style={{ fontSize: 13, marginTop: 8, paddingLeft: 18, color: 'var(--slate)' }}>
            <li>Certificado de vigencia de la sociedad</li>
            <li>Cédula del representante legal</li>
            <li>Carpeta tributaria del último año</li>
            <li>Video de presentación de 40 segundos (guión en Anexo A)</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
