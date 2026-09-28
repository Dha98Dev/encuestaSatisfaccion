import { ChangeDetectorRef, Component } from '@angular/core';
import { TramiteService } from '../../../sharedPages/services/tramites.service';
import { DepartamentoService } from '../../services/departamentos.service';
import { Tramite, tramitesDepartamento } from '../../../sharedPages/interfaces/tramites.interface';
import { map, switchMap, forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'app-administrar-tramites',
  standalone: false,
  templateUrl: './administrar-tramites.html',
  styleUrl: './administrar-tramites.scss',
})
export class AdministrarTramites {
  constructor(
    private cd: ChangeDetectorRef,
    private tramitesService: TramiteService,
    private departamentoService: DepartamentoService,
  ) {}

  public listadoDepartamentos: any[] = [];
  public listadoTramitesDepartamentos: tramitesDepartamento[] = [];
  departamentoSeleccionadoId: number | string | null = null;
  // public tramite:string=''

  ngOnInit() {
    this.getDepartamentos();
  }

  getDepartamentos(): void {
    this.departamentoService
      .getDepartamentos()
      .pipe(
        map((resp: any) => resp.data.filter((dep: any) => dep.nombre !== 'ADMIN')),

        switchMap((departamentos: any[]) => {
          this.listadoDepartamentos = departamentos;

          const requests: Observable<tramitesDepartamento>[] = departamentos.map((dep: any) =>
            this.tramitesService.getTiposTramitesByDepartamento(dep.id).pipe(
              map(
                (resp: any): tramitesDepartamento => ({
                  idDepartamento: dep.id,
                  descripcion: dep.nombre,
                  tramites: resp.data,
                }),
              ),
            ),
          );

          return forkJoin(requests);
        }),
      )
      .subscribe({
        next: (tramitesDepartamentos: tramitesDepartamento[]) => {
          this.listadoTramitesDepartamentos = tramitesDepartamentos;

          this.cd.markForCheck();
        },
        error: (err) => {
          console.error(err);
        },
      });
  }

  seleccionarTodosDepartamento(dep: any): void {
    dep.tramites.forEach((tramite: any) => (tramite.seleccionado = true));
  }

  limpiarSeleccionDepartamento(dep: any): void {
    dep.tramites.forEach((tramite: any) => (tramite.seleccionado = false));
  }

  tieneSeleccionDepartamento(dep: any): boolean {
    return dep.tramites.some((tramite: any) => tramite.seleccionado);
  }

  cambiarEstadoTramite(tramite: any): void {
    tramite.activo = !tramite.activo;

    // Aquí puedes llamar tu servicio/API
    // this.tramitesService.actualizarEstado(tramite.id, tramite.activo).subscribe();
  }

  cambiarEstadoSeleccionados(dep: any, activo: boolean): void {
    dep.tramites
      .filter((tramite: any) => tramite.seleccionado)
      .forEach((tramite: any) => {
        tramite.activo = activo;
        tramite.seleccionado = false;
      });

    // Aquí puedes llamar tu servicio/API para actualización masiva
  }

  guardarTramiteEnDepartamento(idDepartamento: string) {
    let newTramite = document.getElementById(idDepartamento) as HTMLInputElement;
    let tramite = newTramite.value;
    if (tramite != '') {
      this.tramitesService.guardarTramite({ tramite, departamento_id: idDepartamento }).subscribe({
        next: (resp) => {
          newTramite.value = '';
          this.getDepartamentos();
        },
        error: (err) => {},
      });
    }
  }
  seleccionarDepartamento(idDepartamento: number | string): void {
    this.departamentoSeleccionadoId = idDepartamento;
  }
}
