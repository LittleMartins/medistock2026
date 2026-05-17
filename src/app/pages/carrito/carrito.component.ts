import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { CartService, CartItem } from '../../services/cart.service';
import { LucideAngularModule, Trash2, ShoppingBag, ArrowRight, Minus, Plus, ArrowLeft, Lock } from 'lucide-angular';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent {
  private cartService = inject(CartService);

  readonly Trash2Icon = Trash2;
  readonly ShoppingBagIcon = ShoppingBag;
  readonly ArrowRightIcon = ArrowRight;
  readonly MinusIcon = Minus;
  readonly PlusIcon = Plus;
  readonly ArrowLeftIcon = ArrowLeft;
  readonly LockIcon = Lock;

  cartItems$: Observable<CartItem[]> = this.cartService.cartItems$;
  total$: Observable<number> = this.cartService.cartTotal$;

  getDiscountTotal(items: CartItem[]): number {
    return items.reduce((total, item) => {
      if (item.precioOferta) {
        return total + ((item.precioNormal - item.precioOferta) * item.cantidad);
      }
      return total;
    }, 0);
  }

  getSubtotalNormal(items: CartItem[]): number {
    return items.reduce((total, item) => total + (item.precioNormal * item.cantidad), 0);
  }

  removeItem(productId: string) {
    this.cartService.removeFromCart(productId);
  }

  updateQuantity(productId: string, quantity: number) {
    if (quantity > 0) {
      this.cartService.updateQuantity(productId, quantity);
    } else {
      this.removeItem(productId);
    }
  }

  clearCart() {
    this.cartService.clearCart();
  }
}
