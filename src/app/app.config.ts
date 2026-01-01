import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { provideLottieOptions } from 'ngx-lottie';
import { NgxUiLoaderModule, SPINNER } from 'ngx-ui-loader';
import { FormsModule } from '@angular/forms';

import { routes } from './app.routes';
import { authInterceptor } from './auth/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),

    provideAnimations(),
    provideToastr({ timeOut: 1500, positionClass: 'toast-top-right', progressBar: true }),

    importProvidersFrom(
      FormsModule,
      NgxUiLoaderModule.forRoot({
        fgsType: SPINNER.fadingCircle,
        fgsColor: '#a78bfa',
        hasProgressBar: false,
        blur: 0
      })
    ),

    provideLottieOptions({ player: () => import('lottie-web') })
  ]
};