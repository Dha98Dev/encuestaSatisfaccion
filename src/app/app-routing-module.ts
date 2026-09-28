import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './pages/auth/guards/auth.guard';
import { NotFound } from './pages/sharedPages/pages/not-found/not-found';
import { Encuesta } from './pages/sharedPages/pages/encuesta/encuesta';
import { Inicio } from './pages/sharedPages/pages/inicio/inicio';
import { noAuthGuard } from './pages/auth/guards/no-auth.guard';

const routes: Routes = [
  {path:'inicio', component: Inicio, canActivate:[noAuthGuard]},
  { path: 'auth', loadChildren: () => import('./pages/auth/auth-module').then((m) => m.AuthModule) },
  {
    path: 'a',
    loadChildren: () =>
      import('./pages/administracion/administracion-module').then((m) => m.AdministracionModule),
    canActivate: [authGuard],
  },
  {
    path:'subjefatura', loadChildren: ()=>import('./pages/subjefatura/subjefatura-module').then(m => m.SubjefaturaModule)
  },
  
  { path: 'encuesta/:pantalla', component: Encuesta},
  { path: 'not-found', component: NotFound},
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
