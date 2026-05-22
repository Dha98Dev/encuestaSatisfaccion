import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SubjefaturaRoutingModule } from './subjefatura-routing-module';
import { LayoutSubjefatura } from './pages/layout-subjefatura/layout-subjefatura';
import { EstadisticaSubjefatura } from './pages/estadistica-subjefatura/estadistica-subjefatura';
import { Navbar } from './components/navbar/navbar';
import { PrimeNgModule } from '../../core/PrimeNg/PrimeNg.module';
import { EnviarEncusta } from './pages/enviar-encusta/enviar-encusta';


@NgModule({
  declarations: [
    LayoutSubjefatura,
    EstadisticaSubjefatura,
    Navbar,
    EnviarEncusta
  ],
  imports: [
    CommonModule,
    SubjefaturaRoutingModule,
    PrimeNgModule
  ]
})
export class SubjefaturaModule { }
