import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../components/ui/toast/toast.component';
import { Product } from '../../models/product.model';
import { LucideAngularModule, Search, Filter, ShoppingCart, SlidersHorizontal, ChevronDown } from 'lucide-angular';
import { switchMap, tap } from 'rxjs/operators';
import { Observable, combineLatest, BehaviorSubject, of } from 'rxjs';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  readonly SearchIcon = Search;
  readonly FilterIcon = Filter;
  readonly ShoppingCartIcon = ShoppingCart;
  readonly SlidersHorizontalIcon = SlidersHorizontal;
  readonly ChevronDownIcon = ChevronDown;

  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  paginatedProducts: Product[] = [];
  
  searchTerm = '';
  selectedCategory = 'todas';
  categoryFilter = 'todas';
  sortOrder = 'asc';

  // Pagination
  currentPage = 1;
  itemsPerPage = 8;
  totalPages = 1;
  Math = Math;

  categories = [
    { value: 'todas', label: 'Todas las Categorías' },
    { value: 'equipamiento', label: 'Equipamiento Médico' },
    { value: 'descartables', label: 'Material Descartable' },
    { value: 'instrumental', label: 'Instrumental Quirúrgico' },
    { value: 'farmacia', label: 'Insumos de Farmacia' }
  ];

  isLoading = true;
  toastMessage = '';

  ngOnInit() {
    this.route.queryParams.pipe(
      tap((params: any) => {
        if (params['categoria']) {
          this.categoryFilter = params['categoria'];
        }
      }),
      switchMap(() => this.productService.getProducts())
    ).subscribe((products: Product[]) => {
      this.allProducts = products;
      this.applyFilters();
      this.isLoading = false;
    });
  }

  applyFilters() {
    let result = [...this.allProducts];

    // Filter by Category
    if (this.selectedCategory !== 'todas') {
      result = result.filter(p => p.categoria === this.selectedCategory);
    }

    // Filter by Search Term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p => 
        p.nombre.toLowerCase().includes(term) || 
        p.codigo.toLowerCase().includes(term)
      );
    }

    // Sort by Price
    result.sort((a, b) => {
      if (this.sortOrder === 'asc') return a.precio - b.precio;
      return b.precio - a.precio;
    });

    this.filteredProducts = result;
    this.currentPage = 1; // Reset on new filter
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.max(1, Math.ceil(this.filteredProducts.length / this.itemsPerPage));
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product, 1);
    this.toastMessage = `¡${product.nombre} añadido al carrito!`;
    setTimeout(() => this.toastMessage = '', 3000);
    this.toastService.show(`Se añadió "${product.nombre}" al carrito.`, 'success');
  }
}
