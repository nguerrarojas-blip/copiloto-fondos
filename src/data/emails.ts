/** Los cinco correos transaccionales, con copy completo y criterio.
 * Portado literalmente desde `Correos - Plantillas.dc.html` (EMAILS).
 * Texto plano, remitente con nombre de persona, nunca "no-reply".
 */
export interface Email {
  tag: string; tagBg: string; name: string; trigger: string;
  from: string; subject: string; body: string; cta: string; footer: string; rationale: string;
}

export const EMAILS: Email[] = [
  { tag:'01', tagBg:'#45566B', name:'Enlace de acceso',
    trigger:'Se dispara cuando el postulante deja su correo en la pantalla del piloto, antes de entrar al levantamiento.',
    from:'Marcela de Copiloto <marcela@copiloto.cl>',
    subject:'Tu enlace para retomar la postulación cuando quieras',
    body:'Hola:\n\nGuardamos tu avance con este enlace. Puedes cerrar la pestaña, apagar el computador o seguir mañana desde el teléfono — vuelves acá y sigue todo donde lo dejaste.\n\nNo hay contraseña que recordar. El enlace es personal: no lo compartas, porque lleva los datos de tu empresa.',
    cta:'Retomar mi postulación',
    footer:'El enlace vence en 30 días. Si vence, entras igual y te mandamos uno nuevo al toque.\nTus datos se usan solo para elaborar esta postulación.',
    rationale:'Es el correo que sostiene la decisión de no pedir cuenta. Tiene que dejar clarísimo que el avance no se pierde, y por qué el enlace no se comparte.' },

  { tag:'02', tagBg:'#1F6F63', name:'Expediente en revisión',
    trigger:'Se dispara cuando el postulante envía el expediente a revisión del formulador.',
    from:'Marcela de Copiloto <marcela@copiloto.cl>',
    subject:'Recibimos tu expediente — lo estoy revisando',
    body:'Hola:\n\nYa tengo tu expediente de Semilla Inicia. Lo reviso yo, no un robot: los agentes hicieron el trabajo pesado y yo pongo el criterio de qué le va a convencer al evaluador y qué no.\n\nTe escribo apenas termine. Si necesito que me aclares algo, te lo pregunto por acá — no tienes que estar pendiente.',
    cta:'Ver mi expediente',
    footer:'Garantizamos la admisibilidad de tu postulación, no la adjudicación del fondo.',
    rationale:'El silencio durante la revisión es donde se pierde la confianza. Este correo compra ese tiempo y refuerza que hay una persona real detrás.' },

  { tag:'03', tagBg:'#B8863B', name:'Devuelto con comentarios',
    trigger:'Se dispara cuando el formulador devuelve el expediente en vez de aprobarlo.',
    from:'Marcela de Copiloto <marcela@copiloto.cl>',
    subject:'Dos cosas que hay que corregir antes de entregarte el expediente',
    body:'Hola:\n\nTerminé de revisar. Está bien encaminado, pero hay dos puntos que un evaluador te va a castigar y prefiero que los arreglemos ahora:\n\n1. El presupuesto pide 12 tablets y la narrativa no explica para qué. Cuéntame en una línea por qué el piloto las necesita.\n\n2. La sección de competencia está muy general. Necesito al menos un competidor con nombre y su debilidad concreta.\n\nNo tienes que rehacer nada: entras al enlace y solo tocas esos dos puntos.',
    cta:'Resolver los comentarios',
    footer:'Tienes 12 días hasta el cierre de la convocatoria. Con responder estos dos puntos alcanza de sobra.',
    rationale:'Devolver trabajo se siente como un reproche. Por eso: número acotado de puntos, en lenguaje llano, con el motivo, y dejando claro que no se vuelve a empezar.' },

  { tag:'04', tagBg:'#1F6F63', name:'Expediente listo',
    trigger:'Se dispara cuando el formulador aprueba y entrega.',
    from:'Marcela de Copiloto <marcela@copiloto.cl>',
    subject:'Tu expediente está listo para descargar',
    body:'Hola:\n\nAprobado. Te dejo el expediente en PDF y en Word, más el guión del video de 40 segundos.\n\nDos cosas que ajusté y conviene que sepas: bajé la proyección de ventas del año 2 a un rango que los proyectos adjudicados de este fondo sí sostuvieron, y reordené el presupuesto para cumplir el tope de gastos de administración.\n\nTe falta grabar el video y adjuntar tres documentos que solo tú tienes. Están listados en el expediente.',
    cta:'Descargar mi expediente',
    footer:'El envío en la plataforma de CORFO lo haces tú. Garantizamos la admisibilidad, no la adjudicación.',
    rationale:'El correo de entrega tiene que decir qué se cambió y por qué — es donde el postulante entiende qué compró. Y tiene que recordar lo que falta de su lado.' },

  { tag:'05', tagBg:'#9C4A3C', name:'Recordatorio de plazo',
    trigger:'Un solo envío, a 5 días del cierre, y solo si el expediente sigue incompleto.',
    from:'Marcela de Copiloto <marcela@copiloto.cl>',
    subject:'Quedan 5 días para Semilla Inicia y te falta poco',
    body:'Hola:\n\nSemilla Inicia cierra el viernes 21. Tu expediente está al 68%: te faltan el presupuesto y los datos del equipo.\n\nSon unos 20 minutos. Si no alcanzas o cambiaste de idea, no pasa nada — tu avance queda guardado para la próxima convocatoria.',
    cta:'Seguir donde quedé',
    footer:'Este es el único recordatorio que te enviamos por esta postulación.',
    rationale:'Un recordatorio, con el dato concreto de qué falta y cuánto demora, y una salida sin culpa. La promesa de "único recordatorio" es lo que hace que este se abra.' },
];
