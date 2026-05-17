import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Auth, authState } from '@angular/fire/auth';
import { map, take, filter, switchMap } from 'rxjs/operators';
import { combineLatest, of } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const auth = inject(Auth);

  return authState(auth).pipe(
    take(1),
    switchMap(user => {
      if (!user) return of(router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } }));
      
      return combineLatest([authService.userData$, authService.isAdmin$]).pipe(
        map(([userData, isAdmin]) => {
          if (!userData) return null; // Wait for userData to load
          if (isAdmin) return true;
          return router.createUrlTree(['/']);
        }),
        filter((result): result is true | ReturnType<Router['createUrlTree']> => result !== null),
        take(1)
      );
    })
  );
};
