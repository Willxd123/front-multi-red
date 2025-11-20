import { Component, OnInit, OnDestroy, HostListener, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ChatbotService } from '../services/chatbot.service'; 
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [SidebarComponent, NavbarComponent, CommonModule, FormsModule], 
  templateUrl: './layout.component.html'
})
export class LayoutComponent implements OnInit, OnDestroy {
  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;
  
  isSidebarOpen = true;
  activeConversationId: number = 5;
  
  messages: any[] = [];
  currentPrompt: string = '';
  isLoading: boolean = false;
  
  // ⬅️ AGREGAR: Para controlar estado de publicación
  publishingMessageId: number | null = null;
  publishError: string = '';
  publishSuccess: string = '';
  
  private pollingSubscription: Subscription | null = null;
  
  socialNetworks = ['TikTok', 'Facebook', 'Instagram', 'LinkedIn', 'WhatsApp'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatbotService: ChatbotService 
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();
    this.loadConversationMessages(true);
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  loadConversationMessages(shouldScroll: boolean = false): void {
    if (!this.activeConversationId) return;

    this.chatbotService.getConversationHistory(this.activeConversationId).subscribe({
      next: (data) => {
        this.messages = data.messages || []; 
        
        if (shouldScroll) {
          setTimeout(() => this.scrollToBottom(), 100);
        }
      },
      error: (err) => {
        console.error('Error cargando mensajes:', err);
      }
    });
  }

  sendMessage(): void {
    const prompt = this.currentPrompt.trim();
    if (!prompt || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.currentPrompt = ''; 

    this.chatbotService.sendMessage(prompt, this.activeConversationId).subscribe({
      next: () => {
        this.loadConversationMessages(true);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al enviar mensaje:', err);
        this.isLoading = false;
      }
    });
  }

  // ⬅️ NUEVO MÉTODO para publicar en TikTok
  publishToTikTok(messageId: number): void {
    this.publishingMessageId = messageId;
    this.publishError = '';
    this.publishSuccess = '';

    this.chatbotService.publishToTikTok(messageId).subscribe({
      next: (response) => {
        console.log('✅ Publicado en TikTok:', response);
        this.publishSuccess = response.message || 'Publicado exitosamente';
        this.publishingMessageId = null;
        
        // Recargar mensajes para ver el estado actualizado
        this.loadConversationMessages(false);
        
        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => {
          this.publishSuccess = '';
        }, 3000);
      },
      error: (err) => {
        console.error('❌ Error al publicar:', err);
        this.publishError = err.error?.message || 'Error al publicar en TikTok';
        this.publishingMessageId = null;
        
        // Limpiar mensaje de error después de 5 segundos
        setTimeout(() => {
          this.publishError = '';
        }, 5000);
      }
    });
  }

  // ⬅️ NUEVO: Verificar si un mensaje puede publicarse
  canPublishToTikTok(message: any): boolean {
    return (
      message.role === 'assistant' &&
      message.content.status === 'completed' &&
      message.content.TikTok &&
      message.content.TikTok.media_info &&
      message.content.TikTok.media_info.ruta &&
      !message.content.TikTok.publicacion?.estado // No está publicado
    );
  }

  // ⬅️ NUEVO: Verificar si ya está publicado
  isPublished(message: any): boolean {
    return message.content.TikTok?.publicacion?.estado === 'publicado';
  }

  startPolling(): void {
    this.pollingSubscription = interval(4000).subscribe(() => {
      this.loadConversationMessages(false);
    });
  }

  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }
  
  scrollToBottom(): void {
    const element = document.querySelector('.chat-area');
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    if (window.innerWidth < 1024) {
      this.isSidebarOpen = false;
    } else {
      this.isSidebarOpen = true;
    }
  }

  onNewConversation(conversationId: number): void {
    console.log('Nueva conversación solicitada:', conversationId);
  }

  onConversationSelected(conversationId: number): void {
    console.log('Conversación seleccionada:', conversationId);
  }
  
}