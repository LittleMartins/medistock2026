import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, collectionData } from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { Wishlist, WishlistItem } from '../models/wishlist.model';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private firestore = inject(Firestore);
  private wishlistCollection = collection(this.firestore, 'wishlists');

  // Obtener wishlist de un usuario
  getWishlist(userId: string): Observable<Wishlist | null> {
    const docRef = doc(this.firestore, `wishlists/${userId}`);
    return from(getDoc(docRef).then(snap => {
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Wishlist;
      }
      return null;
    }));
  }

  // Crear o inicializar wishlist
  async initializeWishlist(userId: string): Promise<void> {
    const docRef = doc(this.firestore, `wishlists/${userId}`);
    const snap = await getDoc(docRef);
    
    if (!snap.exists()) {
      await setDoc(docRef, {
        userId,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }

  // Agregar producto a wishlist
  async addToWishlist(userId: string, productId: string): Promise<void> {
    await this.initializeWishlist(userId);
    const docRef = doc(this.firestore, `wishlists/${userId}`);
    
    const item: WishlistItem = {
      productId,
      addedAt: new Date().toISOString()
    };
    
    await updateDoc(docRef, {
      items: arrayUnion(item),
      updatedAt: new Date().toISOString()
    });
  }

  // Eliminar producto de wishlist
  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    const docRef = doc(this.firestore, `wishlists/${userId}`);
    const snap = await getDoc(docRef);
    
    if (snap.exists()) {
      const data = snap.data() as Wishlist;
      const itemToRemove = data.items.find(i => i.productId === productId);
      
      if (itemToRemove) {
        await updateDoc(docRef, {
          items: arrayRemove(itemToRemove),
          updatedAt: new Date().toISOString()
        });
      }
    }
  }

  // Verificar si un producto está en wishlist
  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const docRef = doc(this.firestore, `wishlists/${userId}`);
    const snap = await getDoc(docRef);
    
    if (snap.exists()) {
      const data = snap.data() as Wishlist;
      return data.items.some(i => i.productId === productId);
    }
    return false;
  }
}
