/** Catálogo de fondos: los tres abiertos con detalle real (tope, cierre), y el
 * resto reconocido por el Matchmaker pero con su convocatoria cerrada — se
 * muestra cuándo se espera que abra, nunca un estado inventado. */
import { CATALOGO } from '../../data/catalogo';
import { FUNDS, type FondoId } from '../../data/funds';
import { fmt } from '../../domain/format';
import { Card, Pill } from '../../ui/primitives';

function hasFullRules(id: string): id is FondoId {
  return id in FUNDS;
}

export function FundsCatalog() {
  return (
    <section id="fondos" style={{ marginTop: 56, scrollMarginTop: 80 }}>
      <h2 style={{ fontSize: 22, margin: '0 0 4px' }}>Fondos que cubrimos</h2>
      <p style={{ color: 'var(--slate)', fontSize: 14, marginBottom: 16 }}>
        La restricción real no es qué fondos conocemos, sino si la convocatoria está abierta. El piloto arma el expediente
        completo para los tres instrumentos abiertos; el resto lo reconocemos en el diagnóstico y avisamos cuando abran.
      </p>
      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {CATALOGO.map((c) => {
          const fund = hasFullRules(c.id) ? FUNDS[c.id] : null;
          return (
            <Card key={c.id} accent={c.abierto ? 'var(--teal)' : undefined} style={{ opacity: c.abierto ? 1 : 0.85 }}>
              <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18 }}>{c.nombre}</div>
                {c.abierto ? (
                  <Pill color="var(--teal)" bg="var(--bg-success)">Abierto</Pill>
                ) : (
                  <Pill color="var(--slate)" bg="var(--bg-secondary)">Cerrado</Pill>
                )}
              </div>
              <div className="mono" style={{ fontSize: 12, color: 'var(--slate)', marginTop: 4 }}>{c.institucion}</div>
              {c.abierto && fund ? (
                <div className="mono" style={{ fontSize: 12, color: 'var(--ink)', marginTop: 8 }}>
                  Tope {fmt(fund.tope)}{fund.topeMujeres !== fund.tope ? ` (${fmt(fund.topeMujeres)} mujeres)` : ''} · {c.cierre}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--slate)', marginTop: 8 }}>
                  {c.apertura ? c.apertura.charAt(0).toUpperCase() + c.apertura.slice(1) : 'Sin fecha de apertura publicada.'} Déjanos
                  tu correo en el diagnóstico y te avisamos.
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
