import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InstagramService } from './instagram.service';

@Component({
  selector: 'app-instagram',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './instagram.component.html',
  styleUrl: './instagram.component.css'
})
export class InstagramComponent {
  caption: string = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private instagramService: InstagramService) {}

  /**
   * Manejar selección de archivo
   */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    
    if (file) {
      // Validar tipo de archivo (Instagram solo JPG/PNG)
      if (!file.type.match(/image\/(jpg|jpeg|png)$/)) {
        this.errorMessage = 'Solo se permiten imágenes JPG o PNG';
        return;
      }

      // Validar tamaño (8MB - límite de Instagram)
      if (file.size > 8 * 1024 * 1024) {
        this.errorMessage = 'La imagen no debe superar 8MB';
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
   * Publicar en Instagram
   */
  publishPost() {
    if (!this.caption.trim()) {
      this.errorMessage = 'Debes escribir un caption';
      return;
    }

    if (!this.selectedFile) {
      this.errorMessage = 'Debes seleccionar una imagen';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.instagramService.publishPhoto(this.caption, this.selectedFile).subscribe({
      next: (response) => {
        console.log('✅ Publicado:', response);
        this.successMessage = '¡Publicado exitosamente en Instagram!';
        this.isLoading = false;
        
        // Limpiar formulario
        this.caption = '';
        this.clearFile();
      },
      error: (error) => {
        console.error('❌ Error:', error);
        this.errorMessage = error.error?.message || 'Error al publicar en Instagram';
        this.isLoading = false;
      }
    });
  }
}