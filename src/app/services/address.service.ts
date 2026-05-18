import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Address } from '../models/address.model';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private firestore = inject(Firestore);
  private addressesCollection = collection(this.firestore, 'addresses');

  // Obtener todas las direcciones de un usuario
  getUserAddresses(userId: string): Observable<Address[]> {
    const q = query(
      this.addressesCollection,
      where('userId', '==', userId),
      orderBy('isDefault', 'desc'),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Address[]>;
  }

  // Agregar nueva dirección
  async addAddress(address: Omit<Address, 'id' | 'createdAt'>): Promise<string> {
    const newAddress: Omit<Address, 'id'> = {
      ...address,
      createdAt: new Date().toISOString()
    };
    
    // Si es la dirección por defecto, desmarcar las demás
    if (address.isDefault) {
      await this.unsetDefaultAddresses(address.userId);
    }
    
    const docRef = await addDoc(this.addressesCollection, newAddress);
    return docRef.id;
  }

  // Actualizar dirección
  async updateAddress(id: string, data: Partial<Address>): Promise<void> {
    const docRef = doc(this.firestore, `addresses/${id}`);
    
    // Si se está estableciendo como por defecto
    if (data.isDefault) {
      const addressDoc = await (await import('@angular/fire/firestore')).getDoc(docRef);
      if (addressDoc.exists()) {
        const addressData = addressDoc.data() as Address;
        await this.unsetDefaultAddresses(addressData.userId);
      }
    }
    
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  }

  // Eliminar dirección
  deleteAddress(id: string): Promise<void> {
    const docRef = doc(this.firestore, `addresses/${id}`);
    return deleteDoc(docRef);
  }

  // Establecer dirección por defecto
  async setDefaultAddress(userId: string, addressId: string): Promise<void> {
    await this.unsetDefaultAddresses(userId);
    const docRef = doc(this.firestore, `addresses/${addressId}`);
    await updateDoc(docRef, {
      isDefault: true,
      updatedAt: new Date().toISOString()
    });
  }

  // Desmarcar todas las direcciones como por defecto
  private async unsetDefaultAddresses(userId: string): Promise<void> {
    const q = query(this.addressesCollection, where('userId', '==', userId), where('isDefault', '==', true));
    const snapshot = await collectionData(q, { idField: 'id' }).toPromise();
    
    if (snapshot) {
      for (const addr of snapshot) {
        const docRef = doc(this.firestore, `addresses/${addr.id}`);
        await updateDoc(docRef, {
          isDefault: false,
          updatedAt: new Date().toISOString()
        });
      }
    }
  }
}
