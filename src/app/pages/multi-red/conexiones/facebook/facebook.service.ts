import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class FacebookService {
  private apiUrl = 'http://localhost:3000/api/facebook';
  private readonly authService = inject(AuthService);
  
  constructor(private http: HttpClient) {}

  /**
   * Publicar foto en Facebook
   */
  publishPhoto(message: string, photo: File): Observable<any> {
    const formData = new FormData();
    formData.append('message', message);
    formData.append('photo', photo);

    const token = this.authService.getToken();

    return this.http.post(`${this.apiUrl}/photo`, formData, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    });
  }
}