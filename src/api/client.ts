/**
 * Cliente de la API del backend. Solo se activa si `VITE_API_URL` está definida;
 * de lo contrario el front funciona en modo local (localStorage) — así la demo
 * autónoma sigue abriendo sin servidor.
 *
 * El token del enlace de acceso viaja en la URL (?token=...) y se guarda en
 * sessionStorage para las llamadas siguientes.
 */
import type { AppState, Comentario } from '../state/types';
import type { DocSection } from '../state/selectors';
import type { AgentFindings, Estado } from '../domain/expediente';

const API_URL = import.meta.env.VITE_API_URL as string | undefined;
const TOKEN_KEY = 'copiloto_access_token';
const FORMULADOR_KEY = 'copiloto_formulador_email';

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

/** Identificación (no autenticación real) del formulador para el panel interno.
 * Ver server/src/routes/formulador.ts: se envía como cabecera y el servidor
 * valida contra la tabla `formulador`. Endurecer antes de abrir a más gente. */
export function getFormuladorEmail(): string | null {
  return typeof localStorage !== 'undefined' ? localStorage.getItem(FORMULADOR_KEY) : null;
}

export function setFormuladorEmail(email: string): void {
  localStorage.setItem(FORMULADOR_KEY, email);
}

export function clearFormuladorEmail(): void {
  localStorage.removeItem(FORMULADOR_KEY);
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
  redactor(input: { raw: string; field: string; fondo: string; fondoId: string; qid: string }) {
    return req<{ formal: string }>('/api/redactor', { method: 'POST', body: JSON.stringify(input) });
  },
};

async function reqFormulador<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const email = getFormuladorEmail();
  const res = await fetch(`${API_URL}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(email ? { 'x-formulador-email': email } : {}),
      ...opts.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body?.error || 'error', body);
  }
  return res.json() as Promise<T>;
}

export interface FormuladorKpis {
  pendientes: number;
  mios: number;
  entregados: number;
  nombre: string;
}

export interface BandejaRow {
  id: string;
  fondo_id: string;
  piloto_email: string;
  estado_label: string;
  hard_issues: number;
  progress_pct: number;
  lev_stage: string;
  updated_at: string;
}

export type ComentarioFormulador = Comentario & { created_at: string };

export interface ExpedienteFormulador {
  id: string;
  fondoId: string;
  pilotoEmail: string;
  mine: boolean;
  levStage: string;
  estadoLabel: string;
  hardIssues: number;
  progressPct: number;
  identidad: AppState['identidad'];
  sections: DocSection[];
  budget: AppState['budget'];
  team: AppState['team'];
  stats: AppState['stats'];
  agents: AgentFindings[];
  estado: Estado;
  comentarios: ComentarioFormulador[];
}

export const formuladorApi = {
  kpis() {
    return reqFormulador<FormuladorKpis>('/api/formulador/kpis');
  },
  bandeja(tab: 'pendientes' | 'mios' | 'entregados') {
    return reqFormulador<{ tab: string; expedientes: BandejaRow[] }>(`/api/formulador/bandeja?tab=${tab}`);
  },
  tomar(id: string) {
    return reqFormulador<{ ok: true }>(`/api/formulador/tomar/${id}`, { method: 'POST' });
  },
  expediente(id: string) {
    return reqFormulador<ExpedienteFormulador>(`/api/formulador/expediente/${id}`);
  },
  comentar(input: { postulacionId: string; seccion: string; block: string; texto: string }) {
    return reqFormulador<{ ok: true }>('/api/formulador/comentario', { method: 'POST', body: JSON.stringify(input) });
  },
  aprobar(id: string) {
    return reqFormulador<{ ok: true }>(`/api/formulador/aprobar/${id}`, { method: 'POST' });
  },
};
