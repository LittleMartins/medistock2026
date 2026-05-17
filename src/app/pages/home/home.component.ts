import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';
import { LucideAngularModule, ShoppingCart, ArrowRight, ShieldCheck, Truck, Clock, Activity, Star } from 'lucide-angular';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  featuredProducts$!: Observable<Product[]>;
  toastMessage = '';

  readonly ShoppingCartIcon = ShoppingCart;
  readonly ArrowRightIcon = ArrowRight;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly TruckIcon = Truck;
  readonly ClockIcon = Clock;
  readonly ActivityIcon = Activity;

  ngOnInit(): void {
    this.featuredProducts$ = this.productService.getFeaturedProducts();
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product, 1);
    this.toastMessage = `Añadido ${product.nombre} al carrito`;
    setTimeout(() => {
      if (this.toastMessage) this.toastMessage = '';
    }, 1800);
  }
}
