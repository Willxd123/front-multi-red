import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

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
export class ApiService {
  apiUrl: string = 'http://localhost:3000/api';
  tokenKey = 'authToken';

  constructor(private http: HttpClient, private router: Router) {}

  // ========== AUTENTICACIÓN ==========
  register(name: string, email: string, password: string): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/auth/register`, { name, email, password })
      .pipe(
        tap((response) => {
          console.log('Usuario registrado:', response);
        }),
        catchError((err) => {
          console.error('Error en el registro:', err);
          throw err;
        })
      );
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((response) => {
          if (response.token) {
            console.log(response.token);
            this.setToken(response.token);
          }
        }),
        catchError((err) => {
          console.error('Error en el login:', err);
          throw err;
        })
      );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    console.log('Token en isAuthenticated:', token);
    if (!token) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Payload del token:', payload);
      const exp = payload.exp * 1000;
      return Date.now() < exp;
    } catch (e) {
      console.error('Error al decodificar el token:', e);
      return false;
    }
  } 

  logout(): void {
    console.log('logout');
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['']);
  }

  // ========== LOGIN CON REDES SOCIALES (Para autenticación - solo pruebas) ==========
  googleLogin(): void {
    window.location.href = `${this.apiUrl}/auth/google`;
  }

  facebookLogin(): void {
    window.location.href = `${this.apiUrl}/auth/facebook`;
  }

  handleGoogleLogin(token: string): void {
    console.log('Token recibido de Google:', token);
    this.setToken(token);
    this.router.navigate(['/client']);
  }

  processGoogleCallback(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      console.log('Token capturado:', token);
      this.handleGoogleLogin(token);
    } else {
      console.error('No se encontró token en la URL');
    }
  }

  // ========== CONECTAR REDES SOCIALES (Usuario YA autenticado) ⬅️ NUEVO ==========
  
  /**
   * Conectar Facebook a la cuenta del usuario
   * Requiere que el usuario ya esté autenticado
   */
  connectFacebook(): void {
    const token = this.getToken();
    if (!token) {
      console.error('Usuario no autenticado');
      this.router.navigate(['']);
      return;
    }
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    // Paso 1: Llamar al endpoint para obtener la URL de conexión
    this.http.post<{ url: string }>(`${this.apiUrl}/auth/connect/facebook/start`, {}, { headers })
      .subscribe({
        next: (response) => {
          console.log('URL de conexión recibida:', response.url);
          // Paso 2: Abrir la URL en el mismo navegador
          window.location.href = response.url;
        },
        error: (err) => {
          console.error('Error al iniciar conexión:', err);
          alert('Error al conectar Facebook. Intenta nuevamente.');
        }
      });
  }

  /**
   * Obtener todas las cuentas sociales conectadas del usuario
   */
  getSocialAccounts(): Observable<SocialAccount[]> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.getToken()}`
    );
    return this.http.get<SocialAccount[]>(`${this.apiUrl}/social-accounts`, { headers });
  }

  /**
   * Desconectar una red social
   */
  disconnectSocialAccount(provider: string): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.getToken()}`
    );
    return this.http.delete(`${this.apiUrl}/social-accounts/${provider}`, { headers });
  }

  /**
   * Obtener información de la cuenta de Facebook conectada
   */
  getFacebookAccountInfo(): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.getToken()}`
    );
    return this.http.get(`${this.apiUrl}/posts/facebook/account`, { headers });
  }

  // ========== PUBLICAR EN REDES SOCIALES ⬅️ NUEVO ==========

  /**
   * Publicar un mensaje en Facebook
   */
  publishToFacebook(message: string, link?: string): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.getToken()}`
    );
    
    const body: any = { message };
    if (link) {
      body.link = link;
    }

    return this.http.post(`${this.apiUrl}/posts/facebook`, body, { headers });
  }

  // ========== ROOMS (Tu funcionalidad existente) ==========
  
  createRoom(createRoomDto: any): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.getToken()}`
    );
    return this.http.post<any>(`${this.apiUrl}/rooms`, createRoomDto, {
      headers,
    });
  }

  getUserRooms(): Observable<any[]> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.getToken()}`
    );
    return this.http.get<any[]>(`${this.apiUrl}/rooms/user-rooms`, { headers });
  }

  joinRoom(roomCode: string): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.getToken()}`
    );

    return this.http.post<any>(
      `${this.apiUrl}/room-user/join`,
      { code: roomCode },
      { headers }
    );
  }

  getRoomDetails(roomCode: string): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.getToken()}`
    );

    return this.http.get<any>(`${this.apiUrl}/rooms/${roomCode}`, { headers });
  }
  /**
   * Conectar TikTok a la cuenta del usuario
   * Requiere que el usuario ya esté autenticado
   */
  connectTikTok(): void {
    const token = this.getToken();
    if (!token) {
      console.error('Usuario no autenticado');
      this.router.navigate(['']);
      return;
    }
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    // Paso 1: Llamar al endpoint para obtener la URL de conexión
    this.http.post<{ url: string }>(`${this.apiUrl}/tiktok/connect`, {}, { headers })
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
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.delete(`${this.apiUrl}/social-accounts/tiktok`, { headers });
  }

  /**
   * Obtener las cuentas sociales conectadas del usuario
   */
  getConnectedAccounts(): Observable<any[]> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get<any[]>(`${this.apiUrl}/social-accounts`, { headers });
  }
  /**
   * Publicar video en TikTok
   */
  publishToTikTok(video: File, caption: string): Observable<any> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Usuario no autenticado');
    }

    const formData = new FormData();
    formData.append('video', video);
    formData.append('caption', caption);

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(`${this.apiUrl}/posts/tiktok/video`, formData, { headers });
  }
}