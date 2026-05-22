export interface Usuario {
  id: string; // encriptado
  usuario: string;
  activo: boolean;
  departamentos: Departamento[];
}

export interface Departamento {
  id: string; // encriptado
  nombre: string;
  activo: boolean;
}