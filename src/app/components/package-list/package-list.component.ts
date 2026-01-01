import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PackageService } from '../../services/package/package.service';
import { FooterComponent } from "../../common/footer/footer.component";

@Component({
  selector: 'app-package-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent],
  templateUrl: './package-list.component.html',
  styleUrl: './package-list.component.scss'
})
export class PackageListComponent implements OnInit {
  packages: any[] = [];
  categories = ['All', 'Photography', 'Videography', 'Drone', 'Full Wedding'];
  activeCategory = 'All';

  constructor(private packageService: PackageService) { }

  ngOnInit(): void {
    this.filterPackages('All');
  }

  filterPackages(category: string) {
    this.activeCategory = category;
    if (category === 'All') {
      this.packageService.getAllPackages().subscribe({
        next: (res) => this.packages = res.data,
        error: (err) => console.error('Error fetching all packages', err)
      });
    } else {
      this.packageService.getPackagesByCategory(category).subscribe({
        next: (res) => this.packages = res.data,
        error: (err) => console.error(`Error fetching ${category} packages`, err)
      });
    }
  }
}