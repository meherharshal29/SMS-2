import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { StudioGalleryComponent } from './components/studio-gallery/studio-gallery.component';
import { RentalDetailsComponent } from './components/rental-details/rental-details.component';
import { CartComponent } from './components/cart/cart.component';
import { PaymentStatusComponent } from './components/payment-status/payment-status.component';
import { RentalAllItemsComponent } from './components/rental-all-items/rental-all-items.component';
import { CourseGridComponent } from './components/course-grid/course-grid.component';
import { CourseDetailComponent } from './components/course-detail/course-detail.component';
import { PackageListComponent } from './components/package-list/package-list.component';
import { PackageDetailsComponent } from './components/package-details/package-details.component';
import { authGuard } from './guard/auth.guard';
import { CheckoutComponent } from './components/checkout/checkout.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'gallery', component: StudioGalleryComponent }, // Fixed typo: gallary -> gallery
  { path: 'rental-all-item', component: RentalAllItemsComponent },
  { path: 'rental/:id', component: RentalDetailsComponent },

  // Protected Routes
  { path: 'cart', component: CartComponent, canActivate: [authGuard] },
  { path: 'status/:txnId', component: PaymentStatusComponent, canActivate: [authGuard] },

  { path: 'courses', component: CourseGridComponent },
  { path: 'course/:id', component: CourseDetailComponent },
  { path: 'packages', component: PackageListComponent },
  { path: 'packages/:category', component: PackageListComponent },
  { path: 'package/:id', component: PackageDetailsComponent },
  {
    path: 'checkout',
    component: CheckoutComponent
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },

  // Wildcard redirect (optional but recommended)
  { path: '**', redirectTo: '' }
];