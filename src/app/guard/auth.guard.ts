import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';

/**
 * Prevents unauthenticated users from accessing a route.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn$.pipe(
    take(1),
    map(isLoggedIn => {
      if (isLoggedIn) return true;
      // Redirect to login and save the attempted URL
      return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
    })
  );
};

/**
 * Prevents logged-in users from accessing login/register pages.
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn$.pipe(
    take(1),
    map(isLoggedIn => {
      if (!isLoggedIn) return true;
      return router.createUrlTree(['/']);
    })
  );
};