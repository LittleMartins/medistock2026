import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { LucideAngularModule, Search, Filter, ShoppingCart, SlidersHorizontal, Briefcase, TrendingDown, PhoneCall } from 'lucide-angular';
import { ToastService } from '../../components/ui/toast/toast.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  templateUrl: './proveedores.component.html'
})
export class ProveedoresComponent implements OnInit {
  private productService = inject(ProductService);
  private toastService = inject(ToastService);
  public authService = inject(AuthService);

  readonly SearchIcon = Search;
  readonly FilterIcon = Filter;
  readonly ShoppingCartIcon = ShoppingCart;
  readonly SlidersHorizontalIcon = SlidersHorizontal;
  readonly BriefcaseIcon = Briefcase;
  readonly TrendingDownIcon = TrendingDown;
  readonly PhoneCallIcon = PhoneCall;

  wholesaleProducts: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm = '';
  isLoading = true;

  ngOnInit() {
    this.productService.getProducts().subscribe(products => {
      this.wholesaleProducts = products.filter(p => p.stock >= 50); // Filtrar por aquellos que tienen buen stock
      this.filteredProducts = [...this.wholesaleProducts];
      this.isLoading = false;
    });
  }

  applyFilters() {
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      this.filteredProducts = this.wholesaleProducts.filter(p => 
        p.nombre.toLowerCase().includes(term) || 
        p.codigo.toLowerCase().includes(term)
      );
    } else {
      this.filteredProducts = [...this.wholesaleProducts];
    }
  }

  requestQuote(product: Product) {
    this.toastService.show(`Solicitud de cotización enviada para "${product.nombre}". Un asesor se pondrá en contacto.`, 'success');
  }
}