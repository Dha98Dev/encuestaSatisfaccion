import { ChangeDetectorRef, Component } from '@angular/core';
import { PreguntasService } from '../../services/preguntas.service';
import { DinamicTableData } from '../../../core/components/dhatatable/dhatatable';
import { AuthService } from '../../../auth/services/Auth.service';
import { forkJoin } from 'rxjs';
import {
  Pregunta,
  PreguntaDepartamento,
  PreguntaDepartamentoResponse,
} from '../../../interfaces/departamento.interfaces';
import { DepartamentoService } from '../../services/departamentos.service';

export interface preguntas {
  id: string;
  departamentos: string[];
  descripcion: string;
}

@Component({
  selector: 'app-administrar-preguntas',
  standalone: false,
  templateUrl: './administrar-preguntas.html',
  styleUrl: './administrar-preguntas.scss',
})
export class AdministrarPreguntas {
  constructor(
    private cd: ChangeDetectorRef,
    private preguntasService: PreguntasService,
    private departamentoService: DepartamentoService,
    public authService: AuthService,
  ) {}
  public tableDinamica: DinamicTableData = {} as DinamicTableData;
  public catalogoPreguntas: preguntas[] = [];
  public catalogoPreguntasDepartamento: PreguntaDepartamento[] = [];

  public agregarPregunta: boolean = false;
  public departamentos: any[] = [];
  public nuevaPregunta: string = '';
  preguntaSeleccionada: any = null;
  departamentosSeleccionados: string[] = [];
  public idPreguntaSeleccionada: string = '';
  ngOnInit() {
    this.getPreguntasDepartamento();
    this.getCatalogoPreguntas();
    this.getDepartamentos();
    this.preseleccionarDepartamentoUnico();
  }
  getCatalogoPreguntas() {
    this.preguntasService.getCatalogoPreguntas().subscribe({
      next: (resp) => {
        setTimeout(() => {
          this.catalogoPreguntas = this.getPreguntasNoAsignadas(resp.data, this.catalogoPreguntasDepartamento);
          
        }, 200);
        this.cd.markForCheck();
      },
      error: (err) => {
      },
    });
  }
  getPreguntasDepartamento() {
    this.preguntasService.getCatalogoPreguntasDepartamento().subscribe({
      next: (resp: PreguntaDepartamentoResponse) => {
        this.catalogoPreguntasDepartamento = resp.data;

        const preguntas = resp.data;

        const preguntasAplanadas = preguntas.map((item: PreguntaDepartamento) => ({
          id: item.pregunta_departamento_id,
          descripcion: item.pregunta.descripcion,
          departamentos: item.departamento?.nombre || 'SIN DEPARTAMENTOS',
          boton: '',
        }));

        this.tableDinamica = {
          columns: [
            {
              key: 'descripcion',
              label: 'Pregunta',
              type: 'text',
              filterable: false,
            },
            {
              key: 'departamentos',
              label: 'Departamentos',
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
              key: 'boton',
              label: 'Ver detalle',
              type: 'text',
            },
          ],
          data: preguntasAplanadas,
          globalSearchKeys: ['descripcion', 'departamentos'],
        };

        this.cd.markForCheck();
      },
      error: (err) => {
      },
    });
  }

  // Método para manejar el clic en el botón
  verDetalle(row: any) {
    // Aquí puedes abrir un modal, navegar, etc.
  }
  getDepartamentos() {
    this.departamentoService.getDepartamentos().subscribe({
      next: (resp) => {
        let data: any[] = resp.data;
        let departamentosFiltrados = data.filter((item) => {
          return item.nombre != 'ADMIN';
        });
        this.departamentos = departamentosFiltrados;
        this.cd.markForCheck();
      },
      error: (err) => {
      },
    });
  }

  preseleccionarDepartamentoUnico(): void {
    const departamentos = this.authService.getDepartamentos();

    if (departamentos.length === 1) {
      this.departamentosSeleccionados = [departamentos[0].id];
    }
  }

  isDepartamentoSeleccionado(id: string): boolean {
    return this.departamentosSeleccionados.includes(id);
  }

  toggleDepartamento(id: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      this.marcarDepartamento(id);
    } else {
      this.desmarcarDepartamento(id);
    }
  }

  marcarDepartamento(id: string): void {
    if (!this.departamentosSeleccionados.includes(id)) {
      this.departamentosSeleccionados = [...this.departamentosSeleccionados, id];
    }
  }

  desmarcarDepartamento(id: string): void {
    const departamentos = this.authService.getDepartamentos();

    if (departamentos.length === 1) return;

    this.departamentosSeleccionados = this.departamentosSeleccionados.filter(
      (depId) => depId !== id,
    );
  }

  cerrarDialogoPregunta(): void {
    this.agregarPregunta = false;
    this.preguntaSeleccionada = null;
    this.nuevaPregunta = '';
    this.idPreguntaSeleccionada = '';

    this.departamentosSeleccionados = [];
    this.preseleccionarDepartamentoUnico();
    this.cd.markForCheck();
  }

  guardarAsignacionPregunta(): void {
    if (!this.idPreguntaSeleccionada || this.departamentosSeleccionados.length === 0) {
      return;
    }

    const requests = this.departamentosSeleccionados.map((departamentoId) => {
      const payload = {
        pregunta_id: this.idPreguntaSeleccionada,
        departamento_id: departamentoId,
      };

      return this.preguntasService.asignarPreguntaDepartamento(payload);
    });

    forkJoin(requests).subscribe({
      next: () => {
        this.cerrarDialogoPregunta();
        this.getPreguntasDepartamento();
      },
      error: (err) => {
        console.error('Error en alguna asignación', err);
      },
    });
  }
  guardarPregunta(): void {
    if (!this.nuevaPregunta.trim()) {
      return;
    }

    this.preguntasService
      .savePregunta({
        descripcion: this.nuevaPregunta.trim(),
      })
      .subscribe({
        next: (resp) => {
          this.idPreguntaSeleccionada = resp.data.id;

          this.preseleccionarDepartamentoUnico();
          this.guardarAsignacionPregunta();
        },
        error: (err) => {
        },
      });
  }
 getPreguntasNoAsignadas(
  catalogoPreguntas: preguntas[], 
  catalogoPreguntasDepartamento: PreguntaDepartamento[]
): preguntas[] {
  
  // Obtener las descripciones de las preguntas que ya están asignadas a departamentos
  const preguntasAsignadasDescripciones = catalogoPreguntasDepartamento.map(
    item => item.pregunta.descripcion
  );

  // Filtrar las preguntas que NO están en la lista de asignadas (por descripción)
  const preguntasNoAsignadas = catalogoPreguntas.filter(
    pregunta => !preguntasAsignadasDescripciones.includes(pregunta.descripcion)
  );

  return preguntasNoAsignadas;
}
}
