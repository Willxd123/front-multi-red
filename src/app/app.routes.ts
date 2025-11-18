import { Routes } from '@angular/router';


import { RegisterComponent } from './auth/components/register/register.component';
import { LoginComponent } from './auth/components/login/login.component';
import { TiktokComponent } from './pages/multi-red/conexiones/tiktok/tiktok.component';
import { LayoutComponent } from './layout/layout.component';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'client',
    component: TiktokComponent,
  },
  {
    path: 'layout',
    component: LayoutComponent,
  },

];
