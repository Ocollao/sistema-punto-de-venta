import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./core/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'productos',
        loadComponent: () => import('./features/productos/productos.component').then(m => m.ProductosComponent),
      },
      {
        path: 'categorias',
        loadComponent: () => import('./features/categorias/categorias.component').then(m => m.CategoriasComponent),
      },
      {
        path: 'caja',
        loadComponent: () => import('./features/caja/caja.component').then(m => m.CajaComponent),
      },
      {
        path: 'ventas',
        loadComponent: () => import('./features/ventas/ventas.component').then(m => m.VentasComponent),
      },
      {
        path: 'stock',
        loadComponent: () => import('./features/stock/stock.component').then(m => m.StockComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
