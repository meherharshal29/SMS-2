import { Component, OnInit, HostListener, inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { filter } from 'rxjs/operators';
import { catchError, of } from 'rxjs';
import { AdminService } from '../../services/admin/admin.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  private adminService = inject(AdminService);
  private router = inject(Router);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  adminEmail: string | null = '';
  sidebarOpen: boolean = true;
  isMobile: boolean = false;
  private adminUrl = environment.apiUrl;

  // Unified state management for all dropdowns
  menuStates: { [key: string]: boolean } = {
    camera: false,
    courses: false,
    shoots: false,
    packages: false
  };

  ngOnInit(): void {
    this.checkScreenSize();

    // Load admin email from localStorage (browser only)
    if (isPlatformBrowser(this.platformId)) {
      this.adminEmail = localStorage.getItem('adminEmail');
      this.loadMenuStates();
    }

    // Auto-close sidebar on mobile after navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.isMobile) {
        this.sidebarOpen = false;
      }
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  checkScreenSize(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 992;

    // Handle transition between mobile and desktop
    if (wasMobile !== this.isMobile) {
      this.sidebarOpen = !this.isMobile;

      // Close all submenus when switching to mobile
      if (this.isMobile) {
        Object.keys(this.menuStates).forEach(key => {
          this.menuStates[key] = false;
        });
        this.saveMenuStates();
      }
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;

    // On desktop collapse to icon mode, close all submenus
    if (!this.isMobile && !this.sidebarOpen) {
      Object.keys(this.menuStates).forEach(key => {
        this.menuStates[key] = false;
      });
      this.saveMenuStates();
    }
  }

  toggleSubMenu(menu: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    console.log('Toggle submenu clicked:', menu);
    console.log('Current state:', this.menuStates[menu]);
    console.log('Sidebar open:', this.sidebarOpen);

    // On desktop: if sidebar is collapsed (icon mode), expand it first
    if (!this.isMobile && !this.sidebarOpen) {
      console.log('Expanding sidebar first...');
      this.sidebarOpen = true;

      // Open the clicked menu after sidebar expands
      setTimeout(() => {
        this.menuStates[menu] = true;
        console.log('Menu opened after delay:', menu, this.menuStates[menu]);
        this.saveMenuStates();
      }, 350); // Wait for sidebar expansion animation
    } else {
      // Toggle the menu state immediately
      this.menuStates[menu] = !this.menuStates[menu];
      console.log('Menu toggled:', menu, this.menuStates[menu]);
      this.saveMenuStates();
    }
  }

  // Save menu states to localStorage
  private saveMenuStates(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      localStorage.setItem('sidebarMenuStates', JSON.stringify(this.menuStates));
    } catch (error) {
      console.error('Error saving menu states:', error);
    }
  }

  // Load menu states from localStorage
  private loadMenuStates(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const savedStates = localStorage.getItem('sidebarMenuStates');
      if (savedStates) {
        const parsed = JSON.parse(savedStates);
        // Merge with default states to handle new menus
        this.menuStates = { ...this.menuStates, ...parsed };
        console.log('Loaded menu states:', this.menuStates);
      }
    } catch (error) {
      console.error('Error loading menu states:', error);
    }
  }

  logout(): void {
    const confirmLogout = confirm('Are you sure you want to logout?');
    if (!confirmLogout) return;

    // Simply call the service method. 
    // All the HTTP logic and Navigation is now handled there.
    this.adminService.logout();

    // Reset local component UI states
    this.adminEmail = null;
    this.menuStates = {
      camera: false,
      courses: false,
      shoots: false,
      packages: false
    };
  }

  // Helper method to get admin initials
  getAdminInitials(): string {
    if (!this.adminEmail) return 'A';

    try {
      // Try to get initials from email (e.g., john.doe@example.com -> JD)
      const emailPart = this.adminEmail.split('@')[0];
      const parts = emailPart.split('.');

      if (parts.length > 1 && parts[0].length > 0 && parts[1].length > 0) {
        // If email has dots (john.doe), use first letter of each part
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }

      // Otherwise just use first 2 letters or pad with A
      if (emailPart.length >= 2) {
        return emailPart.substring(0, 2).toUpperCase();
      } else if (emailPart.length === 1) {
        return emailPart[0].toUpperCase() + 'A';
      }

      return 'A';
    } catch (error) {
      console.error('Error generating initials:', error);
      return 'A';
    }
  }

  // Helper method to check if a menu is active (optional - for future use)
  isMenuActive(menu: string): boolean {
    return this.menuStates[menu] || false;
  }

  // Helper method to close all submenus (optional - for future use)
  closeAllSubmenus(): void {
    Object.keys(this.menuStates).forEach(key => {
      this.menuStates[key] = false;
    });
    this.saveMenuStates();
  }
}