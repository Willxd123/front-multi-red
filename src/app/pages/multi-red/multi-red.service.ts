import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuthService } from '../../auth/services/auth.service';
import { environment } from '../../environment';

interface LoginResponse {
  token: string;
}

interface SocialAccount {
  id: number;
  provider: string;
  providerId: string;
  connected: boolean;
  connectedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class MultiRedService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private baseUrl = environment.apiUrl;

  public getToken = this.authService.getToken();
  /**
   * Conectar TikTok a la cuenta del usuario
   * Requiere que el usuario ya esté autenticado
   */
  connectTikTok(): void {
    const token = this.getToken;
    if (!token) {
      console.error('Usuario no autenticado');
      inject(Router).navigate(['']);
      return;
    }
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    // Paso 1: Llamar al endpoint para obtener la URL de conexión
    this.http.post<{ url: string }>(`${this.baseUrl}/tiktok/connect`, {}, { headers })
      .subscribe({
        next: (response) => {
          console.log('URL de conexión TikTok recibida:', response.url);
          // Paso 2: Abrir la URL en el mismo navegador
          window.location.href = response.url;
        },
        error: (err) => {
          console.error('Error al iniciar conexión TikTok:', err);
          alert('Error al conectar TikTok. Intenta nuevamente.');
        }
      });
  }

  /**
   * Desconectar TikTok
   */
  disconnectTikTok(): Observable<any> {
    const token = this.getToken;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.delete(`${this.baseUrl}/social-accounts/tiktok`, { headers });
  }

  /**
   * Obtener las cuentas sociales conectadas del usuario
   */
  getConnectedAccounts(): Observable<any[]> {
    const token = this.getToken;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get<any[]>(`${this.baseUrl}/social-accounts`, { headers });
  }
  /**
   * Publicar video en TikTok
   */
  publishToTikTok(video: File, caption: string): Observable<any> {
    const token = this.getToken;
    if (!token) {
      throw new Error('Usuario no autenticado');
    }

    const formData = new FormData();
    formData.append('video', video);
    formData.append('caption', caption);

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(`${this.baseUrl}/posts/tiktok/video`, formData, { headers });
  }
}
