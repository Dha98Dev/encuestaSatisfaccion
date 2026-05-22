import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing-module';
import { LayoutAuth } from './pages/layout-auth/layout-auth';
import { Login } from './pages/login/login';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrimeNgModule } from '../../core/PrimeNg/PrimeNg.module';


@NgModule({
  declarations: [
    LayoutAuth,
    Login
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    PrimeNgModule
  ]
})
export class AuthModule { }
