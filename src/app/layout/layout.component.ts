import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../services/chatbot.service';
import { Observable, Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [SidebarComponent, NavbarComponent, CommonModule, FormsModule],
  templateUrl: './layout.component.html',
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

    this.chatbotService
      .getConversationHistory(this.activeConversationId)
      .subscribe({
        next: (data) => {
          this.messages = data.messages || [];

          if (shouldScroll) {
            setTimeout(() => this.scrollToBottom(), 100);
          }
        },
        error: (err) => {
          console.error('Error cargando mensajes:', err);
        },
      });
  }

  sendMessage(): void {
    const prompt = this.currentPrompt.trim();
    if (!prompt || this.isLoading) return;
  
    this.isLoading = true;
    this.currentPrompt = ''; 
  
    this.chatbotService.sendMessage(prompt, this.activeConversationId).subscribe({
      next: () => {
        this.loadConversationMessages(true);
        this.isLoading = false;
        // ✅ Reiniciar polling al enviar mensaje
        this.stopPolling();
        this.startPolling();
      },
      error: (err) => {
        console.error('Error al enviar mensaje:', err);
        this.isLoading = false;
      }
    });
  }
  desactivarLoadingManual() {
    this.isLoading = false;
  }
  // ⬅️ NUEVO MÉTODO para publicar en TikTok
  publishToNetwork(messageId: number, network: string): void {
    this.publishingMessageId = messageId;
    this.publishError = '';
    this.publishSuccess = '';

    let observable: Observable<any>;

    switch (network) {
      case 'TikTok':
        observable = this.chatbotService.publishToTikTok(messageId);
        break;
      case 'Facebook':
        observable = this.chatbotService.publishToFacebook(messageId);
        break;
      case 'Instagram':
        observable = this.chatbotService.publishToInstagram(messageId);
        break;
      case 'LinkedIn': 
        observable = this.chatbotService.publishToLinkedIn(messageId);
        break;
        case 'WhatsApp': 
        observable = this.chatbotService.publishToWhatsApp(messageId);
        break;
      default:
        this.publishError = `Red social ${network} no soportada`;
        return;
    }

    observable.subscribe({
      next: (response) => {
        console.log(`✅ Publicado en ${network}:`, response);
        this.publishSuccess =
          response.message || `Publicado exitosamente en ${network}`;
        this.publishingMessageId = null;
        this.loadConversationMessages(false);

        setTimeout(() => {
          this.publishSuccess = '';
        }, 3000);
      },
      error: (err) => {
        console.error(`❌ Error al publicar en ${network}:`, err);
        this.publishError =
          err.error?.message || `Error al publicar en ${network}`;
        this.publishingMessageId = null;

        setTimeout(() => {
          this.publishError = '';
        }, 5000);
      },
    });
  }
  // ⬅️ NUEVO: Verificar si un mensaje puede publicarse
  canPublishToNetwork(message: any, network: string): boolean {
    return (
      message.role === 'assistant' &&
      message.content.status === 'completed' &&
      message.content[network] &&
      message.content[network].media_info &&
      message.content[network].media_info.ruta 
     // !message.content[network].publicacion?.estado
    );
  }

  // ⬅️ NUEVO: Verificar si ya está publicado
  isPublishedToNetwork(message: any, network: string): boolean {
    return message.content[network]?.publicacion?.estado === 'publicado';
  }

  startPolling(): void {
    this.pollingSubscription = interval(4000).subscribe(() => {
      // ✅ Solo hacer polling si hay mensajes en "processing_media"
      const hasProcessing = this.messages.some(
        msg => msg.content?.status === 'processing_media'
      );
      
      if (hasProcessing) {
        this.loadConversationMessages(false);
      } else {
        // Si ya no hay nada procesando, detener polling
        this.stopPolling();
      }
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

  /**
   * Genera URL completa para previsualizar archivos
   */
  getMediaUrl(fileName: string): string {
    return this.chatbotService.getMediaUrl(fileName);
  }

  /**
   * Extrae solo el nombre del archivo de la ruta completa
   */
  getFileName(ruta: string): string {
    if (!ruta) return '';
    // Windows: E:\path\to\file.jpg → file.jpg
    // Linux: /path/to/file.jpg → file.jpg
    return ruta.split(/[/\\]/).pop() || '';
  }

  /**
   * Maneja errores de carga de imágenes
   */
  onImageError(event: any): void {
    console.error('Error cargando imagen:', event);
    event.target.src = 'assets/placeholder.png'; // Opcional: imagen por defecto
  }
  
}
