import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // SSR Safety check
  if (typeof window === 'undefined') {
    return next(req);
  }

  const userToken = localStorage.getItem('token');
  const adminToken = localStorage.getItem('adminToken');

  // Intelligent Token Selection based on URL path
  const tokenToUse = req.url.includes('/admin') ? adminToken : userToken;

  if (tokenToUse) {
    // Use .trim() and verify it is a valid string to prevent "invalid token" errors
    const cleanToken = tokenToUse.replace(/['"]+/g, '').trim();

    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${cleanToken}`
      }
    });
    return next(cloned);
  }

  return next(req);
};  