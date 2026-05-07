import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../../auth/services/Auth.service';
import { Env } from '../../core/env/env';

@Injectable({ providedIn: 'root' })
export class DepartamentoService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}
  private url: string = Env.url;

  getDepartamentos() {
    const token = this.authService.getToken();
    return this.http.get<any>(this.url + 'departamentos', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  saveDepartamentos(data:any) {
    const token = this.authService.getToken();
    return this.http.post<any>(this.url + 'departamentos',data,  {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
