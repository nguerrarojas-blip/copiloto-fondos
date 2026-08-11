# Revisión de producción — copiloto-fondos.vercel.app

Hecha probando el sitio en vivo y leyendo el código real detrás de cada pantalla (no solo mirando la UI). Cada hallazgo indica el archivo exacto y, cuando aplica, la causa raíz verificada — no una suposición.

## Resumen ejecutivo

El motor de reglas (RUT, presupuesto, matchmaker, 26 campos del formulario) está sólido y es real. Pero **hay una sola causa raíz que explica casi todo lo que se siente "no oficial"**: la llave de Resend no está configurada, así que el enlace de acceso con el token de sesión nunca llega a ningún usuario real — y sin ese token, todo lo que pasa después (guardar avance, redactar con IA) falla en silencio. Encima de eso, la página pública de producción es literalmente la pantalla de revisión de diseño (con selector de "superficies" y menú de estados de prueba), y las descargas del expediente final no existen: son un `alert()` de JavaScript.

---

## P0 — el sitio no funciona de verdad para un usuario real

### 1. El Redactor nunca redacta nada, para nadie (tu punto #3)

**Reproducido en vivo.** Completé identidad con un RUT válido, llegué a la pregunta del Redactor, escribí mi propio texto, hice clic en "Redactar con el agente" — y a los pocos segundos: *"El Redactor no respondió."*

**Causa raíz, verificada en el código:**

- `server/src/routes/piloto.ts:39` — comentario textual: *"El token viaja por correo, no en la respuesta. En dev sin Resend, queda en el log del servidor."*
- `server/src/email.ts:66-69` — sin `RESEND_API_KEY`, el correo con el enlace de acceso **no se envía a ningún lado**: solo se imprime con `console.log` en la consola del droplet, invisible para cualquier usuario real, y aun así la tabla `correo_enviado` lo marca como `sent: true`.
- El frontend, mientras tanto, muestra *"✓ Enlace enviado a tu@correo.cl. Ya puedes empezar."* y te deja seguir — sin que el navegador tenga jamás un token de sesión válido.
- Cada llamada autenticada después de eso (`/api/redactor`, guardar progreso) exige ese token (`server/src/routes/redactor.ts:16`, `preHandler: requirePostulante`) y devuelve 401/500. Confirmé ambos códigos en la consola del navegador durante la prueba.

**Por qué importa:** esto no es un bug menor de una pantalla — es la razón por la que **ningún usuario del piloto ha podido usar el Redactor de verdad todavía**, aunque el backend con Claude sí funcione (`/health` → `llm:true`, según tu `CLAUDE.md`). La IA está lista; nadie llega a usarla.

**Qué se necesita:** una `RESEND_API_KEY` real con dominio verificado (ya está anotado como pendiente en tu propio `CLAUDE.md` y `PRODUCTION.md`). Es lo primero que hay que resolver — desbloquea el resto.

---

### 2. Las descargas del expediente final son un `alert()` — no existe generación de documento

`src/screens/postulante/Entrega.tsx:68`:
```js
onClick={() => alert(`Descarga de ${d.label} (simulada en el prototipo)`)}
```

Los tres botones — PDF, Word, Guión del video — hacen exactamente eso: un popup del navegador que dice "simulada en el prototipo". No hay ninguna librería de generación de documentos en el proyecto (ni PDF ni Word), en ningún lugar del código.

Adicionalmente, la pantalla "Expediente (entregable)" (la que se ve como vista previa del documento final) **no usa el estado real del usuario**: `src/screens/documento/ExpedienteDoc.tsx:12` llama `demoState()` sin condición — siempre muestra el caso de ejemplo fijo (ferias libres), nunca lo que la persona real completó.

**Por qué importa:** es el entregable. Todo el flujo — diagnóstico, piloto, levantamiento, verificación — existe para producir ese archivo. Hoy, literalmente, no se puede producir ninguno.

---

### 3. El Panel del formulador está desconectado del backend real

El backend sí tiene rutas reales para el formulador (`server/src/routes/formulador.ts`): bandeja, tomar expediente, aprobar y entregar, con su propio control de acceso.

Pero `src/screens/formulador/PanelFormulador.tsx` **no llama a esas rutas en absoluto** — no hay un solo `fetch` ni `import` del cliente API. Se alimenta enteramente de `src/data/formulador.ts`, un archivo estático con datos de ejemplo (`INBOX`, `FINDINGS`, `PANEL_BUDGET`, todo hardcodeado).

**Por qué importa:** aunque mañana tengas formuladores reales cargados en la base de datos, hoy no tienen dónde entrar a trabajar — el panel que verían es una maqueta que siempre muestra los mismos 4 expedientes de mentira, nunca los reales.

---

## P0 — por qué "parece que no es oficial" (tu punto #1)

### 4. La URL pública de producción es la pantalla de revisión de diseño, no el producto

`src/App.tsx` es literalmente esto:

```tsx
<strong>Copiloto · demo de desarrollo</strong>
{SURFACES.map(s => <button onClick={() => setSurface(s.key)}>{s.label}</button>)}
```

Con `SURFACES` = App del postulante / Panel del formulador / Expediente (entregable) / Correos / Legal y métricas — **todas en la misma URL pública**, sin ninguna separación, sin autenticación, con la etiqueta "demo de desarrollo" fija en la esquina superior izquierda de cada pantalla que carga alguien que entra a `copiloto-fondos.vercel.app`.

No es una sensación: dice literalmente "demo" porque el código dice literalmente "demo".

### 5. Hay un menú de simulación de fallas visible y usable en producción

`src/screens/postulante/Chrome.tsx:38-39` — el botón "estados ▾" del header abre un panel con 6 interruptores (sin conexión, error al guardar, falla del Redactor, convocatoria cerrada, enlace vencido, falla la descarga), con esta nota textual dentro:

> *"Estados del sistema · para revisión de diseño, no es parte del producto"*

El propio código admite que no debería estar ahí — y sigue estando ahí, público, clickeable por cualquier visitante.

**Qué se necesita para 4 y 5:** separar `App.tsx` en rutas reales. `/` es solo `PostulanteApp`. El panel del formulador va detrás de su propio login, en su propia ruta (`/formulador` o subdominio). "Correos" y "Legal y métricas" no deberían ser navegación pública — son referencias internas de diseño; si se necesitan, van en un entorno de staging separado, no en el dominio de producción. El menú "estados ▾" se elimina del build de producción (puede quedar activo solo en local/`import.meta.env.DEV`).

---

## P1 — tu punto #2, con la causa exacta

### 6. Las sugerencias son un solo proyecto de ejemplo, mostrado a todo el mundo

`src/data/questions.ts` tiene **un solo relato coherente** (una app para ferias libres) repartido en 11 preguntas — internamente es consistente (a diferencia de una versión anterior que revisé), pero es **el mismo para cualquier usuario real**, sin importar cuál sea su proyecto de verdad.

El componente (`src/screens/postulante/blocks/NarrativaBlock.tsx:69`) ya las llama "Sugerencias — o escribe tu propia respuesta" y tiene un botón "Prefiero escribirlo yo" — la intención de diseño ya apunta a lo que pides. El problema es de peso visual y de expectativa: dos botones grandes con el texto completo de un negocio ajeno dominan la pantalla, y la opción de escribir queda como una tercera alternativa más chica debajo.

**Tu instinto es correcto: deberían ser ejemplos, no opciones.** Recomendación concreta:
- Invertir el orden: el campo de texto libre es lo primero que se ve, no lo último.
- Las dos respuestas de ejemplo se muestran como **texto de referencia** (itálica, más chico, quizás bajo un rótulo "Así respondió alguien con un proyecto distinto" en vez de como botones que insertan contenido ajeno tal cual.
- Esto también evita el problema de fondo: aceptar la sugerencia tal cual inserta la historia de otro negocio en el expediente de un usuario real, que es engañoso si no se corrige.

---

## P1 — otros hallazgos de esta revisión

### 7. Autenticación del formulador es un header sin firmar

`server/src/routes/formulador.ts:16`: el "login" es mandar `x-formulador-email` como header — sin contraseña, sin token firmado, sin nada que impida que cualquiera que sepa (o adivine) el correo de un formulador entre a su bandeja. El propio comentario del archivo lo admite: *"endurecer con sesión real antes de abrir a más formuladores."* Bloqueante antes de dar acceso a más de una persona de confianza absoluta.

### 8. El comentario de cierre del formulador es texto fijo, no real

`src/screens/postulante/Entrega.tsx:47-49`: *"Bajé la proyección de ventas del año 2 a 6%... Subí tu aporte propio..."* — aparece igual para cualquier usuario, sin relación con lo que realmente escribió o presupuestó. Es el mismo problema que señalé en la revisión del prototipo anterior: fabrica especificidad que no existe.

### 9. Sin formuladores reales cargados

Confirmado en `PRODUCTION.md` §6 — hoy la tabla `formulador` está vacía o con datos de prueba. Aun resolviendo el punto 3 (conectar el panel), no hay nadie con sesión válida para entrar.

### 10. Revisión legal pendiente, marcada como bloqueante por ustedes mismos

`PRODUCTION.md` §6: *"Revisión legal por un abogado (bloqueante): términos, privacidad (Ley 19.628) y el texto del consentimiento. La garantía de admisibilidad es un contrato real. Los textos actuales son un borrador de diseño."* El sitio ya promete públicamente *"Garantizamos la admisibilidad de tu postulación"* — una afirmación contractual — sin que ese texto haya pasado por revisión legal.

---

## Lo que sí está bien y no hay que tocar

Para que quede balanceado — esto ya es real y funciona:

- Validación de RUT con dígito verificador módulo 11 (lo vi fallar correctamente con un RUT inválido y aceptar uno válido).
- El motor de matchmaking, el tracking de 26 campos del formulario oficial, y el bloque de presupuesto con cofinanciamiento en vivo.
- El backend (Fastify + Postgres + Claude) está desplegado, corriendo, y su `/health` confirma LLM activo — el problema no es que falte construir el backend, es que el frontend nunca completa el handshake de sesión para llegar a usarlo.
- El manejo de fallas está bien pensado en el código (el estado "error" del Redactor preserva el texto del usuario, nunca lo pierde) — el diseño de resiliencia existe, solo que hoy se dispara para todo el mundo por la causa raíz del punto 1.

---

## Orden sugerido

| # | Qué | Por qué en esta posición |
|---|---|---|
| 1 | `RESEND_API_KEY` real en el droplet | Una sola llave desbloquea persistencia real y el Redactor con IA para todo usuario — es la causa raíz de tu punto #3 |
| 2 | Separar `App.tsx` en rutas reales; sacar el menú "estados ▾" de producción | Resuelve tu punto #1 directamente; es un cambio de código, no de infraestructura |
| 3 | Generación real de PDF/Word/guión de video | Sin esto no hay entregable, sin importar qué tan bien funcione el resto |
| 4 | Conectar el Panel del formulador a las rutas reales del backend + cargar formuladores reales | El backend ya existe; falta la conexión del frontend |
| 5 | Rediseñar el bloque de sugerencias del Redactor (tu punto #2) | Mejora real de producto, no bloquea el resto |
| 6 | Endurecer auth del formulador + revisión legal | Bloqueantes antes de abrir a formuladores externos o usuarios reales del piloto |
