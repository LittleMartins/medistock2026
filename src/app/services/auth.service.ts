import { Injectable, inject } from '@angular/core';
import { Auth, authState, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, User, sendPasswordResetEmail } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';

export type UserRole = 'paciente' | 'institucion' | 'admin' | 'ejecutivo' | 'logistica' | 'analista' | 'user';

export interface UserData {
  uid: string;
  name: string;
  lastName?: string;
  email: string;
  rut?: string;
  role: UserRole;
  phone?: string;
  address?: string;
  telefono?: string;
  direccion?: string;
  numeroDepto?: string;
  region?: string;
  comuna?: string;
  codigoPostal?: string;
  referencias?: string;
  totalSpent?: number;
  status?: 'active' | 'blocked';
  photoUrl?: string;
  createdAt: string;
  
  // Campos adicionales para institución
  razonSocial?: string;
  empresaRut?: string;
  representanteLegal?: string;
  timbre?: boolean;
  proveedores?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private readonly adminEmailCanonical = 'Admin@admin.com';
  private readonly adminEmailNormalized = 'admin@admin.com';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private userDataSubject = new BehaviorSubject<UserData | null>(null);
  private isAdminSubject = new BehaviorSubject<boolean>(false);

  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  public userData$: Observable<UserData | null> = this.userDataSubject.asObservable();
  public isAdmin$: Observable<boolean> = this.isAdminSubject.asObservable();

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  constructor() {
    authState(this.auth).subscribe(async (user: any) => {
      this.currentUserSubject.next(user);
      if (user) {
        const authEmail = (user.email || '').toString();
        const normalizedEmail = authEmail.toLowerCase();
        const isAdmin = normalizedEmail === this.adminEmailNormalized;
        this.isAdminSubject.next(isAdmin);

        const userRef = doc(this.firestore, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          const desiredRole: UserData['role'] = isAdmin ? 'admin' : (data.role || 'user');
          const desiredEmail = isAdmin ? this.adminEmailCanonical : authEmail;

          if (data.role !== desiredRole || (data.email || '') !== desiredEmail) {
            await setDoc(userRef, { role: desiredRole, email: desiredEmail } as UserData, { merge: true });
            this.userDataSubject.next({ ...data, role: desiredRole, email: desiredEmail } as UserData);
          } else {
            this.userDataSubject.next(data);
          }
        } else {
          const email = isAdmin ? this.adminEmailCanonical : authEmail;
          const userData: UserData = {
            uid: user.uid,
            name: user.displayName || 'Usuario',
            email,
            role: isAdmin ? 'admin' : 'user',
            createdAt: new Date().toISOString()
          };
          await setDoc(userRef, userData, { merge: true });
          this.userDataSubject.next(userData);
        }
      } else {
        this.userDataSubject.next(null);
        this.isAdminSubject.next(false);
      }
    });

    this.initAdminUser();
  }

  private async initAdminUser() {
    try {
      // Intentamos iniciar sesión con el admin para ver si existe
      // Pero no podemos hacerlo de forma transparente sin afectar la sesión actual si ya hay una.
      // Solo verificamos si hay algún usuario con email admin@admin.com en Firestore.
      // Ya que no tenemos Admin SDK, lo haremos en la vista de Login si el usuario intenta crear el admin o mediante un check manual.
      // Mejor, dejaremos que el método setupAdmin() sea llamado si se necesita.
    } catch (e) {
      console.log('Admin check', e);
    }
  }

  async setupAdmin() {
    try {
      const email = this.adminEmailCanonical;
      const password = 'Admin123*';
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: 'Administrador' });
      
      const userData: UserData = {
        uid: user.uid,
        name: 'Administrador',
        email: email,
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(this.firestore, 'users', user.uid), userData);
      return true;
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        try {
          const userCredential = await signInWithEmailAndPassword(this.auth, this.adminEmailCanonical, 'Admin123*');
          const user = userCredential.user;

          const userData: UserData = {
            uid: user.uid,
            name: user.displayName || 'Administrador',
            email: this.adminEmailCanonical,
            role: 'admin',
            createdAt: new Date().toISOString()
          };

          await setDoc(doc(this.firestore, 'users', user.uid), userData, { merge: true });
          return true;
        } catch (e) {
          return true;
        }
      }
      throw error;
    }
  }

  async register(email: string, password: string, name: string, role: UserRole = 'paciente', extraData: any = {}) {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    const user = userCredential.user;
    
    await updateProfile(user, { displayName: name });
    
    const userData: UserData = {
      uid: user.uid,
      name: name,
      email: email,
      role: role,
      createdAt: new Date().toISOString(),
      ...extraData
    };
    
    await setDoc(doc(this.firestore, 'users', user.uid), userData);
    return userCredential;
  }

  async updateUserData(uid: string, additionalData: any) {
    const userRef = doc(this.firestore, 'users', uid);
    await setDoc(userRef, additionalData, { merge: true });
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  logout() {
    return signOut(this.auth);
  }

  get isAdmin(): boolean {
    return this.isAdminSubject.value;
  }
}
