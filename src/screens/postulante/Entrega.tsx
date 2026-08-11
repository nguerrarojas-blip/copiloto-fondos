/** Pantalla de entrega: tres descargas reales (PDF, Word, guión del video),
 * atajos de edición, comentarios del formulador si existen, checklist de
 * documentos propios y vista previa con el estado real de cada sección. Falla
 * de descarga: el expediente sigue aprobado, se puede reintentar. */
import { useState } from 'react';
import { useApp } from '../../state/AppContext';
import { FUNDS } from '../../data/funds';
import { analyzeExpediente } from '../../domain/expediente';
import { computeSections } from '../../state/selectors';
import { buildDocumentModel, canExport } from '../../export/model';
import { buildGuionText } from '../../export/guion';
import { downloadBlob, fileNameFor } from '../../export/download';
import { Card, Button, Pill } from '../../ui/primitives';
import type { Block } from '../../state/types';

type DownloadKind = 'pdf' | 'docx' | 'guion';

const DOWNLOADS: { kind: DownloadKind; label: string; proposito: string }[] = [
  { kind: 'pdf', label: 'PDF', proposito: 'para revisar y archivar' },
  { kind: 'docx', label: 'Word', proposito: 'para transcribir a la plataforma oficial' },
  { kind: 'guion', label: 'Guión del video', proposito: 'los 40 segundos que exige la convocatoria' },
];

const DOCS_PROPIOS = [
  'Certificado de vigencia de la sociedad',
  'Cédula del representante legal',
  'Carpeta tributaria del último año',
  'Video de presentación de 40 segundos',
];

const EDIT_SHORTCUTS: { label: string; block: Block }[] = [
  { label: 'Editar antecedentes', block: 'identidad' },
  { label: 'Editar narrativa', block: 'narrativa' },
  { label: 'Editar presupuesto', block: 'presupuesto' },
  { label: 'Editar datos y equipo', block: 'datos' },
];

export function Entrega() {
  const { state, dispatch } = useApp();
  const fund = FUNDS[state.fondoId];
  const a = analyzeExpediente(state);
  const { sections } = computeSections(state);
  const [pending, setPending] = useState<DownloadKind | null>(null);
  const [failedKind, setFailedKind] = useState<DownloadKind | null>(null);
  const exportable = canExport(state);

  async function handleDownload(kind: DownloadKind) {
    setFailedKind(null);
    setPending(kind);
    try {
      if (state.simExportError) throw new Error('descarga simulada como fallida');
      const model = buildDocumentModel(state);
      if (kind === 'pdf') {
        const { buildPdfBlob } = await import('../../export/pdf');
        downloadBlob(buildPdfBlob(model), fileNameFor(model.razonSocial, 'expediente', 'pdf'));
      } else if (kind === 'docx') {
        const { buildDocxBlob } = await import('../../export/docx');
        downloadBlob(await buildDocxBlob(model), fileNameFor(model.razonSocial, 'expediente', 'docx'));
      } else {
        const text = buildGuionText(model);
        downloadBlob(new Blob([text], { type: 'text/plain;charset=utf-8' }), fileNameFor(model.razonSocial, 'guion-video', 'txt'));
      }
    } catch {
      setFailedKind(kind);
    } finally {
      setPending(null);
    }
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 20px 60px' }}>
      <Pill color={a.hardIssues > 0 ? 'var(--amber)' : 'var(--teal)'} bg={a.hardIssues > 0 ? 'var(--bg-warning)' : 'var(--bg-success)'}>
        {a.hardIssues > 0 ? 'Expediente entregado · requiere ajuste tuyo' : 'Expediente revisado y aprobado'}
      </Pill>
      <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', margin: '12px 0' }}>Tu expediente de {fund.nombre}</h1>

      {!exportable && (
        <Card accent="var(--amber)" style={{ marginBottom: 20 }}>
          <strong style={{ color: 'var(--amber)' }}>Faltan datos para generar tus documentos</strong>
          <p style={{ fontSize: 13, color: 'var(--slate)' }}>Completa al menos la razón social y el RUT en «Editar antecedentes» antes de descargar.</p>
          <Button onClick={() => dispatch({ type: 'EDIT_FROM_ENTREGA', block: 'identidad' })} style={{ marginTop: 8 }}>Editar antecedentes</Button>
        </Card>
      )}

      {state.comentarios.some((c) => c.resuelto) && (
        <Card accent="var(--teal)" style={{ marginBottom: 20 }}>
          <span className="mono" style={{ fontSize: 10, color: 'var(--teal)' }}>Comentarios del formulador</span>
          {state.comentarios
            .filter((c) => c.resuelto)
            .map((c) => (
              <p key={c.id} style={{ fontSize: 14 }}>
                <strong>{c.seccion}:</strong> {c.texto}
              </p>
            ))}
        </Card>
      )}

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 20 }}>
        {DOWNLOADS.map((d) => (
          <Card key={d.kind}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18 }}>{d.label}</div>
            <p style={{ fontSize: 13, color: 'var(--slate)' }}>{d.proposito}</p>
            {failedKind === d.kind ? (
              <>
                <p style={{ fontSize: 12, color: 'var(--rose)' }}>No pudimos generar la descarga. Tu expediente sigue aprobado.</p>
                <Button variant="teal" onClick={() => handleDownload(d.kind)} style={{ marginTop: 8 }}>Reintentar</Button>
              </>
            ) : (
              <Button variant="teal" disabled={!exportable || pending === d.kind} onClick={() => handleDownload(d.kind)} style={{ marginTop: 8 }}>
                {pending === d.kind ? 'Generando…' : `Descargar ${d.label}`}
              </Button>
            )}
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <Card>
          <h3 style={{ fontSize: 16 }}>Vista previa por sección</h3>
          {sections.map((sec) => {
            const color = sec.docState === 'completa' ? 'var(--teal)' : sec.docState === 'parcial' ? 'var(--amber)' : '#9aa0a8';
            return (
              <div key={sec.num} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--rule)' }}>
                <strong style={{ fontSize: 13 }}>{sec.num} · {sec.title}</strong>
                <span className="mono" style={{ marginLeft: 'auto', fontSize: 11, color }}>{sec.docState}</span>
              </div>
            );
          })}
          <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {EDIT_SHORTCUTS.map((s) => (
              <Button key={s.block} onClick={() => dispatch({ type: 'EDIT_FROM_ENTREGA', block: s.block })}>{s.label}</Button>
            ))}
          </div>
        </Card>

        <Card>
          <h3 style={{ fontSize: 16 }}>Lo que falta de tu lado</h3>
          <p style={{ fontSize: 13, color: 'var(--slate)' }}>Documentos que solo tú tienes. El envío en la plataforma lo haces tú.</p>
          {DOCS_PROPIOS.map((d) => (
            <label key={d} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 0', fontSize: 13 }}>
              <input type="checkbox" /> {d}
            </label>
          ))}
        </Card>
      </div>
    </div>
  );
}
