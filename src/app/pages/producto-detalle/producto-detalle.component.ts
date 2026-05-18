import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../components/ui/toast/toast.component';
import { Product } from '../../models/product.model';
import { Review } from '../../models/review.model';
import { LucideAngularModule, ArrowLeft, ShoppingCart, Check, AlertTriangle, Truck, ChevronDown, ShieldCheck, Search, Star, Heart, MessageSquare } from 'lucide-angular';

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
  private wishlistService = inject(WishlistService);
  private reviewService = inject(ReviewService);
  private authService = inject(AuthService);
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
  readonly HeartIcon = Heart;
  readonly MessageSquareIcon = MessageSquare;

  product: Product | null = null;
  isLoading = true;
  quantity = 1;
  isInWishlist = false;
  isWishlistLoading = false;
  reviews: Review[] = [];
  reviewsLoading = true;
  showReviewForm = false;
  newReview = {
    rating: 0,
    comment: ''
  };

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const product = await this.productService.getProductById(id);
      this.product = product || null;
      this.isLoading = false;
      
      // Cargar estado de wishlist
      const userId = this.authService.currentUserValue?.uid;
      if (userId && this.product) {
        this.isInWishlist = await this.wishlistService.isInWishlist(userId, this.product.id!);
      }
      
      // Cargar reseñas
      if (this.product) {
        this.reviewService.getProductReviews(this.product.id!).subscribe(reviews => {
          this.reviews = reviews;
          this.reviewsLoading = false;
        });
      }
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

  async toggleWishlist() {
    const userId = this.authService.currentUserValue?.uid;
    if (!userId || !this.product) {
      this.toastService.show('Debes iniciar sesión para agregar a la lista de deseos', 'warning');
      return;
    }

    this.isWishlistLoading = true;
    try {
      if (this.isInWishlist) {
        await this.wishlistService.removeFromWishlist(userId, this.product.id!);
        this.toastService.show(`"${this.product.nombre}" eliminado de la lista de deseos`, 'info');
      } else {
        await this.wishlistService.addToWishlist(userId, this.product.id!);
        this.toastService.show(`"${this.product.nombre}" agregado a la lista de deseos`, 'success');
      }
      this.isInWishlist = !this.isInWishlist;
    } catch (error) {
      console.error('Error al modificar wishlist:', error);
      this.toastService.show('Error al modificar la lista de deseos', 'error');
    } finally {
      this.isWishlistLoading = false;
    }
  }

  async submitReview() {
    const userId = this.authService.currentUserValue?.uid;
    const userName = this.authService.currentUserValue?.name || 'Usuario';
    
    if (!userId || !this.product) {
      this.toastService.show('Debes iniciar sesión para dejar una reseña', 'warning');
      return;
    }

    if (this.newReview.rating < 1 || this.newReview.rating > 5) {
      this.toastService.show('Debes seleccionar una calificación', 'warning');
      return;
    }

    if (!this.newReview.comment.trim()) {
      this.toastService.show('Debes escribir un comentario', 'warning');
      return;
    }

    try {
      await this.reviewService.addReview({
        productId: this.product.id!,
        userId,
        userName,
        rating: this.newReview.rating,
        comment: this.newReview.comment
      });
      
      this.toastService.show('¡Gracias por tu reseña! Estará visible después de ser aprobada.', 'success');
      this.newReview = { rating: 0, comment: '' };
      this.showReviewForm = false;
    } catch (error) {
      console.error('Error al enviar reseña:', error);
      this.toastService.show('Error al enviar la reseña', 'error');
    }
  }

  setRating(rating: number) {
    this.newReview.rating = rating;
  }
}
