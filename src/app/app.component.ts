import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './common/navbar/navbar.component';
import { NgxUiLoaderModule } from "ngx-ui-loader";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    FormsModule,
    RouterOutlet,
    NavbarComponent,
    NgxUiLoaderModule
],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent { }
