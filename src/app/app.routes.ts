import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProductosComponent } from './pages/productos/productos.component';
import { ProductoDetalleComponent } from './pages/producto-detalle/producto-detalle.component';
import { CarritoComponent } from './pages/carrito/carrito.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { TrackingComponent } from './pages/tracking/tracking.component';
import { LoginComponent } from './pages/auth/login.component';
import { RegisterComponent } from './pages/auth/register.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

// Admin Components
import { AdminLayoutComponent } from './pages/admin/layout/admin-layout.component';
import { AdminDashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { AdminProductosComponent } from './pages/admin/productos/admin-productos.component';
import { AdminPedidosComponent } from './pages/admin/pedidos/admin-pedidos.component';

export const routes: Routes = [
  // Rutas públicas y de cliente
  { path: '', component: HomeComponent },
  { path: 'productos', component: ProductosComponent },
  { path: 'proveedores', loadComponent: () => import('./pages/proveedores/proveedores.component').then(m => m.ProveedoresComponent) },
  { path: 'producto/:id', component: ProductoDetalleComponent },
  { path: 'carrito', component: CarritoComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'tracking', component: TrackingComponent },
  { path: 'tracking/:id', component: TrackingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },

  // Perfil de Usuario
  {
    path: 'perfil',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'ajustes', pathMatch: 'full' },
      { path: 'ajustes', loadComponent: () => import('./pages/perfil/ajustes/ajustes.component').then(m => m.AjustesComponent) },
      { path: 'mis-pedidos', loadComponent: () => import('./pages/perfil/mis-pedidos/mis-pedidos.component').then(m => m.MisPedidosComponent) }
    ]
  },

  // Rutas de Administración
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'productos', component: AdminProductosComponent },
      { path: 'pedidos', component: AdminPedidosComponent },
      { path: 'historial', loadComponent: () => import('./pages/admin/historial/admin-historial.component').then(m => m.AdminHistorialComponent) },
      { path: 'inventario', loadComponent: () => import('./pages/admin/inventario/admin-inventario.component').then(m => m.AdminInventarioComponent) },
      { path: 'usuarios', loadComponent: () => import('./pages/admin/usuarios/admin-usuarios.component').then(m => m.AdminUsuariosComponent) },
      { path: 'configuracion', loadComponent: () => import('./pages/admin/configuracion/admin-configuracion.component').then(m => m.AdminConfiguracionComponent) }
    ]
  },

  { path: '404', component: HomeComponent },
  { path: '**', redirectTo: '' }
];
