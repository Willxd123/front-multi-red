import { CommonModule } from '@angular/common';
import { Component, HostListener, Output, EventEmitter, OnInit } from '@angular/core';
import { MultiRedService } from '../../../pages/multi-red/multi-red.service';

@Component({
  selector: 'app-dropdown-social',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown-social.component.html',
})
export class DropdownSocialComponent implements OnInit {
  
  isRedesSocialesDropdownOpen: boolean = false;
  
  @Output() closeOtherDropdowns = new EventEmitter<void>();

  connectedAccounts: any[] = [];

  constructor(private multiredService: MultiRedService) {}

  ngOnInit(): void {
    this.loadConnectedAccounts();
  }

  /**
   * Cargar cuentas conectadas desde el servicio
   */
  loadConnectedAccounts(): void {
    this.multiredService.getConnectedAccounts().subscribe({
      next: (accounts) => {
        this.connectedAccounts = accounts;
        console.log('Cuentas conectadas en dropdown:', accounts);
      },
      error: (err) => {
        console.error('Error al cargar cuentas en dropdown:', err);
      },
    });
  }

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
   * Llama a los métodos del servicio compartido
   */
  toggleSocialMedia(network: 'instagram' | 'tiktok' | 'facebook' | 'whatsapp' | 'linkedin'): void {
    const isConnected = this.isConnected(network);

    switch (network) {
      case 'tiktok':
        if (isConnected) {
          this.disconnectTikTok();
        } else {
          this.connectTikTok();
        }
        break;
      // Agregar otros casos cuando tengas los servicios
      case 'instagram':
      case 'facebook':
      case 'whatsapp':
      case 'linkedin':
        console.log(`${network} pendiente de implementar`);
        break;
    }
  }

  /**
   * Verificar si una red social está conectada
   */
  isConnected(network: string): boolean {
    return this.connectedAccounts.some(
      (account) => account.provider === network
    );
  }

  /**
   * Conectar TikTok - Usa el método del servicio
   */
  connectTikTok(): void {
    this.multiredService.connectTikTok();
  }

  /**
   * Desconectar TikTok - Usa el método del servicio
   */
  disconnectTikTok(): void {
    if (confirm('¿Estás seguro de desconectar TikTok?')) {
      this.multiredService.disconnectTikTok().subscribe({
        next: () => {
          console.log('TikTok desconectado desde dropdown');
          this.loadConnectedAccounts(); // Recargar lista
        },
        error: (err) => {
          console.error('Error al desconectar TikTok:', err);
          alert('Error al desconectar TikTok');
        },
      });
    }
  }
}