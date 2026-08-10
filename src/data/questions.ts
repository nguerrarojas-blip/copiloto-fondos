/**
 * Preguntas narrativas del Agente Redactor, con sus opciones (versión corta que
 * ve el usuario y versión formal que entra al expediente) y notas de Benchmark.
 * Portado literalmente desde `Copiloto Final.dc.html` (QUESTIONS).
 */
export interface QuestionOption { short: string; formal: string; }
export interface Question { field: string; question: string; hint: string; benchmark: string; options: QuestionOption[]; }

export const QUESTIONS: Record<string, Question> = {
  q1:{ field:'Resumen del proyecto', question:'Cuéntanos en simple: ¿qué hace tu proyecto?',
    hint:'Una o dos frases. Después lo pasamos a lenguaje de formulario.',
    benchmark:'Los expedientes adjudicados abren describiendo qué hace el producto, no la visión de la empresa.',
    options:[
      { short:'Una app donde los caseros de las ferias libres venden y cobran online, sin comisiones de marketplace.',
        formal:'El proyecto consiste en una plataforma digital que permite a comerciantes de ferias libres ofrecer sus productos y gestionar cobros en línea, sin la estructura de comisiones de los marketplaces tradicionales.' },
      { short:'Un canal de venta digital para ferias libres, con pago directo entre casero y comprador.',
        formal:'El proyecto habilita un canal de venta digital para comerciantes de ferias libres, incorporando un mecanismo de pago directo entre comprador y vendedor que reduce el costo de transacción.' } ] },
  q2:{ field:'Beneficiarios', question:'¿Quién usa esto y quién se beneficia?',
    hint:'El formulario distingue usuario y beneficiario: pueden no ser el mismo.',
    benchmark:'Los adjudicados delimitan territorio y número de beneficiarios desde la primera sección; eso les permite sostener sus cifras después.',
    options:[
      { short:'Los caseros de ferias libres de la Región Metropolitana, y de rebote los vecinos que compran.',
        formal:'Los usuarios directos son comerciantes de ferias libres de la Región Metropolitana. Los beneficiarios indirectos son los consumidores del entorno de cada feria, que acceden a los mismos productos con opción de compra remota y retiro programado.' },
      { short:'Caseros con puesto establecido, que ya venden por WhatsApp pero sin forma de cobrar.',
        formal:'El proyecto se dirige a comerciantes con puesto establecido en ferias libres que ya realizan ventas informales por aplicaciones de mensajería, pero carecen de un medio de pago digital y de gestión de pedidos.' } ] },
  q3:{ field:'Problema u oportunidad', question:'¿Qué problema resuelve?',
    hint:'Concreto: qué pierde hoy tu cliente por no tener esto.', benchmark:'',
    options:[
      { short:'El casero pierde ventas porque solo puede vender a quien pasa por el puesto ese día.',
        formal:'El comerciante de feria libre tiene su venta limitada al flujo presencial de la jornada. No dispone de un canal que le permita capturar demanda fuera del horario y del radio físico de la feria, lo que deja una fracción relevante de su capacidad de venta sin utilizar.' },
      { short:'Los marketplaces existentes cobran comisiones que se comen el margen de un producto fresco.',
        formal:'Las plataformas de comercio electrónico disponibles aplican comisiones incompatibles con el margen de productos frescos de bajo precio unitario, lo que excluye de facto al comercio de ferias libres del canal digital.' } ] },
  q4:{ field:'Relevancia para el cliente', question:'¿Por qué le importa a tu cliente resolverlo?',
    hint:'El evaluador busca evidencia de que el problema duele de verdad.', benchmark:'',
    options:[
      { short:'Porque una merma menor y ventas fuera de horario le cambian el mes.',
        formal:'Para el comerciante la relevancia es directamente económica: reducir la merma de producto no vendido y capturar pedidos fuera del horario de feria incide sobre su ingreso mensual, en un rubro donde el margen unitario es bajo y el producto es perecible.' },
      { short:'Porque ya perdió clientes que se pasaron al delivery de supermercado.',
        formal:'El comerciante enfrenta una migración sostenida de clientes hacia canales de delivery de cadenas de retail. La relevancia del proyecto radica en devolverle competitividad frente a un canal que hoy no puede igualar.' } ] },
  q5:{ field:'Descripción del producto', question:'Descríbenos el producto: ¿qué hace, exactamente?',
    hint:'Funcionalidades concretas, no promesas.', benchmark:'',
    options:[
      { short:'App donde el casero sube productos con foto y precio, recibe pedidos y cobra por transferencia directa.',
        formal:'El producto es una aplicación móvil en la que el comerciante publica su oferta diaria con fotografía y precio, recibe pedidos con hora de retiro, y percibe el pago mediante transferencia directa a su cuenta, sin intermediación de fondos por parte de la plataforma.' },
      { short:'Además tiene un panel simple con lo vendido del día y lo que queda por retirar.',
        formal:'El producto incorpora un panel de gestión diaria que consolida ventas cursadas, pedidos pendientes de retiro y stock declarado, diseñado para operarse desde el teléfono en condiciones de uso en terreno.' } ] },
  q6:{ field:'Atributos diferenciadores', question:'¿Qué tres cosas tiene tu producto que la competencia no?',
    hint:'El formulario pide exactamente tres. Si tienes dos buenos, mejor dos buenos que tres inflados.',
    benchmark:'Los adjudicados declaran tres atributos y dedican una línea a cómo verificar cada uno. Los atributos sin verificación posible son los que el evaluador descuenta.',
    options:[
      { short:'Cobro directo sin comisión, catálogo que se arma en 5 minutos desde el celular, y retiro en el mismo puesto.',
        formal:'El proyecto presenta tres atributos diferenciadores: (i) un mecanismo de cobro directo entre comprador y vendedor que elimina la comisión por transacción; (ii) un flujo de publicación de catálogo diseñado para completarse en menos de cinco minutos desde un teléfono; y (iii) un modelo de entrega por retiro en el mismo puesto, que no requiere logística de última milla.' },
      { short:'No cobramos comisión, funciona sin internet estable, y no necesita que el casero sepa de tecnología.',
        formal:'Los atributos diferenciadores son: (i) ausencia de comisión por transacción; (ii) operación tolerante a conectividad intermitente, con sincronización diferida; y (iii) una interfaz diseñada para usuarios sin experiencia previa en herramientas digitales de gestión.' } ] },
  q7:{ field:'Componente innovador', question:'¿Dónde está exactamente la innovación?',
    hint:'En el producto, el proceso, el modelo de negocio o el canal. Elige una y defiéndela.', benchmark:'',
    options:[
      { short:'En el modelo: nadie ha logrado un canal digital rentable para productos de bajo precio unitario.',
        formal:'La innovación se sitúa en el modelo de negocio: la eliminación de la comisión por transacción, sustituida por un cargo fijo de suscripción de bajo monto, hace económicamente viable el comercio digital de productos frescos de bajo precio unitario, segmento hoy desatendido por las plataformas existentes.' },
      { short:'En el proceso: digitalizar el puesto sin cambiar cómo trabaja el casero.',
        formal:'La innovación se sitúa en el proceso: la solución digitaliza la operación comercial del puesto sin alterar la rutina de trabajo del comerciante, mediante un flujo de carga de oferta que se integra a la preparación diaria en lugar de sumarse a ella.' } ] },
  q8:{ field:'Estado de desarrollo y propiedad intelectual', question:'¿En qué estado está hoy y tienes algo protegido?',
    hint:'Sé honesto: sobrevender el estado de desarrollo es la contradicción que más detectan los evaluadores.',
    benchmark:'Ninguno de los adjudicados de referencia declaró patentes. Declarar marca en trámite es suficiente y verificable.',
    options:[
      { short:'Prototipo funcionando con 12 caseros probando en una feria de Ñuñoa. No tenemos nada registrado.',
        formal:'El proyecto se encuentra en etapa de prototipo funcional, validado en operación con doce comerciantes en una feria de la comuna de Ñuñoa. No existen a la fecha registros de propiedad industrial; se evalúa el registro de marca durante la ejecución del proyecto.' },
      { short:'App en pruebas cerradas y la marca en trámite en INAPI.',
        formal:'El desarrollo se encuentra en fase de pruebas cerradas con usuarios reales. La marca se encuentra en trámite de registro ante INAPI, y no se contemplan solicitudes de patente dado que la innovación es de modelo de negocio y no de invención técnica.' } ] },
  q9:{ field:'Competencia y sus debilidades', question:'¿Quién resuelve esto hoy y por qué no lo resuelve bien?',
    hint:'Decir "no tenemos competencia" es la respuesta que más castiga un evaluador.',
    benchmark:'En los expedientes adjudicados esta sección nombra tres o cuatro competidores concretos, con una debilidad específica cada uno.',
    options:[
      { short:'Los marketplaces grandes y el WhatsApp del casero. Los primeros cobran caro; el segundo no cobra, pero tampoco cobra.',
        formal:'La competencia se compone de plataformas de comercio electrónico generalistas y de la venta informal por aplicaciones de mensajería. Las primeras aplican comisiones incompatibles con el margen del rubro y exigen logística que el comerciante no posee; la segunda no dispone de medio de pago integrado ni registro de la operación, lo que impide formalizar la venta.' },
      { short:'Apps de delivery de supermercado: rápidas, pero no venden producto de feria ni le sirven al casero.',
        formal:'Los sustitutos relevantes son las aplicaciones de delivery de cadenas de retail, que compiten por la misma ocasión de compra. Su debilidad frente al proyecto es doble: no comercializan producto de feria y no constituyen un canal disponible para el comerciante, sino un competidor directo de su venta.' } ] },
  q10:{ field:'Modelo de ingresos', question:'¿Cómo gana plata el proyecto?',
    hint:'Esta respuesta tiene que ser consistente con el presupuesto que armes después.', benchmark:'',
    options:[
      { short:'Suscripción mensual baja por puesto, sin comisión por venta.',
        formal:'El modelo de ingresos se basa en una suscripción mensual de monto reducido por puesto activo, sin cargo por transacción. Esta estructura mantiene el costo marginal de la venta en cero para el comerciante, condición necesaria para la adopción en un rubro de márgenes estrechos.' },
      { short:'Suscripción por puesto más un plan por feria completa, negociado con la asociación de feriantes.',
        formal:'El modelo de ingresos combina una suscripción individual por puesto con un plan agregado por feria, contratado por la asociación de comerciantes, lo que reduce el costo de adquisición por usuario y acelera la densidad de oferta en cada feria incorporada.' } ] },
  q11:{ field:'Estrategia de crecimiento', question:'¿Cómo crece esto de una feria a muchas?',
    hint:'El evaluador quiere ver un mecanismo repetible, no una aspiración.',
    benchmark:'Los adjudicados describen una unidad de expansión concreta (una feria, un predio, un taller) y su costo de replicación.',
    options:[
      { short:'Feria por feria: entramos con la asociación, capacitamos en terreno y usamos al casero satisfecho como referencia.',
        formal:'La estrategia de crecimiento es de expansión unidad por unidad: el ingreso a cada nueva feria se realiza mediante acuerdo con su asociación de comerciantes, seguido de capacitación presencial en terreno. La referencia de comerciantes ya adoptantes opera como principal mecanismo de conversión, lo que reduce progresivamente el costo de adquisición por feria incorporada.' },
      { short:'Primero saturamos la Región Metropolitana, después regiones con el mismo modelo.',
        formal:'La estrategia contempla alcanzar densidad de adopción en las ferias de la Región Metropolitana antes de la expansión a regiones, replicando el mismo modelo de ingreso por asociación. La secuencia prioriza profundidad sobre cobertura, dado que el valor para el consumidor depende de la cantidad de puestos disponibles en cada feria.' } ] },
  c1:{ field:'Mejora productiva a financiar', question:'¿Qué parte de tu operación quieres mejorar con este fondo?',
    hint:'Fondo Crece financia mejoras concretas de un negocio que ya vende, no ideas nuevas.',
    benchmark:'Los adjudicados de este instrumento nombran una restricción operativa medible y cómo la inversión la levanta.',
    options:[
      { short:'Queremos ampliar la capacidad de atención: hoy no damos abasto en los días de mayor venta.',
        formal:'La mejora productiva consiste en ampliar la capacidad operativa del negocio en los períodos de mayor demanda, actualmente limitada por infraestructura y dotación, lo que se traduce en ventas no concretadas de manera recurrente.' },
      { short:'Queremos profesionalizar la venta: hoy dependemos del boca a boca y de un solo canal.',
        formal:'La mejora productiva se orienta a diversificar y profesionalizar los canales comerciales del negocio, hoy concentrados en un único canal y en la recomendación informal, lo que limita el crecimiento sostenido de las ventas.' } ] },
}
