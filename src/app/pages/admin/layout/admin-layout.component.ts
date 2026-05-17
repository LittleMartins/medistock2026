import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Activity, Truck, Landmark, ShieldCheck, Clock } from 'lucide-angular';
import { ProductService } from '../../../services/product.service';
import { SettingsService } from '../../../services/settings.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit {
  private productService = inject(ProductService);
  private settingsService = inject(SettingsService);
  public authService = inject(AuthService);

  readonly LayoutDashboardIcon = LayoutDashboard;
  readonly PackageIcon = Package;
  readonly ShoppingCartIcon = ShoppingCart;
  readonly UsersIcon = Users;
  readonly SettingsIcon = Settings;
  readonly LogOutIcon = LogOut;
  readonly ActivityIcon = Activity;
  readonly TruckIcon = Truck;
  readonly LandmarkIcon = Landmark;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly ClockIcon = Clock;

  lowStockCount = 0;

  async ngOnInit() {
    const settings = await this.settingsService.getSettings();
    const threshold = settings.lowStockThreshold || 10;

    this.productService.getProducts().subscribe(products => {
      this.lowStockCount = products.filter(p => p.stock <= threshold).length;
    });
  }
}
