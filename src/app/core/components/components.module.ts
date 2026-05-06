import { NgModule } from '@angular/core';

import { PrimeNgModule } from '../PrimeNg/PrimeNg.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { Dhatatable } from './dhatatable/dhatatable';

@NgModule({
  imports: [PrimeNgModule, FormsModule, RouterModule, ReactiveFormsModule, CommonModule],
  exports: [Dhatatable],
  declarations: [Dhatatable],
  providers: [],
})
export class ComponentsModule {}
