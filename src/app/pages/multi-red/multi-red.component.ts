import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiRedService } from './multi-red.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-multi-red',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './multi-red.component.html',
})
export class MultiRedComponent implements OnInit {
  // Estado de conexión
  facebookConnected: boolean = false;
  loadingConnection: boolean = false;

  // Información de la cuenta de Facebook
  facebookAccountInfo: any = null;

  // Formulario de publicación
  postMessage: string = '';
  postLink: string = '';
  isPublishing: boolean = false;

  // Mensajes de notificación
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private multiredService: MultiRedService,
    private router: Router
  ) {
    const token = this.multiredService.getToken;
    console.log('Token en WelcomeComponent:', token);
    if (!token) {
      this.router.navigate(['']); // Si no hay token, redirigir al login
    }
  }

  // Lista de cuentas conectadas
  connectedAccounts: any[] = [];

  ngOnInit(): void {
    this.loadConnectedAccounts();
    this.checkConnectionStatus();
  }

  /**
   * Cargar las cuentas sociales conectadas
   */
  loadConnectedAccounts(): void {
    this.multiredService.getConnectedAccounts().subscribe({
      next: (accounts) => {
        this.connectedAccounts = accounts;
        console.log('Cuentas conectadas:', accounts);
      },
      error: (err) => {
        console.error('Error al cargar cuentas:', err);
      },
    });
  }

  /**
   * Verificar si TikTok está conectado
   */
  isTikTokConnected(): boolean {
    return this.connectedAccounts.some(
      (account) => account.provider === 'tiktok'
    );
  }

  /**
   * Conectar TikTok
   */
  connectTikTok(): void {
    this.multiredService.connectTikTok();
  }

  /**
   * Desconectar TikTok
   */
  disconnectTikTok(): void {
    if (confirm('¿Estás seguro de desconectar TikTok?')) {
      this.multiredService.disconnectTikTok().subscribe({
        next: () => {
          console.log('TikTok desconectado');
          this.loadConnectedAccounts(); // Recargar lista
        },
        error: (err) => {
          console.error('Error al desconectar TikTok:', err);
          alert('Error al desconectar TikTok');
        },
      });
    }
  }

  /**
   * Verificar si viene de una conexión exitosa
   */
  checkConnectionStatus(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const connected = urlParams.get('connected');

    if (connected === 'tiktok') {
      console.log('✅ TikTok conectado exitosamente');
      this.loadConnectedAccounts(); // Recargar cuentas
      // Limpiar URL
      window.history.replaceState({}, document.title, '/client');
    }
  }

  // Variables para TikTok
  selectedVideo: File | null = null;
  tiktokCaption: string = '';
  isPublishingTikTok: boolean = false;

  /**
   * Manejar selección de video
   */
  onVideoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar que sea un video
      if (!file.type.match(/video\/(mp4|mov|avi|quicktime)/)) {
        alert('Solo se permiten archivos de video (mp4, mov, avi)');
        return;
      }

      // Validar tamaño (500MB máximo)
      if (file.size > 500 * 1024 * 1024) {
        alert('El video no debe superar los 500MB');
        return;
      }

      this.selectedVideo = file;
      console.log('Video seleccionado:', file.name);
    }
  }

  /**
   * Publicar en TikTok
   */
  publishToTikTok(): void {
    if (!this.selectedVideo) {
      alert('Selecciona un video primero');
      return;
    }

    if (!this.tiktokCaption.trim()) {
      alert('Escribe una descripción para el video');
      return;
    }

    this.isPublishingTikTok = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.multiredService
      .publishToTikTok(this.selectedVideo, this.tiktokCaption)
      .subscribe({
        next: (response) => {
          console.log('✅ Video publicado en TikTok:', response);
          this.successMessage =
            response.message || 'Video publicado exitosamente en TikTok';
          this.isPublishingTikTok = false;

          // Limpiar formulario
          this.selectedVideo = null;
          this.tiktokCaption = '';

          // Limpiar el input de archivo
          const fileInput = document.getElementById(
            'tiktok-video'
          ) as HTMLInputElement;
          if (fileInput) fileInput.value = '';
        },
        error: (err) => {
          console.error('❌ Error al publicar en TikTok:', err);
          this.errorMessage =
            err.error?.message || 'Error al publicar en TikTok';
          this.isPublishingTikTok = false;
        },
      });
  }

  /**
   * Cerrar sesión
   */
  /* logout(): void {
    this.multiredService.logout();
  } */
}
