import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Env } from '../../core/env/env';
import { EstadisticasDepartamentoResponse, EstadisticasGeneralResponse } from '../interfaces/estadistica.interface';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/services/Auth.service';

@Injectable({ providedIn: 'root' })
export class EstadisticaService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}
  private url: string = Env.url;
  obtenerEstadisticas(departamentoId: string): Observable<EstadisticasDepartamentoResponse> {
    const token = this.authService.getToken();
    return this.http.get<EstadisticasDepartamentoResponse>(
      `${this.url}estadisticas/departamento/${departamentoId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  }
  obtenerEstadisticasGeneral(): Observable<EstadisticasGeneralResponse> {
    const token = this.authService.getToken();
    return this.http.get<EstadisticasGeneralResponse>(
      `${this.url}estadisticas/general`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  }
}
