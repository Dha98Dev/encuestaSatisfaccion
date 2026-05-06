import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdministracionRoutingModule } from './administracion-routing-module';
import { LayoutAdmin } from './pages/layout-admin/layout-admin';
import { AdministrarPreguntas } from './pages/administrar-preguntas/administrar-preguntas';
import { NavbarAdmin } from './components/navbar-admin/navbar-admin';
import { PrimeNgModule } from '../core/PrimeNg/PrimeNg.module';
import { Encuesta } from '../sharedPages/pages/encuesta/encuesta';
import { ComponentsModule } from '../core/components/components.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Estadistica } from './pages/estadistica/estadistica';
import { HighchartsChartDirective, provideHighcharts } from 'highcharts-angular';
import { GraficaBarra } from './components/grafica-barra/grafica-barra';

@NgModule({
  declarations: [
    LayoutAdmin,
    AdministrarPreguntas,
    NavbarAdmin,
    Encuesta,
    Estadistica,
    GraficaBarra
  ],
  imports: [
    CommonModule,
    AdministracionRoutingModule,
    PrimeNgModule,
    ComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    HighchartsChartDirective
  ],
  providers:[
    provideHighcharts(),
  ]
})
export class AdministracionModule { }
