import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('adminToken');
    if (token) {
      return true;
    }
  }

  if (isPlatformBrowser(platformId)) {
    router.navigate(['/admin/login']);
  }

  return false;
};