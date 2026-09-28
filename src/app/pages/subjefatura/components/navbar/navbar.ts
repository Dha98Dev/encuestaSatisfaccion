import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/Auth.service';

@Component({
    selector: 'app-navbar',
    standalone: false,
    templateUrl: './navbar.html',
    styleUrl: './navbar.scss',
})
export class Navbar {

    public visibleMenu: boolean = false;

    constructor(
        private cd: ChangeDetectorRef,
        public AuthService: AuthService,
        private router: Router,
    ) {}

    enviarEncuesta(): void {
        this.visibleMenu = false;
        this.router.navigate(['/subjefatura/enviar-encuesta']);
    }

    cerrarSesion(): void {
        this.visibleMenu = false;

        this.AuthService.logout();

        this.cd.markForCheck();

        setTimeout(() => {
            this.router.navigate(['/']);
        }, 1000);
    }
}