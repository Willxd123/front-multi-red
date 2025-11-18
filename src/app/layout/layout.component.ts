import { Component, OnInit, HostListener } from '@angular/core';
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [SidebarComponent, NavbarComponent, CommonModule],
  templateUrl: './layout.component.html'
})
export class LayoutComponent implements OnInit {
  isSidebarOpen = true;

  ngOnInit(): void {
    // Cerrar sidebar por defecto en pantallas pequeñas
    this.checkScreenSize();
  }

  /**
   * Alterna el estado del sidebar (abierto/cerrado)
   * Este método será llamado desde navbar y sidebar
   */
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  /**
   * Detecta cambios en el tamaño de la pantalla
   * y ajusta el sidebar automáticamente
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkScreenSize();
  }

  /**
   * Verifica el tamaño de pantalla y ajusta el sidebar
   * Cierra el sidebar en pantallas < 1024px (lg breakpoint)
   */
  private checkScreenSize(): void {
    if (window.innerWidth < 1024) {
      this.isSidebarOpen = false;
    } else {
      this.isSidebarOpen = true;
    }
  }
}