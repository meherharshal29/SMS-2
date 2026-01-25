import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Safety check for Server Side Rendering (SSR)
  // Ensure we are in a browser environment before accessing localStorage
  if (typeof window === 'undefined') {
    return next(req);
  }

  const userToken = localStorage.getItem('token');
  const adminToken = localStorage.getItem('adminToken');

  let tokenToUse: string | null = null;

  // 2. Intelligent Token Selection
  // Select adminToken for paths containing 'admin', else default to userToken
  if (req.url.includes('/admin')) {
    tokenToUse = adminToken;
  } else {
    tokenToUse = userToken;
  }

  // 3. Clone and Authorize if a token exists
  if (tokenToUse) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${tokenToUse.trim()}`
      }
    });
    return next(cloned);
  }

  return next(req);
};