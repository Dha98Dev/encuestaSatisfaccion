// websocket.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { Env } from '../env/env';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  constructor(private http:HttpClient){}
  private echo!: Echo<any>;
  private url:string=Env.url

  conectar() {
    (window as any).Pusher = Pusher;

    this.echo = new Echo({
      broadcaster: 'reverb',
      key: 'z1udrxi59twqsv0cw9im',
      wsHost: 'srv36app005.sepen.gob.mx',
      wssPort: 443,
      forceTLS: true,
      enabledTransports: ['ws', 'wss'],
    });
  }

  escucharEstadoPantallas(callback: (evento: any) => void) {
    this.echo.channel('pantallas.estado').listen('.pantalla.estado.actualizado', callback);
  }

  desconectar() {
    if (this.echo) {
      this.echo.leave('pantallas.estado');
      this.echo.disconnect();
    }
  }

private canalPantallaActual: string | null = null;

suscribirPantalla(codigoPantalla: string, callback: (evento: any) => void) {
  if (!this.echo) {
    this.conectar();
  }

  if (this.canalPantallaActual) {
    this.echo.leave(this.canalPantallaActual);
  }

  this.canalPantallaActual = `pantalla.${codigoPantalla}`;


  this.echo
    .channel(this.canalPantallaActual)
    .subscribed(() => {
    })
    .listen('.encuesta.seleccionada', (evento: any) => {
      console.log('Encuesta recibida:', evento.encuesta);
      callback(evento);
    });
}

salirPantalla() {
  if (this.canalPantallaActual) {
    this.echo.leave(this.canalPantallaActual);
    this.canalPantallaActual = null;
  }
}


liberarPantalla(codigoPantalla:string){
  return this.http.get<any>(`${this.url}pantallas/${codigoPantalla}/liberar`)
}
}
