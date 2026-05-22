import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Env } from '../../../core/env/env';
import { TramitesResponse } from '../interfaces/tramites.interface';
import { AuthService } from '../../auth/services/Auth.service';

@Injectable({ providedIn: 'root' })
export class TramiteService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}
  private url: string = Env.url;

  getTiposTramitesByDepartamento(idDepartamento: string) {
    return this.http.get<TramitesResponse>(this.url + `tramites/departamento/${idDepartamento}`);
  }

  guardarTramite(data: any) {
    const token = this.authService.getToken();
    return this.http.post<TramitesResponse>(this.url + `tramites`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
