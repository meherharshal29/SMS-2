import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from "../../admin/admin-routing.module";

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, AdminRoutingModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}