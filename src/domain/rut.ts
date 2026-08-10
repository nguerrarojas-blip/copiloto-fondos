/**
 * Validación de RUT chileno — algoritmo módulo 11.
 * Portado literalmente desde `Copiloto Final.dc.html` (validRut), normalizando
 * puntos y guión, dígito verificador 0-9 o K.
 */
export function validRut(rut: string): boolean {
  const clean = String(rut || '')
    .replace(/[^0-9kK]/g, '')
    .toUpperCase();
  if (clean.length < 8) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  let sum = 0;
  let mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const res = 11 - (sum % 11);
  const calc = res === 11 ? '0' : res === 10 ? 'K' : String(res);
  return calc === dv;
}
