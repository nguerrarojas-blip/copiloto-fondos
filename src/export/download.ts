/** Dispara la descarga de un Blob en el navegador, sin dependencias extra. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Nombre de archivo seguro a partir de la razón social y el tipo de documento. */
export function fileNameFor(razonSocial: string, kind: string, ext: string): string {
  const slug = (razonSocial || 'expediente')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${slug || 'expediente'}-${kind}.${ext}`;
}
