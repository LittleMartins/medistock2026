import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Review } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private firestore = inject(Firestore);
  private reviewsCollection = collection(this.firestore, 'reviews');

  // Obtener reseñas aprobadas de un producto
  getProductReviews(productId: string): Observable<Review[]> {
    const q = query(
      this.reviewsCollection,
      where('productId', '==', productId),
      where('approved', '==', true),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Review[]>;
  }

  // Obtener todas las reseñas (para admin, incluyendo pendientes)
  getAllReviews(): Observable<Review[]> {
    const q = query(this.reviewsCollection, orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Review[]>;
  }

  // Agregar nueva reseña
  addReview(review: Omit<Review, 'id' | 'createdAt' | 'approved'>) {
    const newReview: Omit<Review, 'id'> = {
      ...review,
      approved: false, // Por defecto pendiente de moderación
      createdAt: new Date().toISOString()
    };
    return addDoc(this.reviewsCollection, newReview);
  }

  // Aprobar reseña (admin)
  approveReview(reviewId: string) {
    const docRef = doc(this.firestore, `reviews/${reviewId}`);
    return updateDoc(docRef, {
      approved: true,
      updatedAt: new Date().toISOString()
    });
  }

  // Eliminar reseña
  deleteReview(reviewId: string) {
    const docRef = doc(this.firestore, `reviews/${reviewId}`);
    return deleteDoc(docRef);
  }

  // Obtener promedio de rating de un producto
  async getAverageRating(productId: string): Promise<number> {
    // Esto se implementaría mejor con una Cloud Function o agregación
    // Por ahora retornamos 0 como placeholder
    return 0;
  }
}
