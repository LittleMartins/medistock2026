import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, query, orderBy, getDocs, limit, where } from '@angular/fire/firestore';

export interface InventoryLog {
  id?: string;
  productId: string;
  productName: string;
  change: number; // + or -
  reason: 'manual_entry' | 'sale' | 'return' | 'adjustment';
  orderId?: string;
  date: string;
  adminEmail?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private firestore = inject(Firestore);
  private logsCollection = collection(this.firestore, 'inventory_logs');

  async logMovement(log: Omit<InventoryLog, 'id'>) {
    return addDoc(this.logsCollection, log);
  }

  async getLogs(limitCount = 50): Promise<InventoryLog[]> {
    const q = query(this.logsCollection, orderBy('date', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryLog));
  }

  async getLogsByProduct(productId: string): Promise<InventoryLog[]> {
    const q = query(this.logsCollection, where('productId', '==', productId), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryLog));
  }
}
