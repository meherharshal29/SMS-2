import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { map, of, catchError, take } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Check synchronous state first to speed up navigation
  if (authService.isLoggedIn()) {
    return true;
  }

  // 2. If state is unknown, sync with the server
  return authService.syncProfile().pipe(
    take(1),
    map(res => {
      if (res && res.success) {
        return true;
      }

      // 3. Not authenticated: Redirect to login with returnUrl
      // This creates a UrlTree, which is the proper way to redirect in a guard
      return router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
    }),
    catchError(() => {
      // 4. Handle API errors (like 401 Unauthorized) by redirecting to login
      return of(router.createUrlTree(['/auth/login']));
    })
  );
};