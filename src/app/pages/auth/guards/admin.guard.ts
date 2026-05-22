import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/Auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // ✅ verificar login
  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }
      if (!authService.isAdmin() && authService.isLoggedIn()) {
    router.navigate(['/subjefatura/estadistica']);
    return false;
  }

  // ✅ verificar admin
  if (!authService.isAdmin()) {
    router.navigate(['/not-found']);
    return false;
  }


  return true;
};