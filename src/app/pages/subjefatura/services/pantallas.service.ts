import { inject, Injectable } from '@angular/core';
import { Env } from '../../../core/env/env';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/services/Auth.service';

@Injectable({ providedIn: 'root' })
export class PantallasService {
  constructor(private http: HttpClient) {}
  private url: string = Env.url;
  private authService = inject(AuthService);

  getPantallas() {
    const token = this.authService.getToken();
    return this.http.get<any>(this.url + `pantallas`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  getInfoPantalla(codigoPantalla:string) {
    const token = this.authService.getToken();
    return this.http.get<any>(this.url + `pantallas/${codigoPantalla}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  enviarEncuestaAPantalla(data: any) {
    const token = this.authService.getToken();
    return this.http.post<any>(this.url + `pantallas/${data.codigo_pantalla}/enviar`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
