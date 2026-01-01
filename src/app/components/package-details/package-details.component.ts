import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PackageService } from '../../services/package/package.service';
import { FooterComponent } from "../../common/footer/footer.component";

@Component({
  selector: 'app-package-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent],
  templateUrl: './package-details.component.html',
  styleUrl: './package-details.component.scss'
})
export class PackageDetailsComponent implements OnInit {
  package: any;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private packageService: PackageService
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0); // Start at top
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.packageService.getPackageById(id).subscribe({
        next: (res) => {
          this.package = res.data;
          this.loading = false;
        },
        error: (err) => console.error(err)
      });
    }
  }
}