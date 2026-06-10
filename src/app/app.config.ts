import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';
import { provideToastr } from 'ngx-toastr';
import { provideLottieOptions } from 'ngx-lottie';
import { NgxUiLoaderModule, SPINNER } from 'ngx-ui-loader';
import { FormsModule } from '@angular/forms';

import { routes } from './app.routes';
import { authInterceptor } from './auth/interceptors/auth.interceptor';
// import { environment } from '../environments/environment'; // Suggested: create an environment file

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),

    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top' })
    ),

    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),

    provideAnimations(),
    provideToastr({
      timeOut: 1500,
      positionClass: 'toast-top-right',
      progressBar: true,
      newestOnTop: true,
      preventDuplicates: true,
      easing: 'ease-in-out',
      easeTime: 300,
      toastClass: 'ngx-toastr',
      iconClasses: {
        error: 'toast-error',
        info: 'toast-info',
        success: 'toast-success',
        warning: 'toast-warning',
      },
    }),

    // FIX: Updated to handle Production URLs
    {
      provide: IMAGE_LOADER,
      useValue: (config: ImageLoaderConfig) => {
        const src = config.src || '';
        if (src.startsWith('http')) {
          return src;
        }
        // Use a relative path or an environment variable so it works on Render
        // Example: `https://sms-app-a5ar.onrender.com/uploads/${src}`
        return `/uploads/${src}`;
      }
    },

    importProvidersFrom(
      FormsModule,
      NgxUiLoaderModule.forRoot({
        fgsType: SPINNER.fadingCircle,
        fgsColor: '#a78bfa',
        hasProgressBar: false,
        blur: 0
      })
    ),

    provideLottieOptions({
      player: () => import('lottie-web')
    }),

    // REMOVED: provideClientHydration(withEventReplay()) 
    // This was causing the "ErrorEvent is not defined" error during build.
  ]
};