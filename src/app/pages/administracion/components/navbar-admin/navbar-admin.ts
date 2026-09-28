import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/Auth.service';

@Component({
    selector: 'app-navbar-admin',
    standalone: false,
    templateUrl: './navbar-admin.html',
    styleUrl: './navbar-admin.scss',
})
export class NavbarAdmin {

    constructor(
        private cd: ChangeDetectorRef,
        public AuthService: AuthService,
        private router: Router,
    ) {}

    irUsuarios(): void {
        this.router.navigate(['/a/usuarios']);
    }

    irEstadistica(): void {
        this.router.navigate(['/a/estadistica']);
    }

    irTramites(): void {
        this.router.navigate(['/a/tramites']);
    }

    irConfiguracion(): void {
        this.router.navigate(['/a/configuracion']);
    }

    irEncuesta(): void {

        const departamentos = this.AuthService.getDepartamentos();

        if (!departamentos?.length) {
            return;
        }

        this.router.navigate([
            '/encuesta',
            departamentos[0].id
        ]);
    }

    cerrarSesion(): void {

        this.AuthService.logout();

        this.cd.markForCheck();

        setTimeout(() => {
            this.router.navigate(['/']);
        }, 1000);

    }

}