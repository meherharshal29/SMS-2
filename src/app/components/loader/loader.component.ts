import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../services/loader/loader.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
  loaderService = inject(LoaderService);

  // Helper to show integer numbers (removes decimals for the text)
  displayProgress = computed(() => Math.floor(this.loaderService.progress()));
}