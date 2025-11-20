import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Conversation, ConversationService } from './conversation.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  @Input() isOpen: boolean = true;
  @Input() activeConversationId: number | null = null;
  
  @Output() closeSidebar = new EventEmitter<void>();
  @Output() newConversation = new EventEmitter<number>();
  @Output() conversationSelected = new EventEmitter<number>();

  conversations: Conversation[] = [];
  isLoading: boolean = false;
  isCreatingConversation: boolean = false;

  constructor(private conversationService: ConversationService) {}

  ngOnInit(): void {
    this.loadConversations();
  }

  /**
   * Cargar lista de conversaciones
   */
  loadConversations(): void {
    this.isLoading = true;
    this.conversationService.getConversations().subscribe({
      next: (conversations) => {
        this.conversations = conversations;
        this.isLoading = false;
        console.log('📋 Conversaciones cargadas:', conversations.length);
      },
      error: (err) => {
        console.error('❌ Error al cargar conversaciones:', err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Crear nueva conversación en el backend
   */
  onNewConversation(): void {
    this.isCreatingConversation = true;
    
    this.conversationService.createConversation().subscribe({
      next: (conversation) => {
        console.log('✅ Nueva conversación creada:', conversation);
        this.newConversation.emit(conversation.id);
        this.loadConversations(); // Recargar lista
        this.isCreatingConversation = false;
      },
      error: (err) => {
        console.error('❌ Error al crear conversación:', err);
        alert('Error al crear conversación');
        this.isCreatingConversation = false;
      }
    });
  }

  /**
   * Seleccionar conversación existente
   */
  onSelectConversation(conversationId: number): void {
    this.conversationSelected.emit(conversationId);
    console.log('📂 Conversación seleccionada:', conversationId);
  }

  /**
   * Eliminar conversación
   */
  deleteConversation(conversationId: number, event: Event): void {
    event.stopPropagation(); // Prevenir que se seleccione la conversación
    
    if (!confirm('¿Estás seguro de eliminar esta conversación?')) {
      return;
    }

    console.log('🗑️ Eliminando conversación:', conversationId);

    this.conversationService.deleteConversation(conversationId).subscribe({
      next: () => {
        console.log('✅ Conversación eliminada');
        
        // Si era la conversación activa, navegar a nueva conversación
        if (this.activeConversationId === conversationId) {
          this.newConversation.emit(0); // Emitir 0 para indicar "crear nueva"
        }
        
        // Recargar lista de conversaciones
        this.loadConversations();
      },
      error: (err) => {
        console.error('❌ Error al eliminar conversación:', err);
        alert('Error al eliminar conversación');
      }
    });
  }

  /**
   * Formatear fecha de forma relativa
   */
  formatDate(date: Date | string): string {
    const now = new Date();
    const conversationDate = new Date(date);
    const diffMs = now.getTime() - conversationDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return conversationDate.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short' 
    });
  }

  /**
   * Cerrar sidebar (móvil)
   */
  onCloseSidebar(): void {
    this.closeSidebar.emit();
  }
}