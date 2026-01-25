import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener, signal } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
  imports: [RouterOutlet, CommonModule]
})
export class AdminLayoutComponent implements OnInit {
  sidebarOpen = true;
  isMobile = false;
  adminEmail = 'admin@nagpurproperty.com';

  constructor(private router: Router) {
    // Auto-close sidebar on mobile after clicking a link
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.isMobile) this.sidebarOpen = false;
    });
  }

  ngOnInit() {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 992;
    // On Desktop keep open, on Mobile start closed
    this.sidebarOpen = !this.isMobile;
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout() {
    if (confirm('Terminate secure session?')) {
      // Logic for logout
      this.router.navigate(['/login']);
    }
  }
}