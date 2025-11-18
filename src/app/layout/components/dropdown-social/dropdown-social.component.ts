import { CommonModule } from '@angular/common';
import { Component, HostListener, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dropdown-social',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown-social.component.html',
})
export class DropdownSocialComponent {
  
  isRedesSocialesDropdownOpen: boolean = false;
  
  @Output() closeOtherDropdowns = new EventEmitter<void>();

  socialMediaConnections = {
    instagram: false,
    tiktok: false,
    facebook: false,
    whatsapp: false,
    linkedin: false
  };

  /**
   * Toggle dropdown de redes sociales
   */
  toggleRedesSocialesDropdown(): void {
    this.isRedesSocialesDropdownOpen = !this.isRedesSocialesDropdownOpen;
    if (this.isRedesSocialesDropdownOpen) {
      this.closeOtherDropdowns.emit();
    }
  }

  /**
   * Cerrar dropdown desde fuera
   */
  closeDropdown(): void {
    this.isRedesSocialesDropdownOpen = false;
  }

  /**
   * Cierra el dropdown al hacer clic fuera
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-social-container')) {
      this.isRedesSocialesDropdownOpen = false;
    }
  }

  /**
   * Toggle estado de conexión de red social
   */
  toggleSocialMedia(network: 'instagram' | 'tiktok' | 'facebook' | 'whatsapp' | 'linkedin'): void {
    this.socialMediaConnections[network] = !this.socialMediaConnections[network];
    console.log(`${network} ${this.socialMediaConnections[network] ? 'conectado' : 'desconectado'}`);
  }

  /**
   * Verificar si una red social está conectada
   */
  isConnected(network: 'instagram' | 'tiktok' | 'facebook' | 'whatsapp' | 'linkedin'): boolean {
    return this.socialMediaConnections[network];
  }
}