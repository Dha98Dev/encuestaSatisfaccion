import { Component, Input, SimpleChanges } from '@angular/core';
import { Options } from 'highcharts';

@Component({
  selector: 'app-grafica-barra',
  standalone: false,
  templateUrl: './grafica-barra.html',
  styleUrl: './grafica-barra.scss',
})
export class GraficaBarra {
  @Input() titulo: string = 'Gráfica de barras';
  @Input() categorias: string[] = [];
  @Input() datos: number[] = [];
  @Input() nombreSerie: string = 'Total';
  @Input() altura: string = '400px';

  chartOptions: Options = {};

  ngOnChanges(changes: SimpleChanges): void {
    this.generarGrafica();
  }

generarGrafica(): void {
  const colores = this.generarColoresAleatorios(this.datos.length);

  this.chartOptions = {
    chart: {
      type: 'column'
    },
    title: {
      text: this.titulo
    },
    xAxis: {
      categories: this.categorias
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Cantidad'
      }
    },
    credits: {
      enabled: false
    },
    series: [
      {
        type: 'column',
        name: this.nombreSerie,
        data: this.datos.map((valor, index) => ({
          y: valor,
          color: colores[index]
        }))
      }
    ]
  };
}
generarColoresAleatorios(cantidad: number): string[] {
  const paleta = [
    '#6366f1', // indigo
    '#22c55e', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#06b6d4', // cyan
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
    '#3b82f6'  // blue
  ];

  return Array.from({ length: cantidad }, () =>
    paleta[Math.floor(Math.random() * paleta.length)]
  );
}
}
