// modelo-pantalla.interface.ts

export interface Pantalla {
  id: string;
  nombre: string;
  codigo: string;
  disponible: boolean;
  ultima_conexion: string | null;
  direccion: Direccion;
}

export interface Direccion {
  id: string;
  nombre: string;
}