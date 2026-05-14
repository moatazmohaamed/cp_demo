import { Routes } from '@angular/router';
import { OrdersPageComponent } from './pages/orders/orders-page';

export const routes: Routes = [
  { path: '', redirectTo: 'orders', pathMatch: 'full' },
  { path: 'orders', component: OrdersPageComponent },
];
