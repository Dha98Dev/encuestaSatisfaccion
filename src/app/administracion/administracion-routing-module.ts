import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutAdmin } from './pages/layout-admin/layout-admin';
import { AdministrarPreguntas } from './pages/administrar-preguntas/administrar-preguntas';
import { Encuesta } from '../sharedPages/pages/encuesta/encuesta';
import { authGuard } from '../auth/guards/auth.guard';
import { Estadistica } from './pages/estadistica/estadistica';

const routes: Routes = [
  {
    path: '',
    component: LayoutAdmin,
    children: [
      { path: 'preguntas', component: AdministrarPreguntas, canActivate: [authGuard] },
      { path: 'estadistica', component: Estadistica, canActivate: [authGuard] },
      { path: '', redirectTo: 'preguntas', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdministracionRoutingModule {}
