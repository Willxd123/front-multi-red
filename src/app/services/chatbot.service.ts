import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';

// --- Interfaces existentes ---
export interface MediaInfo {
  tipo?: string;
  descripcion?: string;
  guion?: string;
  ruta?: string;
  fileName?: string;
}

export interface SocialNetworkContent {
  media_info?: MediaInfo;
  publicacion?: {
    // ⬅️ Agregar info de publicación
    estado?: string;
    publishId?: string;
    mensaje?: string;
    fecha?: string;
  };
}

export interface MessageContent {
  text?: string;
  TikTok?: SocialNetworkContent;
  Facebook?: SocialNetworkContent;
  Instagram?: SocialNetworkContent;
  LinkedIn?: SocialNetworkContent;
  WhatsApp?: SocialNetworkContent;
  status?: 'processing_media' | 'completed' | 'error';
}

export interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: MessageContent;
  createdAt: string;
}

export interface ConversationDetail {
  id: number;
  messages: Message[];
}

@Injectable({
  providedIn: 'root',
})
export class ChatbotService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService // ⬅️ Inyectar AuthService
  ) {}

  sendMessage(prompt: string, conversationId: number): Observable<any> {
    const body = {
      prompt: prompt,
      conversationId: conversationId,
    };
    return this.http.post(`${this.apiUrl}/chatbot/redes`, body);
  }

  getConversationHistory(
    conversationId: number
  ): Observable<ConversationDetail> {
    return this.http.get<ConversationDetail>(
      `${this.apiUrl}/conversations/${conversationId}`
    );
  }

  // ⬅️ NUEVO MÉTODO para publicar en TikTok
  publishToTikTok(messageId: number): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('Usuario no autenticado');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(
      `${this.apiUrl}/posts/tiktok/publish-from-message`,
      { messageId },
      { headers }
    );
  }
  publishToFacebook(messageId: number): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('Usuario no autenticado');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(
      `${this.apiUrl}/posts/facebook/publish-from-message`,
      { messageId },
      { headers }
    );
  }

  publishToInstagram(messageId: number): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('Usuario no autenticado');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(
      `${this.apiUrl}/posts/instagram/publish-from-message`,
      { messageId },
      { headers }
    );
  }

  /**
   * Genera URL para previsualizar archivos multimedia
   */
  getMediaUrl(fileName: string): string {
    const token = this.authService.getToken();
    return `${this.apiUrl}/media/${fileName}`;
  }
  // Agregar al final de ChatbotService, después de publishToInstagram()

  publishToLinkedIn(messageId: number): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('Usuario no autenticado');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(
      `${this.apiUrl}/posts/linkedin/publish-from-message`,
      { messageId },
      { headers }
    );
  }

  publishToWhatsApp(messageId: number): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('Usuario no autenticado');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(
      `${this.apiUrl}/posts/whatsapp/publish-from-message`,
      { messageId },
      { headers }
    );
  }
}
 