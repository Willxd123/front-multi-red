import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  /**
   * Estado del sidebar recibido desde el componente padre
   */
  @Input() isOpen: boolean = true;

  /**
   * Evento para notificar al padre que cierre el sidebar
   */
  @Output() closeSidebar = new EventEmitter<void>();

  /**
   * Estado de carga de las conexiones
   */
  loadingConnection: boolean = false;

  /**
   * Estados de conexión de redes sociales
   */
  private tikTokConnected: boolean = false;
  private facebookConnected: boolean = false;

  /**
   * Emite el evento para cerrar el sidebar
   */
  onCloseSidebar(): void {
    this.closeSidebar.emit();
  }


 
}