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
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),

    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top' })
    ),

    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor]) // Registering the functional interceptor
    ),

    provideAnimations(),
    provideToastr({
      timeOut: 1500, // Slightly longer to appreciate the animation
      positionClass: 'toast-top-right',
      progressBar: true,
      newestOnTop: true,
      preventDuplicates: true,
      easing: 'ease-in-out',
      easeTime: 300,
      // This allows the CSS to target the classes correctly
      toastClass: 'ngx-toastr',
      iconClasses: {
        error: 'toast-error',
        info: 'toast-info',
        success: 'toast-success',
        warning: 'toast-warning',
      },
    }),

    // Correcting the Image Loader Provider syntax
    {
      provide: IMAGE_LOADER,
      useValue: (config: ImageLoaderConfig) => {
        const src = config.src || '';
        if (src.startsWith('http')) {
          return src;
        }
        return `http://localhost:5000/uploads/${src}`;
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
    }), provideClientHydration(withEventReplay())
  ]
};