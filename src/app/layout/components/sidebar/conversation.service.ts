import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';
import { environment } from '../../../environment';


export interface Conversation {
    id: number;
    title: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: any;
    createdAt: Date;
  }
  
  export interface ConversationDetail {
    id: number;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    messages: Message[];
  }
  
  @Injectable({
    providedIn: 'root',
  })
  export class ConversationService {
    private readonly http = inject(HttpClient);
    private readonly authService = inject(AuthService);
    private baseUrl = environment.apiUrl;
  
  /**
   * Obtener headers con token
   */
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  /**
   * POST /conversations
   * Crear nueva conversación vacía
   */
  createConversation(): Observable<Conversation> {
    return this.http.post<Conversation>(
      `${this.baseUrl}/conversations`,
      {},
      { headers: this.getHeaders() }
    );
  }

  /**
   * GET /conversations
   * Listar todas las conversaciones
   */
  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(
      `${this.baseUrl}/conversations`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * GET /conversations/:id
   * Obtener detalles de una conversación
   */
  getConversationById(conversationId: number): Observable<ConversationDetail> {
    return this.http.get<ConversationDetail>(
      `${this.baseUrl}/conversations/${conversationId}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * DELETE /conversations/:id
   * Eliminar conversación
   */
  deleteConversation(conversationId: number): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/conversations/${conversationId}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * PATCH /conversations/:id/title
   * Actualizar título de conversación
   */
  updateTitle(conversationId: number, title: string): Observable<Conversation> {
    return this.http.patch<Conversation>(
      `${this.baseUrl}/conversations/${conversationId}/title`,
      { title },
      { headers: this.getHeaders() }
    );
  }
}