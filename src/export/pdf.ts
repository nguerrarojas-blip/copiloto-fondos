/**
 * PDF del expediente — pensado para revisar y archivar. Layout simple a
 * propósito (texto + una tabla de presupuesto): jsPDF sin plugins extra, con
 * paginado manual porque el contenido varía mucho según cuánto completó el
 * usuario.
 */
import { jsPDF } from 'jspdf';
import type { DocumentModel } from './model';
import { buildGuionText } from './guion';
import { fmt, num } from '../domain/format';

const MARGIN = 18;
const PAGE_W = 210; // A4 mm
const PAGE_H = 297;
const CONTENT_W = PAGE_W - MARGIN * 2;

class Cursor {
  y = MARGIN;
  constructor(private doc: jsPDF) {}

  ensure(h: number): void {
    if (this.y + h > PAGE_H - MARGIN) {
      this.doc.addPage();
      this.y = MARGIN;
    }
  }

  heading(text: string, size = 13): void {
    this.ensure(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(size);
    this.doc.text(text, MARGIN, this.y);
    this.y += size * 0.5;
    this.doc.setDrawColor(221, 214, 200);
    this.doc.line(MARGIN, this.y, PAGE_W - MARGIN, this.y);
    this.y += 6;
  }

  label(text: string): void {
    this.ensure(6);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(9);
    this.doc.setTextColor(91, 100, 114);
    this.doc.text(text.toUpperCase(), MARGIN, this.y);
    this.doc.setTextColor(20, 20, 20);
    this.y += 5;
  }

  paragraph(text: string, size = 10.5): void {
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(size);
    const lines = this.doc.splitTextToSize(text, CONTENT_W) as string[];
    for (const line of lines) {
      this.ensure(6);
      this.doc.text(line, MARGIN, this.y);
      this.y += 5.2;
    }
    this.y += 2;
  }

  gap(h = 4): void {
    this.y += h;
  }

  /** Tabla simple del presupuesto: categoría, detalle, monto, aporte. Sin plugin. */
  table(rows: { categoria: string; detalle: string; monto: string; aporte: string }[]): void {
    const cols = [0, 0.3, 0.62, 0.81].map((f) => MARGIN + f * CONTENT_W);
    const headers = ['Categoría', 'Detalle', 'Monto', 'Aporte'];
    this.ensure(8);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(9);
    headers.forEach((h, i) => this.doc.text(h, cols[i], this.y));
    this.y += 4.5;
    this.doc.setDrawColor(221, 214, 200);
    this.doc.line(MARGIN, this.y - 2.5, PAGE_W - MARGIN, this.y - 2.5);

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    for (const r of rows) {
      this.ensure(6);
      this.doc.text(r.categoria, cols[0], this.y, { maxWidth: 0.3 * CONTENT_W - 2 });
      this.doc.text(r.detalle, cols[1], this.y, { maxWidth: 0.32 * CONTENT_W - 2 });
      this.doc.text(fmt(num(r.monto)), cols[2], this.y);
      this.doc.text(fmt(num(r.aporte)), cols[3], this.y);
      this.y += 5.5;
    }
    this.y += 2;
  }
}

export function buildPdfBlob(model: DocumentModel): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const c = new Cursor(doc);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Expediente de postulación', MARGIN, c.y + 4);
  c.y += 10;
  c.paragraph(`${model.fondoNombre} · ${model.fondoInstitucion} — generado por Copiloto de Postulación el ${model.generatedAt.toLocaleDateString('es-CL')}.`, 9.5);
  c.gap(2);

  c.heading('Antecedentes generales');
  c.paragraph(`Razón social: ${model.razonSocial}`);
  c.paragraph(`RUT: ${model.rut}`);
  c.paragraph(`Representante legal: ${model.repLegal || 'sin registrar'}`);
  c.paragraph(`Domicilio: ${[model.direccion, model.comuna].filter(Boolean).join(', ') || 'sin registrar'}`);
  c.paragraph(`Contacto: ${model.contactoEmail || 'sin registrar'}${model.telefono ? ' · ' + model.telefono : ''}`);

  c.heading('Resumen financiero');
  c.paragraph(`Monto solicitado: ${model.monto} · Tope del instrumento: ${model.tope}`);
  c.paragraph(`Cofinanciamiento propio: ${model.cofi}% (${model.aporte})`);

  c.heading('Admisibilidad');
  for (const item of model.admisibilidad) {
    c.paragraph(`${item.cumple ? '✓' : '✗'} ${item.label}`);
  }
  c.paragraph('✗ Video de presentación de 40 segundos — pendiente del postulante (ver Anexo A).');

  for (const sec of model.sections) {
    if (sec.kind === 'identidad' || sec.kind === 'admisibilidad') continue;
    c.heading(`${sec.num} · ${sec.title}`);
    if (sec.paragraphs.length === 0) {
      c.paragraph(sec.emptyNote || 'Sin completar todavía.', 10);
      continue;
    }
    for (const p of sec.paragraphs) {
      if (!p.text) continue;
      c.label(p.field);
      c.paragraph(p.text);
    }
    if (sec.kind === 'narrativa+presupuesto' && model.budget.length) {
      c.gap(1);
      c.label('Presupuesto');
      c.table(model.budget);
    }
    if (sec.kind === 'equipo') {
      if (model.team.some((t) => t.nombre)) {
        for (const t of model.team.filter((t) => t.nombre)) {
          c.paragraph(`• ${t.nombre} — ${t.rol || 'rol sin especificar'} (${t.dedicacion || '0'}% dedicación)`);
        }
      } else {
        c.paragraph('Equipo sin completar todavía.');
      }
    }
    if (sec.kind === 'datos') {
      c.paragraph(
        `Ventas año anterior ${model.stats.ventasAnterior || '—'} · ${model.stats.empleados || '0'} trabajadores · ` +
          `mercado direccionable ${model.mercadoFmt} · proyección año 2 ${model.proyeccionFmt} (${model.penetracionPct}% de penetración).`,
      );
    }
  }

  if (model.comentariosResueltos.length) {
    c.heading('Comentarios del formulador');
    for (const com of model.comentariosResueltos) {
      c.label(com.seccion);
      c.paragraph(com.texto);
    }
  }

  c.heading('Anexo A · Guión del video (40 segundos)');
  c.paragraph(buildGuionText(model), 9.5);

  c.heading('Anexo B · Documentos que debe adjuntar el postulante');
  c.paragraph('Certificado de vigencia de la sociedad');
  c.paragraph('Cédula del representante legal');
  c.paragraph('Carpeta tributaria del último año');
  c.paragraph('Video de presentación de 40 segundos (guión en Anexo A)');

  c.gap(6);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(139, 144, 153);
  const disclaimer = doc.splitTextToSize(
    'Este documento no constituye una postulación presentada: el envío a la plataforma oficial lo realizas tú. Copiloto de Postulación garantiza la admisibilidad de la postulación armada, no la adjudicación del fondo.',
    CONTENT_W,
  ) as string[];
  for (const line of disclaimer) {
    c.ensure(5);
    doc.text(line, MARGIN, c.y);
    c.y += 4.2;
  }

  return doc.output('blob');
}
