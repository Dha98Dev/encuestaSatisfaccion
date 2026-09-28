import { ChangeDetectorRef, Component } from '@angular/core';
import { UsuariosService } from '../../services/usuarios.service';
import { PreguntasService } from '../../services/preguntas.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DepartamentoService } from '../../services/departamentos.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Usuario } from '../../interfaces/usuarios.interface';
import { Env } from '../../../../core/env/env';
import { Router } from '@angular/router';
import { Password } from 'primeng/password';
import { departamento } from '../../../../core/interfaces/departamento.interfaces';
import { DinamicTableData } from '../../../../core/components/dhatatable/dhatatable';

@Component({
  selector: 'app-usuarios',
  standalone: false,
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios {
  constructor(
    private usuariosService: UsuariosService,
    private departamentoService: DepartamentoService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private messageService: MessageService,
    private router: Router,
    private confirmationService: ConfirmationService,
  ) {}
  public showNewUser: boolean = false;
  public showNewDepartamento: boolean = false;
  public verPassword = false;
  public verConfirmPassword = false;
  public visibleDetalleUsuario: boolean = false;
  public changePassword: boolean = false;

  public formUsuario: FormGroup = {} as FormGroup;
  public formDepartamento: FormGroup = {} as FormGroup;
  public changePasswordForm: FormGroup = {} as FormGroup;

  public departamentos: departamento[] = [];
  public tableDinamica: DinamicTableData = {} as DinamicTableData;
  public listadoUsuarios: Usuario[] = [];
  public usuarioSeleccionado: Usuario = {} as Usuario;
  public urlFront: string = Env.urlFront;

  ngOnInit() {
    this.formUsuario = this.fb.group({
      departamentos: [null, Validators.required],
      usuario: ['', [Validators.required, Validators.minLength(3)]],
      nombre_completo:['',[Validators.required, Validators.minLength(5)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', Validators.required],
    });
    this.formDepartamento = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
    });
    this.changePasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(3)]],
      password_confirmation: ['', Validators.required],
    });
    this.getUsuarios();
    this.getDepartamentos();
  }

  getDepartamentos() {
    this.departamentoService.getDepartamentos().subscribe({
      next: (resp) => {
        this.departamentos = resp.data;
        this.cd.markForCheck();
      },
    });
  }

  getUsuarios(): void {
    this.usuariosService.getUsuarios().subscribe({
      next: (resp) => {
        const usuarios = resp.data;
        this.listadoUsuarios = resp.data;

        const usuariosAplanados = usuarios.map((item: any) => ({
          id: item.id,
          usuario: item.usuario,
          estado: item.activo ? 'ACTIVO' : 'INACTIVO',
          departamentos: item.departamentos?.length
            ? item.departamentos.map((dep: any) => dep.nombre).join(', ')
            : 'SIN DEPARTAMENTOS',
          boton: '',
        }));

        this.tableDinamica = {
          columns: [
            {
              key: 'usuario',
              label: 'Usuario',
              type: 'text',
              filterable: false,
            },
            {
              key: 'departamentos',
              label: 'Subjefatura(s)',
              type: 'text',
              filterable: false,
              cellClass: (value: string) => {
                if (value === 'SIN DEPARTAMENTOS') {
                  return 'bg-gray-100 text-gray-600 font-semibold';
                }

                return 'bg-blue-50 text-blue-700 font-semibold';
              },
            },
            {
              key: 'estado',
              label: 'Estado',
              type: 'text',
              filterable: false,
              cellClass: (value: string) => {
                if (value === 'ACTIVO') {
                  return 'bg-emerald-100 text-emerald-700 font-semibold';
                }

                return 'bg-red-100 text-red-700 font-semibold';
              },
            },
            {
              key: 'boton',
              label: 'Acciones',
              type: 'text',
            },
          ],
          data: usuariosAplanados,
          globalSearchKeys: ['usuario', 'departamentos', 'estado'],
        };

        this.cd.markForCheck();
      },
      error: (err) => {
      },
    });
  }

  guardarUsuario(): void {
    if (this.formUsuario.invalid) {
      this.formUsuario.markAllAsTouched();
      return;
    }

    const { password, password_confirmation } = this.formUsuario.value;

    if (password !== password_confirmation) {
      this.formUsuario.get('password_confirmation')?.setErrors({ noCoincide: true });
      return;
    }
    let listaDepartamentos: string[] = [];
    listaDepartamentos.push(this.formUsuario.get('departamentos')?.value);
    this.formUsuario.patchValue({ departamentos: listaDepartamentos });
    this.usuariosService.saveUsuario(this.formUsuario.value).subscribe({
      next: (resp) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Usuario creado correctamente',
        });
        this.getUsuarios();
        this.cd.markForCheck();
      },
      error: (err) => {
        this.mostrarErrores(err);
      },
    });
    this.showNewUser = false;
    this.formUsuario.reset();
  }

  guardarDepartamento(): void {
    if (this.formDepartamento.invalid) {
      this.formDepartamento.markAllAsTouched();
      return;
    }
    this.departamentoService.saveDepartamentos(this.formDepartamento.value).subscribe({
      next: (resp) => {
        this.getDepartamentos();
        this.showNewDepartamento = false;
        this.formDepartamento.reset();
        this.cd.markForCheck();
      },
      error: (err) => {
        this.mostrarErrores(err);
      },
    });
  }
  mostrarErrores(error: any): void {
    // Error tipo validación (como el que enviaste)
    if (error?.error?.errors) {
      const errores = error.error.errors;

      Object.keys(errores).forEach((campo) => {
        errores[campo].forEach((mensaje: string) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error de validación',
            detail: mensaje,
            life: 4000,
          });
        });
      });

      return;
    }

    // Error general
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: error?.error?.message || 'Ocurrió un error inesperado',
      life: 4000,
    });
  }

  verDetallesUsuario(event: any) {

    let usuarioSeleccionado = this.listadoUsuarios.filter((user) => {
      return user.id === event.id;
    });
    if (usuarioSeleccionado) {
      this.usuarioSeleccionado = usuarioSeleccionado[0];

      this.visibleDetalleUsuario = true;
    }
  }

  activacionUsuario() {
    this.visibleDetalleUsuario = false;

    const accion = this.usuarioSeleccionado.activo ? 'inactivar' : 'activar';

    this.confirmationService.confirm({
      message: `¿Está seguro de ${accion} el usuario ${this.usuarioSeleccionado.usuario}?`,
      header: 'Zona de riesgo',
      icon: 'pi pi-exclamation-triangle',

      rejectLabel: 'Cancelar',
      acceptLabel: 'Confirmar',

      rejectButtonProps: {
        severity: 'secondary',
        outlined: true,
      },

      acceptButtonProps: {
        severity: 'danger',
      },

      accept: () => {
        let nuevoEstado = this.usuarioSeleccionado.activo ? false : true;
        this.usuariosService
          .actualizacion(this.usuarioSeleccionado.id, { activo: nuevoEstado })
          .subscribe({
            next: (resp) => {
              this.getUsuarios();
            },
            error: (err) => {
            },
          });

        this.messageService.add({
          severity: 'success',
          summary: 'Confirmado',
          detail: `Usuario ${accion} correctamente`,
        });

        // aquí llamas tu servicio
        // this.usuarioService.toggleEstado(...)
      },

      reject: () => {
        this.messageService.add({
          severity: 'contrast',
          summary: 'Cancelado',
          detail: 'Operación cancelada',
        });
      },
    });
  }

  resetearPassword() {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    const { password, password_confirmation } = this.changePasswordForm.value;

    if (password !== password_confirmation) {
      this.changePasswordForm.get('password_confirmation')?.setErrors({ noCoincide: true });
      return;
    }
    this.usuariosService
      .actualizacion(this.usuarioSeleccionado.id, {
        password: this.changePasswordForm.get('password')?.value,
      })
      .subscribe({
        next: (resp) => {
          this.changePasswordForm.reset();
          this.changePassword = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Confirmado',
            detail: `Contraseña actualizada correctamente `,
          });
        },
        error: (err) => {
        },
      });
  }
}
