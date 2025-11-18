import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DropdownUserComponent } from '../dropdown-user/dropdown-user.component';
import { DropdownSocialComponent } from '../dropdown-social/dropdown-social.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, DropdownUserComponent, DropdownSocialComponent],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {

  @Input() isSidebarOpen: boolean = false;
  @Output() toggleMenu = new EventEmitter<void>();
  
  @ViewChild(DropdownUserComponent) dropdownUser!: DropdownUserComponent;
  @ViewChild(DropdownSocialComponent) dropdownSocial!: DropdownSocialComponent;

  onToggleMenu(): void {
    this.toggleMenu.emit();
  }

  /**
   * Cierra el dropdown de usuario cuando se abre el de redes sociales
   */
  onCloseSocialDropdowns(): void {
    if (this.dropdownUser) {
      this.dropdownUser.closeDropdown();
    }
  }

  /**
   * Cierra el dropdown de redes sociales cuando se abre el de usuario
   */
  onCloseUserDropdowns(): void {
    if (this.dropdownSocial) {
      this.dropdownSocial.closeDropdown();
    }
  }
}