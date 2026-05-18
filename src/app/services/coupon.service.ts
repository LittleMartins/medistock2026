import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { Coupon } from '../models/coupon.model';

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private firestore = inject(Firestore);
  private couponsCollection = collection(this.firestore, 'coupons');

  // Obtener todos los cupones (admin)
  getAllCoupons(): Observable<Coupon[]> {
    return collectionData(this.couponsCollection, { idField: 'id' }) as Observable<Coupon[]>;
  }

  // Obtener cupón por código
  async getCouponByCode(code: string): Promise<Coupon | null> {
    const q = query(this.couponsCollection, where('code', '==', code.toUpperCase()));
    const snapshot = await collectionData(q, { idField: 'id' }).toPromise();
    
    if (snapshot && snapshot.length > 0) {
      const coupon = snapshot[0] as Coupon;
      
      // Validar si el cupón es válido
      if (this.isCouponValid(coupon)) {
        return coupon;
      }
    }
    return null;
  }

  // Validar cupón
  isCouponValid(coupon: Coupon): boolean {
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);
    
    // Verificar fechas
    if (now < validFrom || now > validUntil) {
      return false;
    }
    
    // Verificar si está activo
    if (!coupon.active) {
      return false;
    }
    
    // Verificar límite de uso
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return false;
    }
    
    return true;
  }

  // Calcular descuento
  calculateDiscount(coupon: Coupon, subtotal: number): number {
    let discount = 0;
    
    if (coupon.discountType === 'percentage') {
      discount = subtotal * (coupon.discountValue / 100);
    } else {
      discount = coupon.discountValue;
    }
    
    // Aplicar máximo descuento si existe
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
    
    // Aplicar mínimo de compra si existe
    if (coupon.minPurchase && subtotal < coupon.minPurchase) {
      return 0;
    }
    
    return discount;
  }

  // Usar cupón (incrementar contador)
  async useCoupon(couponId: string): Promise<void> {
    const docRef = doc(this.firestore, `coupons/${couponId}`);
    const snap = await getDoc(docRef);
    
    if (snap.exists()) {
      const currentData = snap.data() as Coupon;
      await updateDoc(docRef, {
        usedCount: (currentData.usedCount || 0) + 1,
        updatedAt: new Date().toISOString()
      });
    }
  }

  // Crear cupón (admin)
  createCoupon(coupon: Omit<Coupon, 'id' | 'usedCount' | 'createdAt'>) {
    const newCoupon: Omit<Coupon, 'id'> = {
      ...coupon,
      code: coupon.code.toUpperCase(),
      usedCount: 0,
      createdAt: new Date().toISOString()
    };
    return addDoc(this.couponsCollection, newCoupon);
  }

  // Actualizar cupón (admin)
  updateCoupon(id: string, data: Partial<Coupon>) {
    const docRef = doc(this.firestore, `coupons/${id}`);
    return updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  }

  // Eliminar cupón (admin)
  deleteCoupon(id: string) {
    const docRef = doc(this.firestore, `coupons/${id}`);
    return deleteDoc(docRef);
  }
}
