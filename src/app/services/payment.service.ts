import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, serverTimestamp } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PaymentLog {
  id?: string;
  userId: string;
  userEmail: string;
  amount: number;
  status: 'approved' | 'rejected' | 'cancelled' | 'error';
  buyOrder?: string;
  token?: string;
  date: any;
  method: string;
  details?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private firestore = inject(Firestore);
  private http = inject(HttpClient);
  private paymentsCollection = collection(this.firestore, 'payments');

  private apiUrl = 'https://initwebpaytransaction-v7z6sqj6va-uc.a.run.app';

  initWebpay(buyOrder: string, sessionId: string, amount: number): Observable<any> {
    const returnUrl = window.location.origin + '/checkout';
    return this.http.post(this.apiUrl, {
      buyOrder,
      sessionId,
      amount,
      returnUrl
    });
  }

  async logPayment(payment: Omit<PaymentLog, 'id' | 'date'>) {
    try {
      await addDoc(this.paymentsCollection, {
        ...payment,
        date: serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging payment', error);
    }
  }
}
