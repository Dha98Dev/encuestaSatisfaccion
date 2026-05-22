import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Env } from '../../../core/env/env';
import { AuthService } from '../../auth/services/Auth.service';
import { PreguntasPorDepartamentoNoAuthResponse } from '../../sharedPages/interfaces/preguntasDepartamentoNoAuth.interface';
import { PreguntaDepartamentoResponse } from '../../../core/interfaces/departamento.interfaces';

@Injectable({ providedIn: 'root' })
export class PreguntasService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}
  private url: string = Env.url;

  getCatalogoPreguntas() {
    const token = this.authService.getToken();

    return this.http.get<any>(this.url + 'preguntas', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  getCatalogoPreguntasDepartamento() {
    const token = this.authService.getToken();

    return this.http.get<PreguntaDepartamentoResponse>(this.url + 'preguntas-departamento', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  savePregunta(data: any) {
    const token = this.authService.getToken();

    return this.http.post<any>(this.url + 'preguntas', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  getCatalogoRespuestas() {
    const token = this.authService.getToken();

    return this.http.get<any>(this.url + 'respuestas', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  asignarPreguntaDepartamento(data: any) {
    const token = this.authService.getToken();

    return this.http.post<any>(this.url + 'preguntas-departamento', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  responderEncuesta(data: any) {
    const token = this.authService.getToken();

    return this.http.post<any>(this.url + 'responder', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  getRespuestas(idDepartamento: string) {
    const token = this.authService.getToken();

    return this.http.get<any>(this.url + `preguntas-departamento/${idDepartamento}/resultados`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  getPreguntasDepartamentoNoAuth(idDepartamento: string) {
    const token = this.authService.getToken();

    return this.http.get<PreguntasPorDepartamentoNoAuthResponse>(this.url + `preguntas-departamento/${idDepartamento}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
