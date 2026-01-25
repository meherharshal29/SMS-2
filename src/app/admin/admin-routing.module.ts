import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Component Imports
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { AdminUserDetailsComponent } from './components/admin-user-details/admin-user-details/admin-user-details.component';
import { AdminOrdersComponent } from './components/admin-orders/admin-orders.component';
import { MessageListComponent } from './components/messages/message-list/message-list.component';

// Camera Imports
import { AddCameraComponent } from './components/camera/add-camera/add-camera.component';
import { ViewCameraComponent } from './components/camera/view-camera/view-camera.component';
import { EditCameraComponent } from './components/camera/edit-camera/edit-camera.component';

// Package Imports
import { AddPackageComponent } from './components/package/add-package/add-package.component';
import { ViewPackageComponent } from './components/package/view-package/view-package.component';
import { EditPackageComponent } from './components/package/edit-package/edit-package.component';

// Guards
import { adminGuard } from '../guard/admin-auth.guard';
import { AdminBookingsComponent } from './components/shoot/admin-booking/admin-booking.component';
import { AdminCallsComponent } from './components/admin-calls/admin-calls.component';
import { AdminNewsletterComponent } from './components/admin-newsletter/admin-newsletter/admin-newsletter.component';

const routes: Routes = [
  {
    path: 'login',
    component: AdminLoginComponent,
    title: 'Admin Login | Smart Media'
  },
  {
    path: '',
    component: SidebarComponent,
    canActivate: [adminGuard],
    children: [
      // --- Core Admin Routes ---
      {
        path: 'dashboard',
        component: DashboardComponent,
        title: 'Dashboard | Admin'
      },

      // --- User & Order Management ---
      {
        path: 'users',
        component: UserManagementComponent,
        title: 'User Management | Admin'
      },
      {
        path: 'user-details/:id',
        component: AdminUserDetailsComponent,
        title: 'User Details | Admin'
      },
      {
        path: 'orders',
        component: AdminOrdersComponent,
        title: 'Orders Management | Admin'
      },

      // --- Camera Inventory ---
      {
        path: 'add-camera',
        component: AddCameraComponent,
        title: 'Add New Camera'
      },
      {
        path: 'view-cameras',
        component: ViewCameraComponent,
        title: 'View Camera Inventory'
      },
      {
        path: 'edit-camera/:id',
        component: EditCameraComponent,
        title: 'Edit Camera'
      },

      // --- Service Packages ---
      {
        path: 'add-package',
        component: AddPackageComponent,
        title: 'Create New Package'
      },
      {
        path: 'manage-packages',
        component: ViewPackageComponent,
        title: 'Manage Packages'
      },
      {
        path: 'edit-package/:id',
        component: EditPackageComponent,
        title: 'Edit Package'
      },

      // --- Communication & Shoot Ops ---
      {
        path: 'messages',
        component: MessageListComponent,
        title: 'Messages | Admin'
      },
      {
        path: 'admin-booking',
        component: AdminBookingsComponent,
        title: 'Shoot Bookings | Admin'
      },
      {
        path: 'admin-calls',
        component: AdminCallsComponent,
        title: 'Request Call | Admin'

      },
      {
        path: 'admin-newsletter',
        component: AdminNewsletterComponent,
        title: 'Newsletter | Admin'

      },


      // --- Default Redirect ---
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }