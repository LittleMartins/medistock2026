import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { provideAppCheck, ReCaptchaEnterpriseProvider, initializeAppCheck } from '@angular/fire/app-check';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

const firebaseConfig = {
  apiKey: "AIzaSyBoxPzii0Ef3dug_q8nFKwwIxzVM-LpKRk",
  authDomain: "medistock-15247.firebaseapp.com",
  projectId: "medistock-15247",
  storageBucket: "medistock-15247.firebasestorage.app",
  messagingSenderId: "820067339577",
  appId: "1:820067339577:web:58b9dade07a6a557f46ce8",
  measurementId: "G-TV7LRN7DBF"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions()),
    provideAnimations(),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    provideCharts(withDefaultRegisterables()),
    /* 
    // App Check está causando errores 400 con la clave actual. 
    // Descomentar y usar una clave válida de reCAPTCHA Enterprise si es necesario.
    provideAppCheck(() => {
      return initializeAppCheck(undefined, {
        provider: new ReCaptchaEnterpriseProvider('6LcVv9cqAAAAAFW_y-W_m_y_W_m_y_W_m_y_W_m_y'), 
        isTokenAutoRefreshEnabled: true
      });
    })
    */
  ]
};
