import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, getDoc, getDocs, updateDoc, deleteDoc, query, orderBy, setDoc } from '@angular/fire/firestore';
import { UserData } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore = inject(Firestore);
  private usersCollection = collection(this.firestore, 'users');

  async getAllUsers(): Promise<UserData[]> {
    const q = query(this.usersCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    } as UserData));
  }

  async getUserById(uid: string): Promise<UserData | null> {
    const docRef = doc(this.firestore, `users/${uid}`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { uid: docSnap.id, ...docSnap.data() } as UserData;
    }
    return null;
  }

  async createUser(user: UserData): Promise<void> {
    const docRef = doc(this.firestore, `users/${user.uid}`);
    await setDoc(docRef, user);
  }

  async updateUser(uid: string, data: Partial<UserData>): Promise<void> {
    const docRef = doc(this.firestore, `users/${uid}`);
    await updateDoc(docRef, data);
  }

  async deleteUser(uid: string): Promise<void> {
    // Nota: Esto solo elimina el documento en Firestore, no el usuario de Firebase Auth.
    // Para eliminar de Auth se necesita Admin SDK en el backend (Cloud Functions).
    const docRef = doc(this.firestore, `users/${uid}`);
    await deleteDoc(docRef);
  }
}
