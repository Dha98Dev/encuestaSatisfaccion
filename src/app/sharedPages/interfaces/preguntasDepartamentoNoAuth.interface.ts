// interfaces/preguntas-por-departamento.interface.ts

export interface PreguntasPorDepartamentoNoAuthResponse {
    message: string;
    data: PreguntasPorDepartamentoData[];
}

export interface PreguntasPorDepartamentoData{
activo:boolean,
departamento:departamento,
pregunta:pregunta,
pregunta_departamento_id:string
}
export interface departamento{
    id:string,
    nombre:string
}
export interface pregunta{
    descripcion:string,
    id:string
}