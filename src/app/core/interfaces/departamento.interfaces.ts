export interface departamento {
  id:string
  nombre: string;
  activo: true;
  direccion:direccion
}
export interface direccion {
  id:string
  nombre: string;
  activo: true;
}
// interfaces/pregunta-departamento.interface.ts

export interface PreguntaDepartamentoResponse {
    message: string;
    data: PreguntaDepartamento[];
}

export interface PreguntaDepartamento {
    pregunta_departamento_id: string;
    pregunta: Pregunta;
    departamento: Departamento;
    activo: boolean;
}

export interface Pregunta {
    id: string;
    descripcion: string;
}

export interface Departamento {
    id: string;
    nombre: string;
}

export interface respuesta {
    id: string;
    descripcion: string;
    orden: number;
    mensaje: string;
    activo: boolean;
}