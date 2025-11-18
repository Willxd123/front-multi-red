import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [FormsModule, CommonModule],
  providers: [ApiService],
  templateUrl: './welcome.component.html',
})
export class WelcomeComponent implements OnInit {
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
    private apiService: ApiService,
    private router: Router,
  ) {
    const token = this.apiService.getToken();
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
    this.apiService.getConnectedAccounts().subscribe({
      next: (accounts) => {
        this.connectedAccounts = accounts;
        console.log('Cuentas conectadas:', accounts);
      },
      error: (err) => {
        console.error('Error al cargar cuentas:', err);
      }
    });
  }

  /**
   * Verificar si TikTok está conectado
   */
  isTikTokConnected(): boolean {
    return this.connectedAccounts.some(account => account.provider === 'tiktok');
  }

  /**
   * Verificar si Facebook está conectado
   */
  isFacebookConnected(): boolean {
    return this.connectedAccounts.some(account => account.provider === 'facebook');
  }

  /**
   * Conectar TikTok
   */
  connectTikTok(): void {
    this.apiService.connectTikTok();
  }

  /**
   * Desconectar TikTok
   */
  disconnectTikTok(): void {
    if (confirm('¿Estás seguro de desconectar TikTok?')) {
      this.apiService.disconnectTikTok().subscribe({
        next: () => {
          console.log('TikTok desconectado');
          this.loadConnectedAccounts(); // Recargar lista
        },
        error: (err) => {
          console.error('Error al desconectar TikTok:', err);
          alert('Error al desconectar TikTok');
        }
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

  /**
   * Verificar si viene de un callback de conexión
   */
  checkConnectionCallback(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const connected = urlParams.get('connected');
    const error = urlParams.get('error');

    if (connected === 'facebook') {
      this.successMessage = '¡Facebook conectado exitosamente!';
      this.facebookConnected = true;
      // Limpiar la URL
      window.history.replaceState({}, '', '/client');
      // Cargar info de la cuenta
      setTimeout(() => this.loadFacebookAccountInfo(), 1000);
    }

    if (error === 'facebook') {
      this.errorMessage = 'Error al conectar Facebook. Intenta nuevamente.';
      // Limpiar la URL
      window.history.replaceState({}, '', '/client');
    }
  }

  /**
   * Cargar las cuentas sociales conectadas
   */
  loadSocialAccounts(): void {
    this.loadingConnection = true;
    this.apiService.getSocialAccounts().subscribe({
      next: (accounts) => {
        console.log('Cuentas sociales:', accounts);
        
        // Verificar si Facebook está conectado
        const facebook = accounts.find(acc => acc.provider === 'facebook');
        this.facebookConnected = !!facebook;
        
        // Si Facebook está conectado, cargar su información
        if (this.facebookConnected) {
          this.loadFacebookAccountInfo();
        }
        
        this.loadingConnection = false;
      },
      error: (err) => {
        console.error('Error al cargar cuentas sociales:', err);
        this.loadingConnection = false;
      }
    });
  }

  /**
   * Cargar información de la cuenta de Facebook
   */
  loadFacebookAccountInfo(): void {
    this.apiService.getFacebookAccountInfo().subscribe({
      next: (info) => {
        console.log('Info de Facebook:', info);
        this.facebookAccountInfo = info;
      },
      error: (err) => {
        console.error('Error al cargar info de Facebook:', err);
      }
    });
  }

  /**
   * Conectar Facebook
   */
  connectFacebook(): void {
    this.clearMessages();
    this.apiService.connectFacebook();
    // La redirección ocurre automáticamente
  }

  /**
   * Desconectar Facebook
   */
  disconnectFacebook(): void {
    this.clearMessages();
    if (confirm('¿Estás seguro de que quieres desconectar Facebook?')) {
      this.apiService.disconnectSocialAccount('facebook').subscribe({
        next: (response) => {
          console.log('Facebook desconectado:', response);
          this.successMessage = 'Facebook desconectado exitosamente';
          this.facebookConnected = false;
          this.facebookAccountInfo = null;
        },
        error: (err) => {
          console.error('Error al desconectar Facebook:', err);
          this.errorMessage = 'Error al desconectar Facebook';
        }
      });
    }
  }

  /**
   * Publicar en Facebook
   */
  publishToFacebook(): void {
    this.clearMessages();
    
    if (!this.postMessage.trim()) {
      this.errorMessage = 'Por favor, escribe un mensaje para publicar';
      return;
    }

    this.isPublishing = true;
    
    this.apiService.publishToFacebook(this.postMessage, this.postLink || undefined).subscribe({
      next: (response) => {
        console.log('Publicación exitosa:', response);
        this.successMessage = '¡Publicación creada exitosamente en Facebook!';
        
        // Limpiar el formulario
        this.postMessage = '';
        this.postLink = '';
        
        this.isPublishing = false;
      },
      error: (err) => {
        console.error('Error al publicar:', err);
        this.errorMessage = err.error?.message || 'Error al publicar en Facebook';
        this.isPublishing = false;
      }
    });
  }

  /**
   * Limpiar mensajes
   */
  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
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

  this.apiService.publishToTikTok(this.selectedVideo, this.tiktokCaption).subscribe({
    next: (response) => {
      console.log('✅ Video publicado en TikTok:', response);
      this.successMessage = response.message || 'Video publicado exitosamente en TikTok';
      this.isPublishingTikTok = false;
      
      // Limpiar formulario
      this.selectedVideo = null;
      this.tiktokCaption = '';
      
      // Limpiar el input de archivo
      const fileInput = document.getElementById('tiktok-video') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    },
    error: (err) => {
      console.error('❌ Error al publicar en TikTok:', err);
      this.errorMessage = err.error?.message || 'Error al publicar en TikTok';
      this.isPublishingTikTok = false;
    }
  });
}
  
  /**
   * Cerrar sesión
   */
  logout(): void {
    this.apiService.logout();
  }
}