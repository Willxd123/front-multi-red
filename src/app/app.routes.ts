import { Routes } from '@angular/router';

import { RegisterComponent } from './auth/components/register/register.component';
import { LoginComponent } from './auth/components/login/login.component';
import { TiktokComponent } from './pages/multi-red/conexiones/tiktok/tiktok.component';
import { LayoutComponent } from './layout/layout.component';
import { MultiRedComponent } from './pages/multi-red/multi-red.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
 
  {
    path: '',
    component: LayoutComponent,

    children: [
      {
        path: 'chat',
        component: MultiRedComponent,
      },

    ],
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
 
];
