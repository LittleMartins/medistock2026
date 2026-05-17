import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { AuthService } from './auth.service';

export interface CartItem {
  productoId: string;
  nombre: string;
  precioNormal: number;
  precioOferta?: number;
  precio: number; // Precio efectivo (oferta si existe, sino normal)
  imagen: string;
  cantidad: number;
  stock: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  private cartItems = new BehaviorSubject<CartItem[]>(this.getCartFromStorage());
  public cartItems$ = this.cartItems.asObservable();
  
  private cartTotal = new BehaviorSubject<number>(0);
  private isInitialLoad = true;

  constructor() {
    // 1. Cargar datos iniciales del storage
    const initialItems = this.getCartFromStorage();
    this.cartItems.next(initialItems);
    this.cartTotal.next(initialItems.reduce((total, item) => total + (item.precio * item.cantidad), 0));

    // 2. Sincronizar cambios locales al localStorage y actualizar total
    this.cartItems$.subscribe(items => {
      localStorage.setItem('medistock_cart', JSON.stringify(items));
      this.cartTotal.next(items.reduce((total, item) => total + (item.precio * item.cantidad), 0));
      
      // 3. Si hay usuario y no es la carga inicial, sincronizar con Firestore
      if (!this.isInitialLoad && this.authService.currentUserValue) {
        this.saveCartToFirestore(items);
      }
    });

    // 4. Al cambiar el usuario, cargar su carrito desde Firestore
    this.authService.currentUser$.subscribe(async user => {
      if (user) {
        await this.loadCartFromFirestore(user.uid);
      } else {
        this.isInitialLoad = false;
      }
    });
  }

  private getCartFromStorage(): CartItem[] {
    try {
      const savedCart = localStorage.getItem('medistock_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      return [];
    }
  }

  private async loadCartFromFirestore(uid: string) {
    this.isInitialLoad = true;
    try {
      const cartRef = doc(this.firestore, 'carts', uid);
      const cartSnap = await getDoc(cartRef);
      
      if (cartSnap.exists()) {
        const firestoreItems = cartSnap.data()['items'] || [];
        // Si hay items en Firestore, los cargamos. Si no, mantenemos lo que haya en local
        if (firestoreItems.length > 0) {
          this.cartItems.next(firestoreItems);
        } else {
          // Si Firestore está vacío pero local tiene cosas, sincronizamos local a Firestore
          const localItems = this.cartItems.getValue();
          if (localItems.length > 0) {
            this.isInitialLoad = false; // Permitir que el siguiente save funcione
            await this.saveCartToFirestore(localItems);
            return;
          }
        }
      } else {
        // Si no hay documento en Firestore, creamos uno con el carrito local si tiene items
        const localItems = this.cartItems.getValue();
        if (localItems.length > 0) {
          this.isInitialLoad = false;
          await this.saveCartToFirestore(localItems);
          return;
        }
      }
    } catch (error) {
      console.error('Error loading cart from Firestore:', error);
    } finally {
      this.isInitialLoad = false;
    }
  }

  private async saveCartToFirestore(items: CartItem[]) {
    const user = this.authService.currentUserValue;
    if (!user) return;

    try {
      const cartRef = doc(this.firestore, 'carts', user.uid);
      await setDoc(cartRef, { 
        items,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error saving cart to Firestore:', error);
    }
  }

  addToCart(product: any, cantidad: number = 1) {
    const currentCart = this.cartItems.getValue();
    const existingItem = currentCart.find(item => item.productoId === product.id);

    if (existingItem) {
      const newCantidad = Math.min(existingItem.cantidad + cantidad, existingItem.stock);
      const updatedCart = currentCart.map(item =>
        item.productoId === product.id
          ? { ...item, cantidad: newCantidad }
          : item
      );
      this.cartItems.next(updatedCart);
    } else {
      const newItem: CartItem = {
        productoId: product.id,
        nombre: product.nombre,
        precioNormal: product.precio,
        precioOferta: product.precioOferta,
        precio: product.precioOferta ? product.precioOferta : product.precio,
        imagen: product.imagenUrl || product.imagen || '',
        cantidad: Math.min(cantidad, product.stock),
        stock: product.stock
      };
      this.cartItems.next([...currentCart, newItem]);
    }
  }

  removeFromCart(productId: string) {
    const currentItems = this.cartItems.getValue();
    this.cartItems.next(currentItems.filter(item => item.productoId !== productId));
  }

  updateQuantity(productId: string, cantidad: number) {
    if (cantidad < 1) return;
    const currentItems = this.cartItems.getValue();
    const updatedCart = currentItems.map(item =>
      item.productoId === productId
        ? { ...item, cantidad: Math.min(cantidad, item.stock) }
        : item
    );
    this.cartItems.next(updatedCart);
  }

  clearCart() {
    this.cartItems.next([]);
  }

  public cartTotal$: Observable<number> = this.cartTotal.asObservable();

  get cartTotalAmount(): number {
    return this.cartItems.getValue().reduce((total, item) => total + (item.precio * item.cantidad), 0);
  }

  get cartCount(): number {
    return this.cartItems.getValue().reduce((total, item) => total + item.cantidad, 0);
  }
}
