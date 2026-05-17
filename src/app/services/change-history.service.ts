import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, query, orderBy, limit, getDocs, Timestamp } from '@angular/fire/firestore';
import { ChangeHistory } from '../models/change-history.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChangeHistoryService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  async logChange(data: Omit<ChangeHistory, 'id' | 'timestamp' | 'userId' | 'userName'>): Promise<void> {
    const user = this.authService.currentUserValue;
    if (!user) return;

    const historyEntry: Omit<ChangeHistory, 'id'> = {
      ...data,
      userId: user.uid,
      userName: user.email || 'Usuario Admin',
      timestamp: new Date()
    };

    try {
      const collectionRef = collection(this.firestore, 'changeHistory');
      await addDoc(collectionRef, {
        ...historyEntry,
        timestamp: Timestamp.fromDate(historyEntry.timestamp)
      });
    } catch (error) {
      console.error('Error logging change history:', error);
    }
  }

  async getRecentChanges(limitCount: number = 50): Promise<ChangeHistory[]> {
    try {
      const q = query(
        collection(this.firestore, 'changeHistory'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data['timestamp']?.toDate() || new Date()
        } as ChangeHistory;
      });
    } catch (error) {
      console.error('Error getting recent changes:', error);
      return [];
    }
  }
}
