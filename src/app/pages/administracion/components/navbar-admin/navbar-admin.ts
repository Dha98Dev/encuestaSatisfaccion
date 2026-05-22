import { ChangeDetectorRef, Component } from '@angular/core';
import { AuthService } from '../../../auth/services/Auth.service';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';

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
  public visibleAdminMenu: boolean = false;
  itemsAdmin: MenuItem[] = [];
  ngOnInit() {
    if (this.AuthService.isLoggedIn() && !this.AuthService.isAdmin()) {
      this.itemsAdmin = [
        {
          label: 'Administración',
          icon: 'pi pi-user',
          items: [
            {
              label: 'Estadistica',
              icon: 'pi pi-chart-bar',
              command: () => {
                this.router.navigate(['/a/estadistica']);
                this.visibleAdminMenu = false;
              },
            },

            {
              label: 'Ir a encuesta',
              icon: 'pi pi-chart-scatter',
              command: () => {
                this.router.navigate(['/encuesta', this.AuthService.getDepartamentos()[0].id]);
                this.visibleAdminMenu = false;
              },
            },
            {
              label: 'Cerrar sesion',
              icon: 'pi pi-sign-out',
              command: () => {
                this.visibleAdminMenu = false;
                this.AuthService.logout();
                this.cd.markForCheck();
                setTimeout(() => {
                  this.router.navigate(['/']);
                }, 1000);
              },
            },
          ],
        },
      ];
    }
    if (this.AuthService.isAdmin()) {
      this.itemsAdmin = [
        {
          label: 'Administración',
          icon: 'pi pi-user',
          items: [
            {
              label: 'Usuarios',
              icon: 'pi pi-list',
              command: () => {
                this.router.navigate(['/a/usuarios']);
                this.visibleAdminMenu = false;
              },
            },
            {
              label: 'Estadistica',
              icon: 'pi pi-chart-bar',
              command: () => {
                this.router.navigate(['/a/estadistica']);
                this.visibleAdminMenu = false;
              },
            },
            {
              label: 'Tramites',
              icon: 'pi pi-file',
              command: () => {
                this.router.navigate(['/a/tramites']);
                this.visibleAdminMenu = false;
              },
            },
            {
              label: 'Configuración',
              icon: 'pi pi-file',
              command: () => {
                this.router.navigate(['/a/configuracion']);
                this.visibleAdminMenu = false;
              },
            },
            {
              label: 'Cerrar sesion',
              icon: 'pi pi-sign-out',
              command: () => {
                this.visibleAdminMenu = false;
                this.AuthService.logout();
                this.cd.markForCheck();
                setTimeout(() => {
                  this.router.navigate(['/']);
                }, 1000);
              },
            },
          ],
        },
      ];
    }
  }
}
