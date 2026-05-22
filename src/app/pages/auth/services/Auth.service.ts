import { HttpClient } from '@angular/common/http';
import { Injectable, signal, computed, inject } from '@angular/core';
import { tap } from 'rxjs';
import { Env } from '../../../core/env/env';
import { Router } from '@angular/router';
import { departamento } from '../../../core/interfaces/departamento.interfaces';

export interface AuthUser {
  id: string;
  usuario: string;
  activo: boolean;
  is_admin: boolean;
  departamentos: any[];
}

export interface LoginResponse {
  message: string;
  token: string;
  data: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private url: string = Env.url;
  private router = inject(Router);
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  private _token = signal<string | null>(localStorage.getItem(this.tokenKey));

  private _user = signal<AuthUser | null>(
    localStorage.getItem(this.userKey) ? JSON.parse(localStorage.getItem(this.userKey)!) : null,
  );

  token = this._token.asReadonly();
  user = this._user.asReadonly();

  // ✅ ya logueado
  isLoggedIn = computed(() => !!this._token());

  // ✅ nuevo: saber si es admin
  isAdmin = computed(() => this._user()?.is_admin ?? false);

  constructor(private http: HttpClient) {}

  login(data: any) {
    return this.http.post<LoginResponse>(`${this.url}login`, data).pipe(
      tap((response) => {
        this.saveToken(response.token);
        this.saveUser(response.data);
      }),
    );
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this._token.set(token);
  }

  getToken(): string | null {
    return this._token();
  }

  saveUser(user: AuthUser): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this._user.set(user);
  }

  getUser(): AuthUser | null {
    return this._user();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this._token.set(null);
    this._user.set(null);
  }
  // ✅ obtener departamentos (signal reactivo)
  departamentos = computed(() => this._user()?.departamentos ?? []);

  // ✅ obtener departamentos (método clásico)
  getDepartamentos(): departamento[] {
    return this._user()?.departamentos ?? [];
  }

  // ✅ saber si tiene departamentos
  hasDepartamentos(): boolean {
    return (this._user()?.departamentos?.length ?? 0) > 0;
  }

  // ✅ verificar si pertenece a un departamento por id
  tieneDepartamento(id: string): boolean {
    return this._user()?.departamentos?.some((d: any) => d.id === id) ?? false;
  }

  // ✅ verificar por nombre (útil para permisos)
  tieneDepartamentoNombre(nombre: string): boolean {
    return (
      this._user()?.departamentos?.some(
        (d: any) => d.nombre?.toLowerCase() === nombre.toLowerCase(),
      ) ?? false
    );
  }
}
