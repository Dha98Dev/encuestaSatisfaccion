import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutAuth } from './pages/layout-auth/layout-auth';
import { Login } from './pages/login/login';
import { noAuthGuard } from './guards/no-auth.guard';

const routes: Routes = [
  {path:'', component: LayoutAuth,  children: [
    {path:'login', component: Login, canActivate:[noAuthGuard]},
    {path:'', redirectTo:'login', pathMatch:'full'}
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
