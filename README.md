# Copiloto de Postulación a Fondos Públicos

Implementación en **React + TypeScript (Vite)** del producto diseñado en las referencias `.dc.html`: copiloto para postular a fondos públicos chilenos (CORFO · Sercotec), con la app del postulante, el panel del formulador, el expediente entregable, los correos transaccionales y el anexo legal.

Recreación fiel del handoff de diseño: reglas de negocio y copy respetados literalmente; migración de estilos inline a design tokens.

## Cómo correr

```bash
npm install
npm run dev        # servidor de desarrollo (Vite)
npm run build      # typecheck + build de producción
npm run test       # tests del motor de reglas y del flujo (Vitest)
npm run typecheck  # solo comprobación de tipos
```

Al abrir, la barra superior permite alternar entre las cinco superficies del producto (en producción serían rutas). Para ver el producto entero en dos minutos: **App del postulante → «Recorrer con el caso de ejemplo»**, y luego el menú **«estados»** del header para los estados de sistema (offline, error de guardado, convocatoria cerrada, etc.).

## Arquitectura

Decisión central del producto: **los números no se levantan conversando**. El levantamiento tiene dos modos que conviven en el mismo panel:

- **Modo narrativo — Agente Redactor** (`NarrativaBlock`): chat con respuesta libre siempre disponible + quick-replies como sugerencia; el párrafo formal se aprueba antes de entrar al expediente.
- **Modo cuantitativo — Agente Intake** (`Identidad`, `Presupuesto`, `Datos`): formularios con validación en vivo, sumas automáticas y reglas del instrumento aplicadas.

```
src/
  domain/            Motor de reglas puro (sin React), con tests
    rut.ts             Validación RUT módulo 11
    budget.ts          Presupuesto + alertas del Agente QA
    penetration.ts     Penetración de mercado vs. corpus
    expediente.ts      Hallazgos de los 3 agentes + ESTADO (dos valores)
    matchmaker.ts      Búsqueda difusa del catálogo (Levenshtein)
    format.ts          fmt / num / formalize
    metrics.ts         Instrumentación (sin contenido del proyecto)
    __tests__/         Tests unitarios del dominio
  data/              Reglas y contenido portados de las referencias
    funds.ts           Instrumentos: topes, cofinanciamiento, secciones
    questions.ts       Preguntas narrativas del Redactor
    corpus.ts          Adjudicados de referencia (promedios, penetración máx.)
    catalogo.ts        Catálogo de fondos (piloto y fuera del piloto)
    demo.ts            Caso de ejemplo (Feria Digital SpA)
    emails.ts          5 correos transaccionales
    formulador.ts      Bandeja, secciones y hallazgos del panel
  state/             Estado de la app del postulante
    types.ts, initialState.ts, reducer.ts, AppContext.tsx, selectors.ts
    __tests__/flow.test.ts   Recorrido del flujo por el reducer
  screens/
    postulante/        Landing/Matchmaker, Piloto, Levantamiento, Entrega, estados
    formulador/        Panel: bandeja, expediente en revisión, aprobar
    documento/         Maqueta del expediente entregable (PDF/Word)
    correos/           Los 5 correos
    legal/             Términos, privacidad, consentimiento y métricas
  ui/primitives.tsx  Componentes base con los design tokens
  styles/tokens.css  Design tokens (colores, tipografía, forma, sombras)
```

## Reglas de negocio implementadas (literal)

- **Instrumentos.** Semilla Inicia (CORFO): tope $15M / $17M si lidera una mujer, cofinanciamiento ≥20%, administración ≤15%. Fondo Crece (Sercotec): tope $9M, cofinanciamiento ≥30%, administración ≤10%. Con sus categorías de gasto y secciones.
- **RUT.** Validación módulo 11, dígito verificador 0-9 o K, normalizando puntos y guión.
- **Penetración de mercado.** proyección año 2 / mercado direccionable. Si supera el máximo del corpus (7%), el Benchmark lo marca. **Nunca se sugiere una cifra.**
- **Estado del expediente.** Dos valores, nunca un puntaje. Hay hallazgo duro si el RUT es inválido, el monto supera el tope, el cofinanciamiento baja del mínimo, administración supera su tope, la penetración supera el máximo del corpus, o quedaron secciones sin redactar por el agente. Cualquiera → *Requiere atención*; ninguno → *Listo para revisión*. Ambos pasan igual por un formulador.
- **Las alertas del QA advierten, nunca bloquean.**
- **Falla del Redactor.** La respuesta del usuario nunca se pierde: reintentar, usar una sugerencia, o guardar el texto crudo (que queda marcado como hallazgo de Coherencia).
- **Corpus de adjudicados.** Anónimo de cara al usuario, siempre.
- **Métricas.** Ningún evento lleva contenido del proyecto — solo identificadores, marcas de tiempo, longitudes y categorías.

## Qué queda simulado (producción debe implementar de verdad)

Igual que el prototipo original: generación con LLM del párrafo formal (hoy plantilla), orquestación real de agentes (hoy temporizador), generación de PDF/Word y del guión del video, persistencia en servidor + enlace de acceso + envío real de correos (hoy `localStorage`), corpus real de adjudicados, sincronización offline real, y **textos legales revisados por abogado antes del primer usuario** — la garantía de admisibilidad es una obligación contractual real.

## Estado de persistencia

Hoy el estado del postulante vive en `localStorage`. En producción vive en el servidor, colgado de una **postulación** que a su vez cuelga de un **perfil de empresa** persistente (requerimientos §5.2.2).
