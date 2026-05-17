import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';

export interface AppSettings {
  storeName: string;
  contactEmail: string;
  supportPhone: string;
  currency: string;
  taxRate: number;
  lowStockThreshold: number;
  enableEmails: boolean;
  maintenanceMode: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private firestore = inject(Firestore);
  private settingsDocId = 'general_settings';

  async getSettings(): Promise<AppSettings> {
    const docRef = doc(this.firestore, `settings/${this.settingsDocId}`);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as AppSettings;
    }
    
    // Default settings
    return {
      storeName: 'Medistock',
      contactEmail: 'soporte@medistock.cl',
      supportPhone: '+56900000000',
      currency: 'CLP',
      taxRate: 19,
      lowStockThreshold: 10,
      enableEmails: true,
      maintenanceMode: false
    };
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    const docRef = doc(this.firestore, `settings/${this.settingsDocId}`);
    await setDoc(docRef, settings, { merge: true });
  }
}
