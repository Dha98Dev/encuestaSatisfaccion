import { ChangeDetectorRef, Component } from '@angular/core';
import { PreguntasService } from '../../../administracion/services/preguntas.service';
import { AuthService } from '../../../auth/services/Auth.service';
import { EstadisticasDepartamentoResponse } from '../../../administracion/interfaces/estadistica.interface';
import { forkJoin } from 'rxjs';
import { EstadisticaService } from '../../../administracion/services/estadistica.service';

@Component({
  selector: 'app-estadistica-subjefatura',
  standalone: false,
  templateUrl: './estadistica-subjefatura.html',
  styleUrl: './estadistica-subjefatura.scss',
})
export class EstadisticaSubjefatura {
  constructor(
    private cd: ChangeDetectorRef,
    public authService: AuthService,
    private preguntaService: PreguntasService,
    private estadisticasService: EstadisticaService,
  ) {}

  public estadisticas?: EstadisticasDepartamentoResponse;
  public resumenRespuestas: any[] = [];
  public listadoDepartamentos: any[] = [];
  vistaDetalle: 'cards' | 'tabla' = 'cards';
  ngOnInit() {
    this.listadoDepartamentos = this.authService.getDepartamentos();
    // this.getResumenRespuestas()
    this.getEstadistica('');
  }

  getResumenRespuestas(): void {
    if (!this.listadoDepartamentos || this.listadoDepartamentos.length === 0) {
      this.resumenRespuestas = [];
      return;
    }

    const peticiones = this.listadoDepartamentos.map((dep) =>
      this.preguntaService.getRespuestas(dep.id),
    );

    forkJoin(peticiones).subscribe({
      next: (respuestas) => {
        this.resumenRespuestas = respuestas.map((resp, index) => ({
          departamento_id: this.listadoDepartamentos[index].id,
          departamento: this.listadoDepartamentos[index].nombre,
          data: resp.data ?? [],
        }));

        this.cd.markForCheck();
      },
      error: (err) => {
        console.error('Error al obtener resumen de respuestas:', err);
      },
    });
  }

  getEstadistica(idDepartamento: string) {
    let departamentoId;
    if (idDepartamento == '') {
      departamentoId = this.authService.getDepartamentos()[0].id; // lo obtienes de donde corresponda
    } else {
      departamentoId = idDepartamento;
    }

    this.estadisticasService.obtenerEstadisticas(departamentoId).subscribe({
      next: (res) => {
        this.estadisticas = res;
        this.cd.markForCheck();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  getColorClase(porcentaje: number): string {
    if (porcentaje < 40) {
      return 'bg-gradient-to-r from-red-400 to-red-600';
    } else if (porcentaje < 70) {
      return 'bg-gradient-to-r from-yellow-400 to-amber-500';
    } else {
      return 'bg-gradient-to-r from-emerald-400 to-green-600';
    }
  }

  getBadgeClase(porcentaje: number): string {
    if (porcentaje < 40) {
      return 'bg-red-100 text-red-700';
    } else if (porcentaje < 70) {
      return 'bg-yellow-100 text-yellow-700';
    } else {
      return 'bg-green-100 text-green-700';
    }
  }

  cambiarVistaDetalle(vista: 'cards' | 'tabla') {
    this.vistaDetalle = vista;
  }
}
