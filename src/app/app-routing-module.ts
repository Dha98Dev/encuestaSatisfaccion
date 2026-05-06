import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';
import { Encuesta } from './sharedPages/pages/encuesta/encuesta';
import { NotFound } from './sharedPages/pages/not-found/not-found';

const routes: Routes = [
  { path: 'auth', loadChildren: () => import('./auth/auth-module').then((m) => m.AuthModule) },
  {
    path: 'a',
    loadChildren: () =>
      import('./administracion/administracion-module').then((m) => m.AdministracionModule),
    canActivate: [authGuard],
  },
  { path: 'encuesta/:idDepartamento', component: Encuesta},
  { path: 'not-found', component: NotFound},
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
