import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { ProductService } from '../../../services/product.service';
import { OrderService } from '../../../services/order.service';
import { UserService } from '../../../services/user.service';
import { SettingsService } from '../../../services/settings.service';
import { Product } from '../../../models/product.model';
import { Order } from '../../../models/order.model';
import { UserData } from '../../../services/auth.service';
import { LucideAngularModule, DollarSign, Package, ShoppingBag, AlertTriangle, TrendingUp, Users, Calendar, CreditCard, Check } from 'lucide-angular';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  private productService = inject(ProductService);
  private orderService = inject(OrderService);
  private userService = inject(UserService);
  private settingsService = inject(SettingsService);

  readonly DollarSignIcon = DollarSign;
  readonly PackageIcon = Package;
  readonly ShoppingBagIcon = ShoppingBag;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly TrendingUpIcon = TrendingUp;
  readonly UsersIcon = Users;
  readonly CalendarIcon = Calendar;
  readonly CreditCardIcon = CreditCard;
  readonly CheckIcon = Check;

  totalProducts = 0;
  totalOrders = 0;
  totalRevenue = 0;
  lowStockCount = 0;
  dailyOrdersCount = 0;
  totalUsers = 0;
  monthlyRevenue = 0;
  averageTicket = 0;
  
  recentOrders: Order[] = [];
  recentPayments: Order[] = [];
  lowStockProducts: Product[] = [];
  topSellingProducts: { name: string, sales: number }[] = [];

  isLoading = true;

  // Chart properties
  public salesChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      { data: [], label: 'Ingresos ($)', backgroundColor: '#3b82f6', borderRadius: 4 }
    ]
  };
  public salesChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  async ngOnInit() {
    try {
      // Settings stats
      const settings = await this.settingsService.getSettings();
      const threshold = settings.lowStockThreshold || 10;

      // Products stats
      this.productService.getProducts().subscribe(products => {
        this.totalProducts = products.length;
        // Solo productos con stock bajo (usando configuración)
        const lowStock = products.filter(p => p.stock <= threshold);
        this.lowStockCount = lowStock.length;
        this.lowStockProducts = lowStock.slice(0, 5);
      });

      // Users stats
      const users = await this.userService.getAllUsers();
      this.totalUsers = users.length;

      // Orders stats
      const orders = await this.orderService.getAllOrders();
      this.totalOrders = orders.length;
      
      // Ingresos totales (pedidos pagados, enviados, entregados)
      const paidOrders = orders.filter(o => o.estado !== 'pendiente' && o.estado !== 'cancelado');
      this.totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);
      
      if (paidOrders.length > 0) {
        this.averageTicket = this.totalRevenue / paidOrders.length;
      }
      
      // Pedidos del día y mes
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      this.dailyOrdersCount = orders.filter(o => {
        const dateObj = o.fecha instanceof Date ? o.fecha : (o.fecha as any).toDate ? (o.fecha as any).toDate() : new Date(o.fecha);
        return dateObj >= today;
      }).length;

      this.monthlyRevenue = paidOrders.filter(o => {
        const dateObj = o.fecha instanceof Date ? o.fecha : (o.fecha as any).toDate ? (o.fecha as any).toDate() : new Date(o.fecha);
        return dateObj >= firstDayOfMonth;
      }).reduce((sum, order) => sum + order.total, 0);

      // Últimos pedidos y pagos
      const sortedOrders = [...orders].sort((a, b) => {
        const dateA = a.fecha instanceof Date ? a.fecha.getTime() : (a.fecha as any).toDate ? (a.fecha as any).toDate().getTime() : new Date(a.fecha).getTime();
        const dateB = b.fecha instanceof Date ? b.fecha.getTime() : (b.fecha as any).toDate ? (b.fecha as any).toDate().getTime() : new Date(b.fecha).getTime();
        return dateB - dateA;
      });
      
      this.recentOrders = sortedOrders.slice(0, 5);
      
      // Mostrar como pagos recientes todos los que sean distintos de 'pendiente' y 'cancelado' (pagado, preparando, enviado, entregado)
      this.recentPayments = sortedOrders.filter(o => o.estado !== 'pendiente' && o.estado !== 'cancelado').slice(0, 5);

      // Productos más vendidos
      const productSales: Record<string, number> = {};
      paidOrders.forEach(order => {
        order.items.forEach(item => {
          productSales[item.nombre] = (productSales[item.nombre] || 0) + item.cantidad;
        });
      });
      
      this.topSellingProducts = Object.entries(productSales)
        .map(([name, sales]) => ({ name, sales }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);
      
      this.prepareChartData(orders);
    } catch (error) {
      console.error('Error loading dashboard stats', error);
    } finally {
      this.isLoading = false;
    }
  }

  prepareChartData(orders: Order[]) {
    // Group orders by date (last 7 days)
    const last7Days = Array.from({length: 7}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const salesByDate: Record<string, number> = {};
    last7Days.forEach(date => salesByDate[date] = 0);

    // Solo considerar pedidos pagados para los ingresos
    const paidOrders = orders.filter(o => o.estado !== 'pendiente' && o.estado !== 'cancelado');

    paidOrders.forEach(order => {
      if (!order.fecha) return;
      try {
        const dateObj = order.fecha instanceof Date ? order.fecha : (order.fecha as any).toDate ? (order.fecha as any).toDate() : new Date(order.fecha);
        if (isNaN(dateObj.getTime())) return;
        
        const dateStr = dateObj.toISOString().split('T')[0];
        if (salesByDate[dateStr] !== undefined) {
          salesByDate[dateStr] += order.total;
        }
      } catch (e) {
        console.warn('Error parsing date for order:', order.id, e);
      }
    });

    this.salesChartData = {
      labels: last7Days.map(date => {
        const [y, m, d] = date.split('-');
        return `${d}/${m}`;
      }),
      datasets: [
        { 
          data: Object.values(salesByDate), 
          label: 'Ingresos ($)', 
          backgroundColor: '#3b82f6', 
          borderColor: '#2563eb',
          borderWidth: 1,
          borderRadius: 4 
        }
      ]
    };
  }
}
