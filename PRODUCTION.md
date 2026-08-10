# Puesta en marcha en producción — Copiloto de Postulación

Esta guía te lleva del prototipo a un producto real corriendo en **DigitalOcean**, con **PostgreSQL** administrado, la API en **App Platform**, correos con **Resend** e IA con **Anthropic (Claude)**.

Está pensada para seguirse paso a paso. Lo que dice *(lo hace un desarrollador)* requiere alguien técnico; el resto lo puedes hacer tú.

---

## 1. Qué se construyó en esta fase (cimientos)

- **Base de datos** (`db/migrations/0001_init.sql`): empresas, postulaciones, enlaces de acceso, formuladores, comentarios, correos enviados, métricas y corpus.
- **API** (`server/`): Node + Fastify + PostgreSQL. Incluye:
  - inicio del piloto → crea la postulación, emite el **enlace de acceso de 30 días** y envía el correo;
  - **persistencia real** en servidor (reemplaza el `localStorage` del prototipo);
  - reutiliza el **mismo motor de reglas** del front (una sola fuente de verdad);
  - endpoints del formulador (bandeja, tomar, aprobar);
  - envío de correos con **Resend** usando las plantillas del producto.
- **Front conectado**: si defines `VITE_API_URL`, el front usa el backend; si no, sigue en modo local (la demo autónoma abre sin servidor).

Todo compila y pasa el typecheck. Lo que falta para operar de verdad está en la sección 6 (hoja de ruta).

---

## 2. Cuentas y llaves que necesitas

| Servicio | Para qué | Nota |
|---|---|---|
| **DigitalOcean** | Base de datos, API y frontend | Ya la tienes |
| **Resend** | Enviar los correos | Verifica tu dominio (registros DNS) |
| **Anthropic** | IA del Redactor y agentes (fase siguiente) | Puedes dejarla para después |
| **Un dominio** | Que los correos salgan desde `marcela@tudominio.cl` | Se verifica en Resend |

> **Seguridad:** las llaves se ponen como *variables de entorno* en DigitalOcean o en un archivo `.env` local. Nunca en el código ni en el repositorio.

---

## 3. Correr todo en tu computador (local) *(lo hace un desarrollador)*

Necesitas [Node.js](https://nodejs.org) 20+ instalado.

**Base de datos.** Para probar local puedes usar un PostgreSQL local, o directamente la base administrada de DigitalOcean (sección 4). Con la cadena de conexión lista:

```bash
# API
cd server
cp .env.example .env          # y completa DATABASE_URL, TOKEN_SECRET, etc.
npm install
npm run migrate               # crea todas las tablas
npm run dev                   # API en http://localhost:8080

# Frontend (en otra terminal)
cd ..
cp .env.example .env.local    # deja VITE_API_URL=http://localhost:8080
npm install
npm run dev                   # front en http://localhost:5173
```

Sin `RESEND_API_KEY`, los correos se imprimen en la consola del servidor (útil para copiar el enlace de acceso en pruebas).

---

## 4. Crear la base de datos en DigitalOcean

1. Panel de DigitalOcean → **Databases** → **Create Database Cluster** → PostgreSQL 16.
2. Cuando esté lista, entra a **Connection details** y copia la *connection string* (incluye `?sslmode=require`).
3. Ponla como `DATABASE_URL` en el `.env` del servidor (o en las variables de la App, sección 5).
4. Corre la migración una vez:

   ```bash
   cd server
   DATABASE_URL="...tu-cadena..." npm run migrate
   ```

---

## 5. Desplegar en App Platform

Hay un archivo listo en `.do/app.yaml`. Pasos:

1. Sube el proyecto a un repositorio de GitHub.
2. En `.do/app.yaml` reemplaza `<TU-USUARIO>/<TU-REPO>`.
3. DigitalOcean → **Apps** → **Create App** → conecta el repo (o `doctl apps create --spec .do/app.yaml`).
4. En la configuración de la App, completa las variables marcadas como `SECRET`:
   - `RESEND_API_KEY`, `TOKEN_SECRET` (un valor aleatorio largo), y más adelante `ANTHROPIC_API_KEY`.
   - `EMAIL_FROM` con tu remitente verificado.
5. App Platform conecta sola la base de datos (`DATABASE_URL`) y enlaza las URLs del front y la API entre sí.

---

## 6. Antes del primer usuario real (pendientes que dependen de ti)

- **Revisión legal por un abogado** *(bloqueante)*: términos, privacidad (Ley 19.628) y el texto del consentimiento. La garantía de admisibilidad es un contrato real. Los textos actuales son un borrador de diseño.
- **Formuladores**: agrégalos a la base para que puedan entrar al panel:

  ```sql
  INSERT INTO formulador (nombre, email) VALUES ('Marcela Riquelme', 'marcela@tudominio.cl');
  ```

- **Corpus real de adjudicados**: hoy hay 4 de muestra. Pásame una planilla con los datos reales y la cargo en `corpus_adjudicado` (o se hace con un `INSERT`). El Benchmark depende de esto para el promedio y la penetración máxima.

---

## 7. Hoja de ruta de las siguientes fases

Los cimientos ya están. Lo que sigue, en orden sugerido:

1. **IA real (Redactor + agentes)** — conectar la generación del párrafo formal y el razonamiento de Coherencia a Claude. La estructura ya deja el hueco (`ANTHROPIC_API_KEY`, capa de servicio en el servidor). Los cálculos de QA y Benchmark ya son reales; falta la parte de lenguaje.
2. **Generación de documentos** — PDF y Word del expediente + guión del video, desde el estado real. Guardar en DigitalOcean Spaces.
3. **Ciclo de correos completo** — disparar "en revisión", "devuelto" y "recordatorio de plazo" desde los eventos correspondientes (las plantillas y el registro de idempotencia ya existen).
4. **Sincronización offline real** — hoy el estado offline es UI; convertirlo en cola local que sincroniza al volver.
5. **Endurecer el panel del formulador** — sesión real en vez de la cabecera de correo del piloto.
6. **Observabilidad** — enviar los eventos de `metric_event` a un panel; recordar la regla dura: ningún evento lleva contenido del proyecto.

---

## 8. Mapa del repositorio

```
copiloto-fondos/
  src/                 Frontend (React + Vite) — la app, el panel, el expediente, correos, legal
  db/migrations/       Esquema SQL de PostgreSQL
  server/              API (Node + Fastify + pg + Resend)
    src/routes/        piloto · postulacion · formulador
    src/rules.ts       reutiliza el motor de reglas del front (una sola fuente de verdad)
  .do/app.yaml         Especificación de despliegue en DigitalOcean
  .env.example         Variables del frontend
  server/.env.example  Variables del servidor
```
