import { Routes } from '@angular/router';
import { OrdersPageComponent } from './pages/orders/orders-page';
import { AddOrderComponent } from './orders/add-order/add-order.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guards/auth.guard';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

// Redirect already-authenticated users away from /login
const loginGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? router.createUrlTree(['/orders']) : true;
};

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: 'orders', component: OrdersPageComponent, canActivate: [authGuard] },
  { path: 'add-order', component: AddOrderComponent, canActivate: [authGuard] },
];
