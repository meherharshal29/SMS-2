import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { StudioGalleryComponent } from './components/studio-gallery/studio-gallery.component';
import { CartComponent } from './components/cart/cart.component';
import { PaymentStatusComponent } from './components/payment-status/payment-status.component';
import { RentalAllItemsComponent } from './components/rental-all-items/rental-all-items.component';
import { PackageListComponent } from './components/package-list/package-list.component';
import { PackageDetailsComponent } from './components/package-details/package-details.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { ContactFormComponent } from './components/contact-form/contact-form.component';
import { RentalDetailsComponent } from './components/rental-details/rental-details.component';
import { CameraDetailsComponent } from './components/camera-details/camera-details.component';
import { BookShootComponent } from './components/book-shoot/book-shoot.component';

// Guard Imports
import { authGuard } from './guard/auth.guard';
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'gallery', component: StudioGalleryComponent },
  { path: 'rental-all-item', component: RentalAllItemsComponent },
  { path: 'camera/:id', component: RentalDetailsComponent },
  { path: 'packages', component: PackageListComponent },
  { path: 'packages/:category', component: PackageListComponent },
  { path: 'package/:id', component: PackageDetailsComponent },
  { path: 'contact', component: ContactFormComponent },
  {
    path: 'cart',
    component: CartComponent,
    canActivate: [authGuard]
  },
  {
    path: 'checkout',
    component: CheckoutComponent,
    canActivate: [authGuard]
  },
  {
    path: 'book-shoot/:id',
    component: BookShootComponent,
    canActivate: [authGuard]
  },
  {
    path: 'status/:txnId',
    component: PaymentStatusComponent,
    canActivate: [authGuard]
  },
  {
    path: 'rental-details/:id',
    component: RentalDetailsComponent,
    canActivate: [authGuard]
  },

  // --- Auth Module (Login/Register) ---
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },

  // --- Admin Module (Auth + Admin Role Required) ---
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
  },

  // --- Wildcard Redirect ---
  { path: '**', redirectTo: '' }
];