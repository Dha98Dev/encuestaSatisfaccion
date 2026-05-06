export interface Tramite {
  id: string; // viene encriptado
  tramite: string;
  departamento_id: string; // encriptado
  activo: boolean;
}

export interface TramitesResponse {
  success: boolean;
  data: Tramite[];
}