/** Catálogo de fondos: los dos del piloto con detalle real (tope, cierre), y el
 * resto del catálogo reconocido por el Matchmaker, marcado como fuera del
 * piloto por ahora. Nada de estados o plazos inventados para los que no están
 * en el piloto — no tenemos esos datos todavía. */
import { CATALOGO, PILOTO_FONDOS } from '../../data/catalogo';
import { FUNDS } from '../../data/funds';
import { fmt } from '../../domain/format';
import { Card, Pill } from '../../ui/primitives';

export function FundsCatalog() {
  return (
    <section style={{ marginTop: 56 }}>
      <h2 style={{ fontSize: 22, margin: '0 0 4px' }}>Fondos que cubrimos</h2>
      <p style={{ color: 'var(--slate)', fontSize: 14, marginBottom: 16 }}>
        El piloto arma el expediente completo para dos instrumentos. Reconocemos el resto del catálogo en el diagnóstico y te
        avisamos cuando los incorporemos.
      </p>
      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {CATALOGO.map((c) => {
          const enPiloto = (PILOTO_FONDOS as readonly string[]).includes(c.id);
          const fund = enPiloto ? FUNDS[c.id as keyof typeof FUNDS] : null;
          return (
            <Card key={c.id} accent={enPiloto ? 'var(--teal)' : undefined} style={{ opacity: enPiloto ? 1 : 0.85 }}>
              <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18 }}>{c.nombre}</div>
                {enPiloto ? (
                  <Pill color="var(--teal)" bg="var(--bg-success)">En el piloto</Pill>
                ) : (
                  <Pill color="var(--slate)" bg="var(--bg-secondary)">Fuera del piloto</Pill>
                )}
              </div>
              <div className="mono" style={{ fontSize: 12, color: 'var(--slate)', marginTop: 4 }}>{c.institucion}</div>
              {fund ? (
                <div className="mono" style={{ fontSize: 12, color: 'var(--ink)', marginTop: 8 }}>
                  Tope {fmt(fund.tope)}{fund.topeMujeres !== fund.tope ? ` (${fmt(fund.topeMujeres)} mujeres)` : ''} · cierra en {fund.dias} días
                </div>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--slate)', marginTop: 8 }}>
                  Lo reconocemos en el diagnóstico. Déjanos tu correo ahí y te avisamos cuando lo sumemos al piloto.
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
