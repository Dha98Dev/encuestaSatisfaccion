import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutSubjefatura } from './pages/layout-subjefatura/layout-subjefatura';
import { Configuracion } from './pages/configuracion/configuracion';
import { EstadisticaSubjefatura } from './pages/estadistica-subjefatura/estadistica-subjefatura';
import { EnviarEncusta } from './pages/enviar-encusta/enviar-encusta';
import { authGuard } from '../auth/guards/auth.guard';

const routes: Routes = [
  {path:'', component:LayoutSubjefatura,children:[
    {path:'configuracion', component:Configuracion, canActivate:[authGuard]},
    {path:'estadistica', component:EstadisticaSubjefatura, canActivate:[authGuard]},
    {path:'enviar-encuesta', component:EnviarEncusta, canActivate:[authGuard]},
    {path:'', redirectTo:'configuracion',  pathMatch:'full'}
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubjefaturaRoutingModule { }
