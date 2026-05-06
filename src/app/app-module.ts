import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { provideHttpClient } from '@angular/common/http';
import { PrimeNgModule } from './core/PrimeNg/PrimeNg.module';
import { provideHighcharts } from 'highcharts-angular';
import { NotFound } from './sharedPages/pages/not-found/not-found';
@NgModule({
  declarations: [
    App,
    NotFound,
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
