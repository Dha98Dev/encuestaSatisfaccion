export interface Tramite {
  id: string; // viene encriptado
  tramite: string;
  departamento_id: string; // encriptado
  activo: boolean;
  seleccionado?:boolean
}

export interface TramitesResponse {
  success: boolean;
  data: Tramite[];
}

export interface tramitesDepartamento{
  descripcion:string,
  idDepartamento:string,
  tramites:Tramite[]
}