import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ApiService } from './services/api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private apiService: ApiService, private router: Router) {}

  canActivate(): boolean {
    const token = this.apiService.getToken();
    console.log('Verificando autenticación:', !!token);
    if (token) {
      return true;  // Si hay token, permite el acceso
    } else {
      this.router.navigate(['']);  // Redirige al login si no está autenticado
      return false;
    }
  }



}
