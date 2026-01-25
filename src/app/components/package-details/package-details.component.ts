import { Component, OnInit, inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { PackageService } from '../../services/package/package.service';
import { FooterComponent } from "../../common/footer/footer.component";

@Component({
  selector: 'app-package-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent],
  templateUrl: './package-details.component.html',
  styleUrls: ['./package-details.component.scss']
})
export class PackageDetailsComponent implements OnInit {
  package: any = null;
  suggestedPackages: any[] = [];
  loading = true;
  showScroll = signal(false);
  isBrowser = signal(false);

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private packageService = inject(PackageService);
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    this.isBrowser.set(isPlatformBrowser(this.platformId));
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadPackageDetails(id);
      }
    });

    // Global scroll reset on navigation
    if (isPlatformBrowser(this.platformId)) {
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
    }
  }

  loadPackageDetails(id: string) {
    this.loading = true;
    this.packageService.getPackageById(id).subscribe({
      next: (res: any) => {
        const data = res.data || res;
        this.package = this.processPackageView(data);
        this.loadSuggestions(data.category, id);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching package:', err);
        this.loading = false;
      }
    });
  }

  loadSuggestions(category: string, currentId: string) {
    this.packageService.getActivePackages().subscribe({
      next: (res: any) => {
        const data = res.data || res;
        this.suggestedPackages = data
          .filter((p: any) => p.id !== currentId)
          .slice(0, 4);
      }
    });
  }

  private processPackageView(pkg: any): any {
    const inclusions: string[] = [];
    const flags = [
      { key: 'includesDrone', label: 'Aerial Drone 4K Coverage' },
      { key: 'includesCandid', label: 'Candid Photography' },
      { key: 'includesCinematicVideo', label: 'Cinematic Teaser & Highlights' },
      { key: 'includesTraditionalVideo', label: 'Full Length Traditional Video' },
      { key: 'includesPreWedding', label: 'Pre-Wedding Shoot' },
      { key: 'includesLiveStreaming', label: 'Live Streaming' },
      { key: 'includesCrane', label: 'Professional Crane/Jib' },
      { key: 'includesLedWall', label: 'On-Site LED Wall' },
      { key: 'includesGimbal', label: 'Gimbal Stabilization' },
      { key: 'includesScriptWriting', label: 'Professional Scripting' },
      { key: 'includesProfessionalLights', label: 'Studio Lighting' },
      { key: 'includesColorGrading', label: 'Cinematic Color Grading' }
    ];

    flags.forEach(f => { if (pkg[f.key]) inclusions.push(f.label); });

    try {
      const delivs = typeof pkg.deliverables === 'string' ? JSON.parse(pkg.deliverables) : pkg.deliverables;
      if (Array.isArray(delivs)) inclusions.push(...delivs);

      const album = typeof pkg.albumDetails === 'string' ? JSON.parse(pkg.albumDetails) : pkg.albumDetails;
      const albumText = (album?.size) ? `${album.size} ${album.type} Album` : '';

      return { ...pkg, allInclusions: [...new Set(inclusions)], albumDisplay: albumText };
    } catch (e) {
      return { ...pkg, allInclusions: inclusions, albumDisplay: '' };
    }
  }

    scrollToTop(): void {
    if (this.isBrowser()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}