import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models/order.model';
import { LucideAngularModule, Package, Clock, CheckCircle, XCircle, ChevronRight, ShoppingBag } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './mis-pedidos.component.html'
})
export class MisPedidosComponent implements OnInit {
  private authService = inject(AuthService);
  private orderService = inject(OrderService);

  readonly PackageIcon = Package;
  readonly ClockIcon = Clock;
  readonly CheckCircleIcon = CheckCircle;
  readonly XCircleIcon = XCircle;
  readonly ChevronRightIcon = ChevronRight;
  readonly ShoppingBagIcon = ShoppingBag;

  orders: Order[] = [];
  isLoading = true;

  async ngOnInit() {
    try {
      const user = await firstValueFrom(this.authService.currentUser$);
      if (user) {
        this.orders = await this.orderService.getUserOrders(user.uid);
      }
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    } finally {
      this.isLoading = false;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pagado': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'pendiente': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'cancelado': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'enviado': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'entregado': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
    }
  }
}
