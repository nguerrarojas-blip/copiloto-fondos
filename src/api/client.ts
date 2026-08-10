/**
 * Cliente de la API del backend. Solo se activa si `VITE_API_URL` está definida;
 * de lo contrario el front funciona en modo local (localStorage) — así la demo
 * autónoma sigue abriendo sin servidor.
 *
 * El token del enlace de acceso viaja en la URL (?token=...) y se guarda en
 * sessionStorage para las llamadas siguientes.
 */
import type { AppState } from '../state/types';

const API_URL = import.meta.env.VITE_API_URL as string | undefined;
const TOKEN_KEY = 'copiloto_access_token';

export function apiEnabled(): boolean {
  return !!API_URL;
}

/** Toma el token de la URL si viene, lo guarda, y lo devuelve. */
export function readToken(): string | null {
  const fromUrl = new URLSearchParams(location.search).get('token');
  if (fromUrl) {
    sessionStorage.setItem(TOKEN_KEY, fromUrl);
    return fromUrl;
  }
  return sessionStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = readToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body?.error || 'error', body);
  }
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(public status: number, public code: string, public body: unknown) {
    super(code);
  }
}

export interface Derived {
  estadoLabel: string;
  hardIssues: number;
  progressPct: number;
}

export const api = {
  startPiloto(fondoId: string, mujeres: boolean | null, pilotoEmail: string) {
    return req<{ ok: true }>('/api/piloto/start', { method: 'POST', body: JSON.stringify({ fondoId, mujeres, pilotoEmail }) });
  },
  resendLink(email: string) {
    return req<{ ok: true }>('/api/piloto/resend', { method: 'POST', body: JSON.stringify({ email }) });
  },
  getPostulacion() {
    return req<{ state: AppState; derived: Derived }>('/api/postulacion');
  },
  savePostulacion(state: AppState) {
    return req<{ derived: Derived }>('/api/postulacion', { method: 'PUT', body: JSON.stringify({ state }) });
  },
  redactor(input: { raw: string; field: string; fondo: string }) {
    return req<{ formal: string }>('/api/redactor', { method: 'POST', body: JSON.stringify(input) });
  },
};
