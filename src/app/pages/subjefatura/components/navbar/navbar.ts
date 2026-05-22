import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../auth/services/Auth.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  constructor(
    private cd: ChangeDetectorRef,
    public AuthService: AuthService,
    private router: Router,
  ) {}
  public visibleMenu: boolean = false;
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
                this.router.navigate(['/subjefatura/estadistica']);
                this.visibleMenu = false;
              },
            },
            {
              label: 'Enviar encuesta',
              icon: 'pi pi-send',
              command: () => {
                this.router.navigate(['/subjefatura/enviar-encuesta']);
                this.visibleMenu = false;
              },
            },
            {
              label: 'Cerrar sesion',
              icon: 'pi pi-sign-out',
              command: () => {
                this.visibleMenu = false;
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
