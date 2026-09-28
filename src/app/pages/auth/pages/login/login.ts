import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/Auth.service';
import { Router } from '@angular/router';
import { DepartamentoService } from '../../../administracion/services/departamentos.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
 constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private messageService: MessageService,
    private router:Router,
    private cd:ChangeDetectorRef
  ) {}
  public login: FormGroup = {} as FormGroup;
  public loading = false;
  verPassword: boolean = false;
  ngOnInit() {
    this.login = this.fb.group({
      usuario: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z0-9@._-]+$/),
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
    });
  }
  iniciarSesion(): void {
    if (this.login.invalid) {
      this.login.markAllAsTouched();
      return;
    }

    const payload = {
      usuario: this.login.get('usuario')?.value?.trim(),
      password: this.login.get('password')?.value,
    };

    this.loading = true;

    this.authService.login(payload).subscribe({
      next: (resp) => {
        this.loading = false;

        this.messageService.add({
          severity: 'success',
          summary: 'Correcto',
          detail: resp.message || 'Inicio de sesión exitoso',
        });
        let id = resp.data.id

       if (!this.authService.isAdmin) {
          this.router.navigate(['/subjefatura/enviar-encuesta']);
       }else{
          this.router.navigate(['/a']);
       }
        
        
        // const roles = this.authService.roles();
        // if (roles.some((r) => r.slug === 'prensa')) {
        //   return this.router.navigate(['/prensa/administrarConvocatorias']);
        // }

        // if (roles.some((r) => r.slug === 'escalafon')) {
        //   return this.router.navigate(['/escalafon/agregar_documento']);
        // }

        // if (roles.some((r) => r.slug === 'administrador')) {
        //   return this.router.navigate(['/admin']);
        // }else{
        //   return this.router.navigate(['/Auth/login']);

        // }
      },
      error: (err) => {
        this.loading = false;

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Credenciales incorrectas',
        });
      },
    });
  }
}
