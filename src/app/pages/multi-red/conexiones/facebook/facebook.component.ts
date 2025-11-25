import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FacebookService } from './facebook.service';

@Component({
  selector: 'app-facebook',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './facebook.component.html',
  styleUrl: './facebook.component.css'
})
export class FacebookComponent {
  message: string = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private facebookService: FacebookService) {}

  /**
   * Manejar selección de archivo
   */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    
    if (file) {
      // Validar tipo de archivo
      if (!file.type.match(/image\/(jpg|jpeg|png|gif)/)) {
        this.errorMessage = 'Solo se permiten imágenes (JPG, PNG, GIF)';
        return;
      }

      // Validar tamaño (10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.errorMessage = 'La imagen no debe superar 10MB';
        return;
      }

      this.selectedFile = file;
      this.errorMessage = '';

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Limpiar archivo seleccionado
   */
  clearFile() {
    this.selectedFile = null;
    this.previewUrl = null;
  }

  /**
   * Publicar en Facebook
   */
  publishPost() {
    if (!this.message.trim()) {
      this.errorMessage = 'Debes escribir un mensaje';
      return;
    }

    if (!this.selectedFile) {
      this.errorMessage = 'Debes seleccionar una imagen';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.facebookService.publishPhoto(this.message, this.selectedFile).subscribe({
      next: (response) => {
        console.log('✅ Publicado:', response);
        this.successMessage = '¡Publicado exitosamente en Facebook!';
        this.isLoading = false;
        
        // Limpiar formulario
        this.message = '';
        this.clearFile();
      },
      error: (error) => {
        console.error('❌ Error:', error);
        this.errorMessage = error.error?.message || 'Error al publicar en Facebook';
        this.isLoading = false;
      }
    });
  }
}