import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If already logged in in memory, allow access
  if (authService.isLoggedIn()) return true;

  // Otherwise, wait for the background sync to finish before deciding
  return authService.syncProfile().pipe(
    take(1),
    map(res => {
      if (res && res.success) return true;
      router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
      return false;
    })
  );
};

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    router.navigate(['/auth/profile']);
    return false;
  }
  return true;
};