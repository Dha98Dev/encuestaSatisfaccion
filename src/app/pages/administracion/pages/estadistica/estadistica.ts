import { ChangeDetectorRef, Component } from '@angular/core';
import * as Highcharts from 'highcharts';
import { ChartConstructorType } from 'highcharts-angular';
import { AuthService } from '../../../auth/services/Auth.service';
import { PreguntasService } from '../../services/preguntas.service';
import { forkJoin } from 'rxjs';
import { EstadisticaService } from '../../services/estadistica.service';
import { DepartamentoService } from '../../services/departamentos.service';
import { DistribucionCalificacion, EstadisticasResponse, MetricasSalud } from '../../interfaces/estadistica.interface';
@Component({
  selector: 'app-estadistica',
  standalone: false,
  templateUrl: './estadistica.html',
  styleUrl: './estadistica.scss',
})
export class Estadistica {
  constructor(
    private cd: ChangeDetectorRef,
    public authService: AuthService,
    private preguntaService: PreguntasService,
    private estadisticasService: EstadisticaService,
    private departamentoService: DepartamentoService,
  ) {}

  public listadoDepartamentos: any[] = [];
  public estadisticas?: any;
  public estadisticasGeneral?: EstadisticasResponse | null = null;
  distribucionCalificaciones: DistribucionCalificacion[] = [];
  metricasSalud: MetricasSalud   | null = null;

  public resumenRespuestas: any[] = [];
  ngOnInit() {
    if (this.authService.isAdmin()) {
      this.getDepartamentos();
      this.getEstadisticaAdmin();
    } else {
      this.listadoDepartamentos = this.authService.getDepartamentos();
      // this.getResumenRespuestas()
      this.getEstadistica('');
    }
  }

  getDepartamentos() {
    this.departamentoService.getDepartamentos().subscribe({
      next: (resp) => {
        let data: any[] = resp.data;
        this.listadoDepartamentos = data.filter((dep) => {
          return dep.nombre != 'ADMIN';
        });
        this.cd.markForCheck();
      },
      error: (err) => {},
    });
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
  getEstadisticaAdmin() {
    this.estadisticasService.obtenerEstadisticasGeneral().subscribe({
      next: (res) => {
        this.estadisticasGeneral = res  ;
          if (res.data.distribucion_calificaciones) {
          this.distribucionCalificaciones = res.data.distribucion_calificaciones.distribucion;
          this.metricasSalud = res.data.distribucion_calificaciones.metricas_salud;
        }
        this.cd.markForCheck();
      },
      error: (err) => {
        console.error(err);
      },
    });
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

  getColorClase(color: string): string {
    const colores: Record<string, string> = {
      'emerald': 'bg-emerald-100 text-emerald-700',
      'blue': 'bg-blue-100 text-blue-700',
      'amber': 'bg-amber-100 text-amber-700',
      'red': 'bg-red-100 text-red-700',
      'orange': 'bg-orange-100 text-orange-700',
      'yellow': 'bg-yellow-100 text-yellow-700',
      'green': 'bg-green-100 text-green-700',
      'gray': 'bg-gray-100 text-gray-700'
    };
    return colores[color] || 'bg-gray-100 text-gray-700';
  }

  // Helper para obtener el color del balance
  getBalanceColor(balance: string): string {
    switch(balance) {
      case 'positivo': return 'text-emerald-600';
      case 'negativo': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  getBadgeSatisfaccion(porcentaje: number): string {
    if (porcentaje >= 70) return 'bg-emerald-100 text-emerald-700';
    if (porcentaje >= 50) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  }

  // Versión alternativa con más niveles
getColorClaseAvanzado(porcentaje: number): string {
  if (porcentaje >= 80) {
    return 'bg-emerald-600';
  } else if (porcentaje >= 60) {
    return 'bg-emerald-500';
  } else if (porcentaje >= 40) {
    return 'bg-amber-500';
  } else if (porcentaje >= 20) {
    return 'bg-orange-500';
  } else {
    return 'bg-red-500';
  }
}
}
