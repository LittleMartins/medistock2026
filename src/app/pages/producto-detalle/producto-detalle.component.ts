import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../components/ui/toast/toast.component';
import { Product } from '../../models/product.model';
import { LucideAngularModule, ArrowLeft, ShoppingCart, Check, AlertTriangle, Truck, ChevronDown, ShieldCheck, Search, Star } from 'lucide-angular';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule, NgClass],
  templateUrl: './producto-detalle.component.html',
  styleUrls: ['./producto-detalle.component.css']
})
export class ProductoDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private toastService = inject(ToastService);

  readonly ArrowLeftIcon = ArrowLeft;
  readonly ShoppingCartIcon = ShoppingCart;
  readonly CheckIcon = Check;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly TruckIcon = Truck;
  readonly ChevronDownIcon = ChevronDown;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly SearchIcon = Search;
  readonly StarIcon = Star;

  product: Product | null = null;
  isLoading = true;
  quantity = 1;

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const product = await this.productService.getProductById(id);
      this.product = product || null;
      this.isLoading = false;
    } else {
      this.router.navigate(['/productos']);
    }
  }

  increaseQuantity() {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {
    if (this.product) {
      this.cartService.addToCart(this.product, this.quantity);
      this.toastService.show(`Se añadieron ${this.quantity} unidades de "${this.product.nombre}" al carrito.`, 'success');
      this.quantity = 1; // reset
    }
  }
}
