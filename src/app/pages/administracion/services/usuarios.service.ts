import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Env } from '../../../core/env/env';
import { AuthService } from '../../auth/services/Auth.service';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}
  private url: string = Env.url;

  getUsuarios() {
    const token = this.authService.getToken();
    return this.http.get<any>(this.url + 'usuarios', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  saveUsuario(data: any) {
    const token = this.authService.getToken();

    return this.http.post<any>(this.url + `usuarios`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  actualizacion(idUsuario:string,data: any) {
    const token = this.authService.getToken();

    return this.http.patch<any>(this.url + `usuarios/${idUsuario}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
