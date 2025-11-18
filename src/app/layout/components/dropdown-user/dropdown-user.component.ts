import { CommonModule } from '@angular/common';
import { Component, HostListener, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dropdown-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown-user.component.html',
})
export class DropdownUserComponent {
  constructor(private router: Router) {}
  
  isUserDropdownOpen: boolean = false;
  
  @Output() closeOtherDropdowns = new EventEmitter<void>();

  /**
   * Toggle dropdown de usuario
   */
  toggleUserDropdown(): void {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
    if (this.isUserDropdownOpen) {
      this.closeOtherDropdowns.emit();
    }
  }

  /**
   * Cerrar dropdown desde fuera
   */
  closeDropdown(): void {
    this.isUserDropdownOpen = false;
  }

  /**
   * Cierra el dropdown al hacer clic fuera
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-user-container')) {
      this.isUserDropdownOpen = false;
    }
  }

  /**
   * Método para cerrar sesión
   */
  cerrarSesion(): void {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      localStorage.clear();
      this.router.navigate(['/login']);
    }
  }
}