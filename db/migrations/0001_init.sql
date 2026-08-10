-- Copiloto de Postulación — esquema inicial (PostgreSQL, DigitalOcean Managed).
-- Control de acceso: lo aplica la API (que guarda las credenciales de la base y
-- valida los access tokens). No usamos RLS porque el único que habla con la base
-- es el servidor, nunca el navegador.
--
-- Correr una vez:  psql "$DATABASE_URL" -f db/migrations/0001_init.sql

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gen_random_uuid()

-- Trigger genérico para mantener updated_at.
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────────────────────
-- Perfil de empresa persistente. Una postulación cuelga de una empresa
-- (requerimientos §5.2.2): decidirlo ahora evita migrar los datos de identidad.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE empresa (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  razon_social  text NOT NULL,
  rut           text NOT NULL,                -- normalizado sin puntos, con guión
  direccion     text NOT NULL DEFAULT '',
  comuna        text NOT NULL DEFAULT '',
  telefono      text NOT NULL DEFAULT '',
  rep_legal     text NOT NULL DEFAULT '',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX empresa_rut_key ON empresa (rut);
CREATE TRIGGER empresa_updated BEFORE UPDATE ON empresa
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Formuladores: las personas reales que revisan. Sin asignación automática.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE formulador (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     text NOT NULL,
  email      text NOT NULL,
  activo     boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX formulador_email_key ON formulador (lower(email));

-- ─────────────────────────────────────────────────────────────────────────────
-- Postulación: el trabajo en curso. Guardamos el estado completo del cliente en
-- `state` (jsonb) y promovemos a columnas lo que la bandeja del formulador
-- necesita consultar y ordenar.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE postulacion (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id     uuid REFERENCES empresa(id) ON DELETE SET NULL,
  fondo_id       text NOT NULL CHECK (fondo_id IN ('semilla-inicia','fondo-crece')),
  mujeres        boolean,
  piloto_email   text NOT NULL,
  consent        boolean NOT NULL DEFAULT false,

  -- Navegación / etapa (espejo de columnas para consultas rápidas).
  screen         text NOT NULL DEFAULT 'levantamiento',
  block          text NOT NULL DEFAULT 'identidad',
  lev_stage      text NOT NULL DEFAULT 'work',

  -- Derivados del motor de reglas, recalculados por la API en cada guardado.
  estado_label   text NOT NULL DEFAULT 'Requiere atención',
  hard_issues    int  NOT NULL DEFAULT 0,
  progress_pct   int  NOT NULL DEFAULT 0,

  -- Revisión.
  formulador_id  uuid REFERENCES formulador(id) ON DELETE SET NULL,
  reeditado      boolean NOT NULL DEFAULT false,

  -- Snapshot íntegro del estado del cliente (identidad, answers, budget, etc.).
  state          jsonb NOT NULL DEFAULT '{}'::jsonb,

  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX postulacion_formulador_idx ON postulacion (formulador_id);
CREATE INDEX postulacion_estado_idx     ON postulacion (estado_label);
CREATE INDEX postulacion_fondo_idx      ON postulacion (fondo_id);
CREATE INDEX postulacion_empresa_idx    ON postulacion (empresa_id);
CREATE TRIGGER postulacion_updated BEFORE UPDATE ON postulacion
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Enlaces de acceso sin contraseña. Personales, vencen a los 30 días. Cada correo
-- trae uno fresco; el vencido lleva a una pantalla que reemite, no a un error.
-- Guardamos solo el hash del token, nunca el token en claro.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE access_token (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  postulacion_id uuid NOT NULL REFERENCES postulacion(id) ON DELETE CASCADE,
  token_hash     text NOT NULL,               -- sha256 del token entregado por correo
  email          text NOT NULL,
  expires_at     timestamptz NOT NULL,
  revoked        boolean NOT NULL DEFAULT false,
  used_at        timestamptz,                 -- primer uso (para métrica de retorno)
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX access_token_hash_key ON access_token (token_hash);
CREATE INDEX access_token_postulacion_idx ON access_token (postulacion_id);
CREATE INDEX access_token_expires_idx     ON access_token (expires_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- Comentarios del formulador al postulante (viajan por correo). Cada uno pide una
-- respuesta; solo se reenvía cuando todos están resueltos.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE comentario (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  postulacion_id uuid NOT NULL REFERENCES postulacion(id) ON DELETE CASCADE,
  formulador_id  uuid REFERENCES formulador(id) ON DELETE SET NULL,
  seccion        text NOT NULL,
  block          text NOT NULL,
  texto          text NOT NULL,
  respuesta      text NOT NULL DEFAULT '',
  resuelto       boolean NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX comentario_postulacion_idx ON comentario (postulacion_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Registro de correos enviados. Regla del producto: nunca más de un correo por
-- acción; un solo recordatorio de plazo por postulación. Esta tabla permite
-- hacer cumplir esas reglas (idempotencia).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE correo_enviado (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  postulacion_id uuid REFERENCES postulacion(id) ON DELETE CASCADE,
  tipo           text NOT NULL CHECK (tipo IN
                   ('enlace_acceso','en_revision','devuelto','listo','recordatorio')),
  to_email       text NOT NULL,
  subject        text NOT NULL,
  provider_id    text,                         -- id que devuelve Resend
  sent_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX correo_postulacion_idx ON correo_enviado (postulacion_id, tipo);

-- ─────────────────────────────────────────────────────────────────────────────
-- Eventos de métricas (Legal y Metricas §3). REGLA DURA: ningún evento lleva
-- contenido del proyecto. `props` solo admite números, booleanos y categorías.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE metric_event (
  id             bigserial PRIMARY KEY,
  event          text NOT NULL,
  postulacion_id uuid REFERENCES postulacion(id) ON DELETE SET NULL,
  formulador_id  uuid REFERENCES formulador(id) ON DELETE SET NULL,
  props          jsonb NOT NULL DEFAULT '{}'::jsonb,
  ts             timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX metric_event_event_idx ON metric_event (event, ts);

-- ─────────────────────────────────────────────────────────────────────────────
-- Corpus de proyectos adjudicados. Anónimo de cara al usuario. En producción es
-- una tabla real que hay que poblar y mantener; se carga por separado.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE corpus_adjudicado (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fondo_id     text NOT NULL,
  rubro        text NOT NULL,
  anio         int  NOT NULL,
  monto        bigint NOT NULL,
  cofi_pct     int  NOT NULL,
  penetracion  int  NOT NULL,
  leccion      text NOT NULL DEFAULT '',
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX corpus_fondo_idx ON corpus_adjudicado (fondo_id);

COMMIT;
