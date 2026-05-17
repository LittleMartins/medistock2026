import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CartService } from '../../../services/cart.service';
import { ThemeService } from '../../../services/theme.service';
import { ProductService } from '../../../services/product.service';
import { ModalService } from '../../../components/ui/modal/modal.component';
import { LucideAngularModule, Activity, ShoppingCart, User, LogOut, Menu, X, LayoutDashboard, Moon, Sun, ChevronDown, Settings, Package, Search } from 'lucide-angular';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  public authService = inject(AuthService);
  public cartService = inject(CartService);
  public themeService = inject(ThemeService);
  private productService = inject(ProductService);
  private router = inject(Router);
  private modalService = inject(ModalService);

  isMenuOpen = false;
  isProfileOpen = false;
  
  // Búsqueda
  searchQuery = '';
  searchResults: Product[] = [];
  showSearchResults = false;
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  readonly ActivityIcon = Activity;
  readonly ShoppingCartIcon = ShoppingCart;
  readonly UserIcon = User;
  readonly LogOutIcon = LogOut;
  readonly MenuIcon = Menu;
  readonly XIcon = X;
  readonly LayoutDashboardIcon = LayoutDashboard;
  readonly MoonIcon = Moon;
  readonly SunIcon = Sun;
  readonly ChevronDownIcon = ChevronDown;
  readonly SettingsIcon = Settings;
  readonly PackageIcon = Package;
  readonly SearchIcon = Search;

  navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Productos', path: '/productos' },
    { name: 'Proveedores', path: '/proveedores' },
    { name: 'Tracking', path: '/tracking' },
  ];

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.performSearch(query);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput() {
    this.searchSubject.next(this.searchQuery);
  }

  private performSearch(query: string) {
    if (query.length < 2) {
      this.searchResults = [];
      this.showSearchResults = false;
      return;
    }

    this.productService.getProducts().subscribe(products => {
      this.searchResults = products.filter(p => 
        p.nombre.toLowerCase().includes(query.toLowerCase()) ||
        p.categoria.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      this.showSearchResults = this.searchResults.length > 0;
    });
  }

  navigateAndClose(productId: string) {
    this.router.navigate(['/producto', productId]);
    this.closeSearch();
  }

  closeSearch() {
    setTimeout(() => {
      this.showSearchResults = false;
    }, 200);
  }

  onSearchSubmit() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/productos'], { queryParams: { q: this.searchQuery } });
      this.showSearchResults = false;
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  toggleProfile() {
    this.isProfileOpen = !this.isProfileOpen;
  }

  closeProfile() {
    this.isProfileOpen = false;
  }

  async logout() {
    try {
      await this.authService.logout();
      this.closeMenu();
      this.closeProfile();
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  }

  confirmLogout() {
    this.modalService.showConfirm(
      '¿Cerrar Sesión?',
      '¿Estás seguro que deseas salir de tu cuenta? Tendrás que volver a ingresar para realizar pedidos.',
      () => this.logout()
    );
  }
}
