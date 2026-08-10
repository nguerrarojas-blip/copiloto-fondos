/**
 * Caso de ejemplo precargado ("Recorrer con el caso de ejemplo").
 * Portado desde `Copiloto Final.dc.html` (DEMO).
 */
export const DEMO = {
  fondoId:'semilla-inicia', mujeres:true,
  identidad:{ razonSocial:'Feria Digital SpA', rut:'77.451.203-9', direccion:'Av. Irarrázaval 3421, of. 12', comuna:'Ñuñoa', telefono:'+56 9 8432 1190', repLegal:'Camila Andrade Fuentes' },
  answers:{ q1:0, q2:0, q3:0, q4:0, q5:0, q6:0, q7:0, q8:0, q9:0, q10:0, q11:0 },
  budget:[
    { categoria:'Recursos humanos', detalle:'Desarrollo del módulo de pagos (4 meses)', monto:'5400000', aporte:'1800000' },
    { categoria:'Servicios de terceros', detalle:'Integración con proveedor de transferencias', monto:'2100000', aporte:'300000' },
    { categoria:'Equipamiento', detalle:'12 tablets para puestos piloto', monto:'2400000', aporte:'700000' },
    { categoria:'Difusión y marketing', detalle:'Campaña en 4 ferias y material impreso', monto:'2600000', aporte:'800000' },
    { categoria:'Gastos de administración', detalle:'Contabilidad y arriendo de oficina', monto:'1400000', aporte:'400000' },
  ],
  stats:{ ventasAnterior:'8400000', empleados:'3', exportaciones:'0', capitalPrevio:'2000000', mercado:'420000000', proyeccion:'25200000' },
  team:[
    { nombre:'Camila Andrade', rol:'Dirección y comercial', dedicacion:'100' },
    { nombre:'Rodrigo Peña', rol:'Desarrollo de producto', dedicacion:'80' },
    { nombre:'Fernanda Lillo', rol:'Terreno y capacitación', dedicacion:'50' },
  ],
}

/** Comentarios base que usa el estado "devuelto con comentarios". */
export const COMENTARIOS_BASE = [
  { id:'c1', seccion:'05 · presupuesto', block:'presupuesto',
    texto:'El ítem de equipamiento no está justificado en la narrativa: hablas de una app, pero pides 12 tablets. Explica por qué el piloto las necesita o el evaluador va a leerlo como gasto suntuario.' },
  { id:'c2', seccion:'04 · competencia', block:'narrativa',
    texto:'Falta nombrar al menos un competidor formal con nombre y su debilidad concreta. Como está, se lee genérico y es la sección donde más se pierde puntaje.' },
]
