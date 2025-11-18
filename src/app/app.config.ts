import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApiService } from './services/api.service';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { authInterceptor } from './auth/interceptors/auth.interceptor';
const config: SocketIoConfig = { url: 'http://localhost:3000', options: {} };

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection(
    { eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(
      withFetch(), //global
      withInterceptors([authInterceptor])
    ),
    ApiService,
    {
      provide: SocketIoModule,
      useFactory: () => SocketIoModule.forRoot(config),
    },
  ]
};
