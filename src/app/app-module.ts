import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { provideHttpClient } from '@angular/common/http';
import { PrimeNgModule } from './core/PrimeNg/PrimeNg.module';
import { provideHighcharts } from 'highcharts-angular';
import { NotFound } from './pages/sharedPages/pages/not-found/not-found';
import { Configuracion } from './pages/subjefatura/pages/configuracion/configuracion';
import { Inicio } from './pages/sharedPages/pages/inicio/inicio';
@NgModule({
  declarations: [
    App,
    NotFound,
    Inicio,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PrimeNgModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: { darkModeSelector: false || 'none' }
      }
    }),
    provideClientHydration(withEventReplay()),
     provideHttpClient(),
     provideHighcharts(),
  ],
  bootstrap: [App]
})
export class AppModule { }
