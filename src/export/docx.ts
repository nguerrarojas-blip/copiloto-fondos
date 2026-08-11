/**
 * Word del expediente — pensado para transcribir a la plataforma oficial:
 * secciones y campos numerados igual que el formulario, para copiar-pegar
 * campo por campo sin tener que reordenar nada.
 */
import { Document, HeadingLevel, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from 'docx';
import type { DocumentModel } from './model';
import { buildGuionText } from './guion';
import { fmt, num } from '../domain/format';

function h(text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel] = HeadingLevel.HEADING_2): Paragraph {
  return new Paragraph({ text, heading: level, spacing: { before: 240, after: 120 } });
}

function field(label: string, value: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: `${label}: `, bold: true }), new TextRun(value || 'sin registrar')],
    spacing: { after: 60 },
  });
}

function body(text: string): Paragraph {
  return new Paragraph({ text, spacing: { after: 160 } });
}

function fieldLabelThenText(fieldLabel: string, text: string): Paragraph[] {
  return [
    new Paragraph({ children: [new TextRun({ text: fieldLabel.toUpperCase(), bold: true, size: 18, color: '5B6472' })], spacing: { before: 120 } }),
    body(text),
  ];
}

function budgetTable(rows: DocumentModel['budget']): Table {
  const headerRow = new TableRow({
    children: ['Categoría', 'Detalle', 'Monto', 'Aporte'].map(
      (t) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: t, bold: true })] })] }),
    ),
  });
  const dataRows = rows.map(
    (r) =>
      new TableRow({
        children: [r.categoria, r.detalle, fmt(num(r.monto)), fmt(num(r.aporte))].map(
          (t) => new TableCell({ children: [new Paragraph(t)] }),
        ),
      }),
  );
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...dataRows] });
}

export async function buildDocxBlob(model: DocumentModel): Promise<Blob> {
  const children: (Paragraph | Table)[] = [];

  children.push(
    new Paragraph({ text: 'Expediente de postulación', heading: HeadingLevel.TITLE }),
    body(`${model.fondoNombre} · ${model.fondoInstitucion} — generado por Copiloto de Postulación el ${model.generatedAt.toLocaleDateString('es-CL')}.`),
  );

  children.push(h('Antecedentes generales'));
  children.push(
    field('Razón social', model.razonSocial),
    field('RUT', model.rut),
    field('Representante legal', model.repLegal),
    field('Domicilio', [model.direccion, model.comuna].filter(Boolean).join(', ')),
    field('Contacto', [model.contactoEmail, model.telefono].filter(Boolean).join(' · ')),
  );

  children.push(h('Resumen financiero'));
  children.push(
    field('Monto solicitado', `${model.monto} (tope del instrumento: ${model.tope})`),
    field('Cofinanciamiento propio', `${model.cofi}% (${model.aporte})`),
  );

  children.push(h('Admisibilidad'));
  for (const item of model.admisibilidad) {
    children.push(body(`${item.cumple ? '✓' : '✗'} ${item.label}`));
  }
  children.push(body('✗ Video de presentación de 40 segundos — pendiente del postulante (ver Anexo A).'));

  for (const sec of model.sections) {
    if (sec.kind === 'identidad' || sec.kind === 'admisibilidad') continue;
    children.push(h(`${sec.num} · ${sec.title}`));

    if (sec.paragraphs.length === 0) {
      children.push(body(sec.emptyNote || 'Sin completar todavía.'));
    }
    for (const p of sec.paragraphs) {
      if (!p.text) continue;
      children.push(...fieldLabelThenText(p.field, p.text));
    }
    if (sec.kind === 'narrativa+presupuesto' && model.budget.length) {
      children.push(new Paragraph({ children: [new TextRun({ text: 'PRESUPUESTO', bold: true, size: 18, color: '5B6472' })], spacing: { before: 120, after: 80 } }));
      children.push(budgetTable(model.budget));
      children.push(new Paragraph({ text: '', spacing: { after: 160 } }));
    }
    if (sec.kind === 'equipo') {
      if (model.team.some((t) => t.nombre)) {
        for (const t of model.team.filter((t) => t.nombre)) {
          children.push(body(`${t.nombre} — ${t.rol || 'rol sin especificar'} (${t.dedicacion || '0'}% dedicación)`));
        }
      } else {
        children.push(body('Equipo sin completar todavía.'));
      }
    }
    if (sec.kind === 'datos') {
      children.push(
        body(
          `Ventas año anterior ${model.stats.ventasAnterior || '—'} · ${model.stats.empleados || '0'} trabajadores · ` +
            `mercado direccionable ${model.mercadoFmt} · proyección año 2 ${model.proyeccionFmt} (${model.penetracionPct}% de penetración).`,
        ),
      );
    }
  }

  if (model.comentariosResueltos.length) {
    children.push(h('Comentarios del formulador'));
    for (const com of model.comentariosResueltos) {
      children.push(...fieldLabelThenText(com.seccion, com.texto));
    }
  }

  children.push(h('Anexo A · Guión del video (40 segundos)'));
  for (const line of buildGuionText(model).split('\n')) {
    children.push(new Paragraph({ text: line || ' ', spacing: { after: 60 } }));
  }

  children.push(h('Anexo B · Documentos que debe adjuntar el postulante'));
  for (const doc of [
    'Certificado de vigencia de la sociedad',
    'Cédula del representante legal',
    'Carpeta tributaria del último año',
    'Video de presentación de 40 segundos (guión en Anexo A)',
  ]) {
    children.push(new Paragraph({ text: `☐ ${doc}`, spacing: { after: 60 } }));
  }

  children.push(
    new Paragraph({
      spacing: { before: 240 },
      children: [
        new TextRun({
          italics: true,
          size: 16,
          color: '8B9099',
          text: 'Este documento no constituye una postulación presentada: el envío a la plataforma oficial lo realizas tú. Copiloto de Postulación garantiza la admisibilidad de la postulación armada, no la adjudicación del fondo.',
        }),
      ],
    }),
  );

  const document = new Document({ sections: [{ children }] });
  return Packer.toBlob(document);
}
