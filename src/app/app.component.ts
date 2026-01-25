import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { NavbarComponent } from './common/navbar/navbar.component';
import { NgxUiLoaderModule } from "ngx-ui-loader";
import { SidebarComponent } from "./admin/components/sidebar/sidebar.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    NgxUiLoaderModule,
    SidebarComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'NagpurProperty';
  showSidebar = false;
  showNavbar = true;

  private routerSubscription!: Subscription;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any
  ) { }

  ngOnInit(): void {
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.url;

        if (isPlatformBrowser(this.platformId)) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        if (url.includes('/admin')) {
          this.showNavbar = false;
          this.showSidebar = false;
        } else if (url.startsWith('/admin')) {
          this.showNavbar = false;
          this.showSidebar = true;
        } else {
          this.showNavbar = true;
          this.showSidebar = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }
}