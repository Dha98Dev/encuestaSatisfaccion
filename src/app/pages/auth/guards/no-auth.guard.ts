import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/Auth.service';

export const noAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return true;
  }

  if (authService.isAdmin()) {
    router.navigate(['/a/estadistica']);
  } else {
    router.navigate(['/subjefatura/enviar-encuesta']);
  }

  return false;
};