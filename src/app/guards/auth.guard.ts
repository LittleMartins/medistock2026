import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  // authState will wait for the initial auth state from Firebase
  return authState(auth).pipe(
    take(1),
    map(user => {
      if (user) {
        return true;
      } else {
        return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url }});
      }
    })
  );
};
