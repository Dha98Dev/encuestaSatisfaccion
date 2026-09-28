import { ChangeDetectorRef, Component } from '@angular/core';

import { forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

import * as XLSX from 'xlsx';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { AuthService } from '../../../auth/services/Auth.service';
import { PreguntasService } from '../../services/preguntas.service';
import { EstadisticaService } from '../../services/estadistica.service';
import { DepartamentoService } from '../../services/departamentos.service';

import {
  DistribucionCalificacion,
  EstadisticasResponse,
  MetricasSalud,
  EstadisticaDepartamentoResponse,
} from '../../interfaces/estadistica.interface';

interface DepartamentoListado {
  id: string;
  nombre: string;
}

interface ResultadoReporteDepartamento {
  departamento: DepartamentoListado;
  data: EstadisticaDepartamentoResponse | null;
  error?: unknown;
}

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

  // =========================================================
  // DATOS GENERALES
  // =========================================================

  public listadoDepartamentos: DepartamentoListado[] = [];

  public estadisticas?: EstadisticaDepartamentoResponse;

  public estadisticasGeneral?: EstadisticasResponse | null = null;

  public distribucionCalificaciones: DistribucionCalificacion[] = [];

  public metricasSalud: MetricasSalud | null = null;

  public resumenRespuestas: any[] = [];

  // =========================================================
  // REPORTE
  // =========================================================

  public cargandoReporte: boolean = false;

  public formatoReporte: 'excel' | 'pdf' | null = null;

  public errorReporte: string | null = null;

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    if (this.authService.isAdmin()) {
      this.getDepartamentos();

      this.getEstadisticaAdmin();
    } else {
      this.listadoDepartamentos = this.authService.getDepartamentos() ?? [];

      this.getEstadistica('');
    }
  }

  // =========================================================
  // DEPARTAMENTOS
  // =========================================================

  getDepartamentos(): void {
    this.departamentoService.getDepartamentos().subscribe({
      next: (resp) => {
        const data: DepartamentoListado[] = resp.data ?? [];

        this.listadoDepartamentos = data.filter((dep) => dep.nombre?.toUpperCase() !== 'ADMIN');

        this.cd.markForCheck();
      },

      error: (err) => {
        console.error('Error al obtener departamentos:', err);
      },
    });
  }

  // =========================================================
  // RESUMEN RESPUESTAS
  // =========================================================

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

  // =========================================================
  // ESTADÍSTICA POR DEPARTAMENTO
  // =========================================================

  getEstadistica(idDepartamento: string): void {
    let departamentoId: string | undefined;

    if (idDepartamento === '') {
      departamentoId = this.authService.getDepartamentos()?.[0]?.id;
    } else {
      departamentoId = idDepartamento;
    }

    if (!departamentoId) {
      console.warn('No se encontró un departamento para consultar estadísticas.');

      return;
    }

    this.estadisticasService.obtenerEstadisticas(departamentoId).subscribe({
      next: (res) => {
        this.estadisticas = res;

        this.cd.markForCheck();
      },

      error: (err) => {
        console.error('Error al obtener estadística:', err);
      },
    });
  }

  // =========================================================
  // ESTADÍSTICA GENERAL ADMIN
  // =========================================================

  getEstadisticaAdmin(): void {
    this.estadisticasService.obtenerEstadisticasGeneral().subscribe({
      next: (res) => {
        this.estadisticasGeneral = res;

        const distribucion = res?.data?.distribucion_calificaciones;

        if (distribucion) {
          this.distribucionCalificaciones = distribucion.distribucion ?? [];

          this.metricasSalud = distribucion.metricas_salud ?? null;
        }

        this.cd.markForCheck();
      },

      error: (err) => {
        console.error('Error al obtener estadística general:', err);
      },
    });
  }

  // =========================================================
  // GENERACIÓN DEL REPORTE
  // =========================================================

  generarReporte(formato: 'excel' | 'pdf'): void {
    if (this.cargandoReporte) {
      return;
    }

    if (!this.listadoDepartamentos || this.listadoDepartamentos.length === 0) {
      this.errorReporte = 'No existen subjefaturas disponibles para generar el reporte.';

      return;
    }

    this.cargandoReporte = true;

    this.formatoReporte = formato;

    this.errorReporte = null;

    this.obtenerReporteCompleto()
      .pipe(
        finalize(() => {
          this.cargandoReporte = false;

          this.formatoReporte = null;

          this.cd.markForCheck();
        }),
      )
      .subscribe({
        next: (resultados) => {
          const exitosos = resultados.filter((item) => item.data !== null);

          const errores = resultados.filter((item) => item.data === null);

          if (exitosos.length === 0) {
            this.errorReporte = 'No fue posible obtener información de las subjefaturas.';

            return;
          }

          if (errores.length > 0) {
            this.errorReporte =
              `El reporte fue generado, pero ${errores.length} ` +
              (errores.length === 1
                ? 'subjefatura no pudo ser consultada.'
                : 'subjefaturas no pudieron ser consultadas.');
          }

          if (formato === 'excel') {
            this.exportarExcel(exitosos);
          } else {
            this.exportarPDF(exitosos);
          }
        },

        error: (err) => {
          console.error('Error al generar reporte:', err);

          this.errorReporte = 'Ocurrió un error al generar el reporte.';
        },
      });
  }

  // =========================================================
  // CONSULTAR TODAS LAS SUBJEFATURAS
  // =========================================================

  private obtenerReporteCompleto(): Observable<ResultadoReporteDepartamento[]> {
    const peticiones = this.listadoDepartamentos.map((dep) =>
      this.estadisticasService.obtenerEstadisticas(dep.id).pipe(
        map((data: EstadisticaDepartamentoResponse) => ({
          departamento: {
            id: dep.id,
            nombre: dep.nombre,
          },

          data,
        })),

        catchError((error) => {
          console.error(`Error consultando ${dep.nombre}:`, error);

          return of({
            departamento: {
              id: dep.id,
              nombre: dep.nombre,
            },

            data: null,

            error,
          });
        }),
      ),
    );

    return forkJoin(peticiones);
  }

  // =========================================================
  // PARTICIPACIÓN
  // =========================================================

  private calcularParticipacion(personasTramite: number, totalPersonas: number): number {
    if (!totalPersonas) {
      return 0;
    }

    return personasTramite / totalPersonas;
  }

  private porcentajeTexto(porcentaje: number): string {
    return `${Number(porcentaje ?? 0).toFixed(2)} %`;
  }

  // =========================================================
  // EXCEL
  // =========================================================

  private exportarExcel(resultados: ResultadoReporteDepartamento[]): void {
    const workbook = XLSX.utils.book_new();

    const fechaGeneracion = new Date();

    // =======================================================
    // 1. INFORMACIÓN
    // =======================================================

    const hojaInformacion = XLSX.utils.aoa_to_sheet([
      ['REPORTE', 'Encuesta de satisfacción'],

      ['Institución', 'Servicios de Educación Pública del Estado de Nayarit'],

      ['Fecha de generación', fechaGeneracion.toLocaleString('es-MX')],

      ['Subjefaturas incluidas', resultados.length],
    ]);

    hojaInformacion['!cols'] = [{ wch: 28 }, { wch: 65 }];

    XLSX.utils.book_append_sheet(workbook, hojaInformacion, 'Información');

    // =======================================================
    // 2. RESUMEN
    // =======================================================

    const filasResumen = resultados.map((item) => {
      const data = item.data!;

      return {
        Subjefatura: data.departamento.nombre,

        'Personas encuestadas': data.resumen.total_personas_encuestadas,

        'Trámites evaluados': data.resumen.total_tramites_con_respuestas,

        'Preguntas evaluadas': data.preguntas?.length ?? 0,
      };
    });

    const hojaResumen = this.crearHojaExcel(filasResumen, [
      'Subjefatura',
      'Personas encuestadas',
      'Trámites evaluados',
      'Preguntas evaluadas',
    ]);

    hojaResumen['!cols'] = [{ wch: 40 }, { wch: 23 }, { wch: 22 }, { wch: 22 }];

    XLSX.utils.book_append_sheet(workbook, hojaResumen, 'Resumen');

    // =======================================================
    // 3. PARTICIPACIÓN POR TRÁMITE
    // =======================================================

    const filasTramites = resultados.flatMap((item) => {
      const data = item.data!;

      const totalPersonas = data.resumen.total_personas_encuestadas;

      return (data.tramites ?? []).map((tramite) => ({
        Subjefatura: data.departamento.nombre,

        Trámite: tramite.tramite,

        'Personas encuestadas': tramite.total_personas,

        Participación: this.calcularParticipacion(tramite.total_personas, totalPersonas),
      }));
    });

    const hojaTramites = this.crearHojaExcel(filasTramites, [
      'Subjefatura',
      'Trámite',
      'Personas encuestadas',
      'Participación',
    ]);

    hojaTramites['!cols'] = [{ wch: 38 }, { wch: 70 }, { wch: 23 }, { wch: 20 }];

    this.aplicarFormatoPorcentaje(hojaTramites, 'Participación');

    XLSX.utils.book_append_sheet(workbook, hojaTramites, 'Participación trámites');

    // =======================================================
    // 4. RESULTADOS POR PREGUNTA
    // =======================================================

    const filasPreguntas = resultados.flatMap((item) => {
      const data = item.data!;

      return (data.preguntas ?? []).flatMap((pregunta) =>
        (pregunta.respuestas ?? []).map((respuesta) => ({
          Subjefatura: data.departamento.nombre,

          Pregunta: pregunta.pregunta,

          'Personas que respondieron': pregunta.total_respuestas,

          Respuesta: respuesta.respuesta,

          Cantidad: respuesta.total,

          Porcentaje: Number(respuesta.porcentaje ?? 0) / 100,
        })),
      );
    });

    const hojaPreguntas = this.crearHojaExcel(filasPreguntas, [
      'Subjefatura',
      'Pregunta',
      'Personas que respondieron',
      'Respuesta',
      'Cantidad',
      'Porcentaje',
    ]);

    hojaPreguntas['!cols'] = [
      { wch: 38 },
      { wch: 75 },
      { wch: 25 },
      { wch: 28 },
      { wch: 15 },
      { wch: 18 },
    ];

    this.aplicarFormatoPorcentaje(hojaPreguntas, 'Porcentaje');

    XLSX.utils.book_append_sheet(workbook, hojaPreguntas, 'Resultados preguntas');

    // =======================================================
    // 5. DETALLE POR TRÁMITE
    // =======================================================

    const filasDetalle = resultados.flatMap((item) => {
      const data = item.data!;

      return (data.detalle_por_tramite ?? []).flatMap((tramite) =>
        (tramite.preguntas ?? []).flatMap((pregunta) =>
          (pregunta.respuestas ?? []).map((respuesta) => ({
            Subjefatura: data.departamento.nombre,

            Trámite: tramite.tramite,

            Pregunta: pregunta.pregunta,

            'Personas que respondieron': pregunta.total_respuestas,

            Respuesta: respuesta.respuesta,

            Cantidad: respuesta.total,

            Porcentaje: Number(respuesta.porcentaje ?? 0) / 100,
          })),
        ),
      );
    });

    const hojaDetalle = this.crearHojaExcel(filasDetalle, [
      'Subjefatura',
      'Trámite',
      'Pregunta',
      'Personas que respondieron',
      'Respuesta',
      'Cantidad',
      'Porcentaje',
    ]);

    hojaDetalle['!cols'] = [
      { wch: 38 },
      { wch: 65 },
      { wch: 75 },
      { wch: 25 },
      { wch: 28 },
      { wch: 15 },
      { wch: 18 },
    ];

    this.aplicarFormatoPorcentaje(hojaDetalle, 'Porcentaje');

    XLSX.utils.book_append_sheet(workbook, hojaDetalle, 'Detalle por trámite');

    // =======================================================
    // DESCARGAR
    // =======================================================

    XLSX.writeFile(workbook, `reporte_encuesta_satisfaccion_${this.fechaArchivo()}.xlsx`);
  }

  // =========================================================
  // CREAR HOJA DE EXCEL
  // =========================================================

  private crearHojaExcel(datos: Record<string, any>[], encabezados: string[]): XLSX.WorkSheet {
    let hoja: XLSX.WorkSheet;

    if (datos.length > 0) {
      hoja = XLSX.utils.json_to_sheet(datos);
    } else {
      hoja = XLSX.utils.aoa_to_sheet([encabezados]);
    }

    if (hoja['!ref']) {
      hoja['!autofilter'] = {
        ref: hoja['!ref'],
      };
    }

    return hoja;
  }

  // =========================================================
  // FORMATO PORCENTAJE EXCEL
  // =========================================================

  private aplicarFormatoPorcentaje(hoja: XLSX.WorkSheet, encabezado: string): void {
    if (!hoja['!ref']) {
      return;
    }

    const rango = XLSX.utils.decode_range(hoja['!ref']);

    let columnaPorcentaje: number | null = null;

    for (let columna = rango.s.c; columna <= rango.e.c; columna++) {
      const referencia = XLSX.utils.encode_cell({
        r: 0,
        c: columna,
      });

      const celda = hoja[referencia];

      if (celda?.v === encabezado) {
        columnaPorcentaje = columna;

        break;
      }
    }

    if (columnaPorcentaje === null) {
      return;
    }

    for (let fila = 1; fila <= rango.e.r; fila++) {
      const referencia = XLSX.utils.encode_cell({
        r: fila,
        c: columnaPorcentaje,
      });

      const celda = hoja[referencia];

      if (celda) {
        celda.t = 'n';

        celda.z = '0.00%';
      }
    }
  }

  // =========================================================
  // PDF
  // =========================================================

  private exportarPDF(resultados: ResultadoReporteDepartamento[]): void {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const fechaGeneracion = new Date().toLocaleString('es-MX');

    resultados.forEach((item, index) => {
      const data = item.data!;

      if (index > 0) {
        pdf.addPage();
      }

      const anchoPagina = pdf.internal.pageSize.getWidth();

      // ===================================================
      // ENCABEZADO
      // ===================================================

      pdf.setFillColor(123, 30, 43);

      pdf.rect(0, 0, anchoPagina, 30, 'F');

      pdf.setTextColor(255, 255, 255);

      pdf.setFont('helvetica', 'bold');

      pdf.setFontSize(16);

      pdf.text('Encuesta de satisfacción', 14, 13);

      pdf.setFont('helvetica', 'normal');

      pdf.setFontSize(9);

      pdf.text('Servicios de Educación Pública del Estado de Nayarit', 14, 20);

      pdf.setFontSize(8);

      pdf.text(`Generado: ${fechaGeneracion}`, anchoPagina - 14, 20, {
        align: 'right',
      });

      // ===================================================
      // SUBJEFATURA
      // ===================================================

      pdf.setTextColor(30, 41, 59);

      pdf.setFont('helvetica', 'bold');

      pdf.setFontSize(15);

      pdf.text(data.departamento.nombre, 14, 43);

      pdf.setFont('helvetica', 'normal');

      pdf.setFontSize(9);

      pdf.setTextColor(100, 116, 139);

      pdf.text('Resumen de resultados de la encuesta', 14, 49);

      // ===================================================
      // INDICADORES
      // ===================================================

      const indicadores = [
        {
          titulo: 'Personas encuestadas',

          valor: data.resumen.total_personas_encuestadas,
        },

        {
          titulo: 'Trámites evaluados',

          valor: data.resumen.total_tramites_con_respuestas,
        },

        {
          titulo: 'Preguntas evaluadas',

          valor: data.preguntas?.length ?? 0,
        },
      ];

      const inicioX = 14;

      const inicioY = 57;

      const anchoCard = 62;

      const altoCard = 24;

      const separacion = 5;

      indicadores.forEach((indicador, indicadorIndex) => {
        const x = inicioX + indicadorIndex * (anchoCard + separacion);

        pdf.setFillColor(248, 250, 252);

        pdf.setDrawColor(226, 232, 240);

        pdf.roundedRect(x, inicioY, anchoCard, altoCard, 3, 3, 'FD');

        pdf.setTextColor(100, 116, 139);

        pdf.setFont('helvetica', 'normal');

        pdf.setFontSize(8);

        pdf.text(indicador.titulo, x + 4, inicioY + 7);

        pdf.setTextColor(30, 41, 59);

        pdf.setFont('helvetica', 'bold');

        pdf.setFontSize(15);

        pdf.text(String(indicador.valor), x + 4, inicioY + 17);
      });

      // ===================================================
      // PARTICIPACIÓN POR TRÁMITE
      // ===================================================

      let y = 92;

      pdf.setTextColor(30, 41, 59);

      pdf.setFont('helvetica', 'bold');

      pdf.setFontSize(11);

      pdf.text('Participación por trámite', 14, y);

      pdf.setFont('helvetica', 'normal');

      pdf.setFontSize(8);

      pdf.setTextColor(100, 116, 139);

      pdf.text('Distribución de las personas encuestadas según el trámite realizado.', 14, y + 5);

      const totalPersonas = data.resumen.total_personas_encuestadas;

      const filasTramites = (data.tramites ?? []).map((tramite) => {
        const participacion = this.calcularParticipacion(tramite.total_personas, totalPersonas);

        return [tramite.tramite, tramite.total_personas, this.porcentajeTexto(participacion * 100)];
      });

      autoTable(pdf, {
        startY: y + 10,

        margin: {
          left: 14,
          right: 14,
        },

        head: [['Trámite', 'Personas', 'Participación']],

        body: filasTramites,

        theme: 'grid',

        styles: {
          fontSize: 7.5,

          cellPadding: 2.8,

          textColor: [71, 85, 105],

          lineColor: [226, 232, 240],

          lineWidth: 0.1,

          valign: 'middle',
        },

        headStyles: {
          fillColor: [71, 85, 105],

          textColor: [255, 255, 255],

          fontStyle: 'bold',
        },

        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },

        columnStyles: {
          0: {
            cellWidth: 155,
          },

          1: {
            cellWidth: 35,
            halign: 'center',
          },

          2: {
            cellWidth: 45,
            halign: 'center',
          },
        },
      });

      // ===================================================
      // RESULTADOS GENERALES
      // ===================================================

      y = this.obtenerFinalY(pdf, y + 20) + 12;

      if (y > pdf.internal.pageSize.getHeight() - 35) {
        pdf.addPage();

        y = 20;
      }

      pdf.setFont('helvetica', 'bold');

      pdf.setFontSize(11);

      pdf.setTextColor(30, 41, 59);

      pdf.text('Resultados generales', 14, y);

      pdf.setFont('helvetica', 'normal');

      pdf.setFontSize(8);

      pdf.setTextColor(100, 116, 139);

      pdf.text('Distribución de las respuestas obtenidas en cada pregunta.', 14, y + 5);

      y += 12;

      (data.preguntas ?? []).forEach((pregunta, preguntaIndex) => {
        const altoPagina = pdf.internal.pageSize.getHeight();

        if (y > altoPagina - 40) {
          pdf.addPage();

          y = 20;
        }

        pdf.setTextColor(30, 41, 59);

        pdf.setFont('helvetica', 'bold');

        pdf.setFontSize(9);

        const textoPregunta = pdf.splitTextToSize(
          `${preguntaIndex + 1}. ${pregunta.pregunta}`,

          245,
        );

        pdf.text(textoPregunta, 14, y);

        y += textoPregunta.length * 4 + 2;

        const filasRespuestas = [...(pregunta.respuestas ?? [])]

          .sort((a, b) => b.orden - a.orden)

          .map((respuesta) => [
            respuesta.respuesta,

            respuesta.total,

            this.porcentajeTexto(respuesta.porcentaje),
          ]);

        autoTable(pdf, {
          startY: y,

          margin: {
            left: 14,
            right: 14,
          },

          head: [['Respuesta', 'Personas', 'Porcentaje']],

          body: filasRespuestas,

          theme: 'plain',

          styles: {
            fontSize: 7.5,

            cellPadding: 2.3,

            textColor: [71, 85, 105],
          },

          headStyles: {
            fillColor: [248, 250, 252],

            textColor: [71, 85, 105],

            fontStyle: 'bold',
          },

          columnStyles: {
            0: {
              cellWidth: 145,
            },

            1: {
              cellWidth: 35,
              halign: 'center',
            },

            2: {
              cellWidth: 45,
              halign: 'center',
            },
          },
        });

        y = this.obtenerFinalY(pdf, y + 10) + 8;
      });
    });

    // =======================================================
    // PIE DE PÁGINA
    // =======================================================

    const totalPaginas = pdf.getNumberOfPages();

    for (let pagina = 1; pagina <= totalPaginas; pagina++) {
      pdf.setPage(pagina);

      const anchoPagina = pdf.internal.pageSize.getWidth();

      const altoPagina = pdf.internal.pageSize.getHeight();

      pdf.setDrawColor(226, 232, 240);

      pdf.line(14, altoPagina - 12, anchoPagina - 14, altoPagina - 12);

      pdf.setFont('helvetica', 'normal');

      pdf.setFontSize(7);

      pdf.setTextColor(148, 163, 184);

      pdf.text('Encuesta de satisfacción - SEPEN', 14, altoPagina - 7);

      pdf.text(`Página ${pagina} de ${totalPaginas}`, anchoPagina - 14, altoPagina - 7, {
        align: 'right',
      });
    }

    // =======================================================
    // DESCARGAR
    // =======================================================

    pdf.save(`reporte_encuesta_satisfaccion_${this.fechaArchivo()}.pdf`);
  }

  // =========================================================
  // FINAL Y AUTOTABLE
  // =========================================================

  private obtenerFinalY(pdf: jsPDF, fallback: number): number {
    return (pdf as any).lastAutoTable?.finalY ?? fallback;
  }

  // =========================================================
  // FECHA PARA ARCHIVO
  // =========================================================

  private fechaArchivo(): string {
    const fecha = new Date();

    const anio = fecha.getFullYear();

    const mes = String(fecha.getMonth() + 1).padStart(2, '0');

    const dia = String(fecha.getDate()).padStart(2, '0');

    const hora = String(fecha.getHours()).padStart(2, '0');

    const minuto = String(fecha.getMinutes()).padStart(2, '0');

    return `${anio}-${mes}-${dia}_${hora}-${minuto}`;
  }

  // =========================================================
  // HELPERS UI
  // =========================================================

  getBadgeClase(porcentaje: number): string {
    if (porcentaje < 40) {
      return 'bg-red-100 text-red-700';
    }

    if (porcentaje < 70) {
      return 'bg-yellow-100 text-yellow-700';
    }

    return 'bg-green-100 text-green-700';
  }

  getColorClase(color: string): string {
    const colores: Record<string, string> = {
      emerald: 'bg-emerald-100 text-emerald-700',

      blue: 'bg-blue-100 text-blue-700',

      amber: 'bg-amber-100 text-amber-700',

      red: 'bg-red-100 text-red-700',

      orange: 'bg-orange-100 text-orange-700',

      yellow: 'bg-yellow-100 text-yellow-700',

      green: 'bg-green-100 text-green-700',

      gray: 'bg-gray-100 text-gray-700',
    };

    return colores[color] ?? 'bg-gray-100 text-gray-700';
  }

  getBalanceColor(balance: string): string {
    switch (balance) {
      case 'positivo':
        return 'text-emerald-600';

      case 'negativo':
        return 'text-red-600';

      default:
        return 'text-gray-600';
    }
  }

  getBadgeSatisfaccion(porcentaje: number): string {
    if (porcentaje >= 70) {
      return 'bg-emerald-100 text-emerald-700';
    }

    if (porcentaje >= 50) {
      return 'bg-amber-100 text-amber-700';
    }

    return 'bg-red-100 text-red-700';
  }

  getColorClaseAvanzado(porcentaje: number): string {
    if (porcentaje >= 80) {
      return 'bg-emerald-600';
    }

    if (porcentaje >= 60) {
      return 'bg-emerald-500';
    }

    if (porcentaje >= 40) {
      return 'bg-amber-500';
    }

    if (porcentaje >= 20) {
      return 'bg-orange-500';
    }

    return 'bg-red-500';
  }
}
