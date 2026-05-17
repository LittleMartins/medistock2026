import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, limit, orderBy, runTransaction } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private firestore = inject(Firestore);
  private productsCollection = collection(this.firestore, 'products');

  // Obtener todos los productos
  getProducts(): Observable<Product[]> {
    return collectionData(this.productsCollection, { idField: 'id' }) as Observable<Product[]>;
  }

  // Obtener productos destacados
  getFeaturedProducts(): Observable<Product[]> {
    const q = query(this.productsCollection, where('destacado', '==', true), limit(4));
    return collectionData(q, { idField: 'id' }) as Observable<Product[]>;
  }

  // Obtener productos por categoría
  getProductsByCategory(categoria: string): Observable<Product[]> {
    const q = query(this.productsCollection, where('categoria', '==', categoria));
    return collectionData(q, { idField: 'id' }) as Observable<Product[]>;
  }

  // Obtener un producto por ID
  async getProductById(id: string): Promise<Product | undefined> {
    const docRef = doc(this.firestore, `products/${id}`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    return undefined;
  }

  // Operaciones de Admin
  addProduct(product: Product) {
    return addDoc(this.productsCollection, { ...product, createdAt: new Date().toISOString() });
  }

  updateProduct(id: string, data: Partial<Product>) {
    const docRef = doc(this.firestore, `products/${id}`);
    return updateDoc(docRef, data);
  }

  // Descontar stock de forma segura usando transacciones
  async discountStock(items: { productId: string, quantity: number }[]): Promise<boolean> {
    try {
      await runTransaction(this.firestore, async (transaction) => {
        const productRefs = items.map(item => doc(this.firestore, `products/${item.productId}`));
        
        // Leer todos los documentos primero
        const productDocs = [];
        for (const ref of productRefs) {
          const productDoc = await transaction.get(ref);
          if (!productDoc.exists()) {
            throw new Error(`El producto ${ref.id} no existe.`);
          }
          productDocs.push(productDoc);
        }

        // Verificar stock
        productDocs.forEach((doc, index) => {
          const currentStock = doc.data()['stock'] || 0;
          const requiredQuantity = items[index].quantity;
          if (currentStock < requiredQuantity) {
            throw new Error(`Stock insuficiente para el producto ${doc.data()['nombre']}`);
          }
        });

        // Actualizar stock
        productDocs.forEach((doc, index) => {
          const currentStock = doc.data()['stock'] || 0;
          const newStock = currentStock - items[index].quantity;
          transaction.update(doc.ref, { stock: newStock });
        });
      });
      return true;
    } catch (e) {
      console.error("Transacción fallida: ", e);
      throw e;
    }
  }

  deleteProduct(id: string) {
    const docRef = doc(this.firestore, `products/${id}`);
    return deleteDoc(docRef);
  }

  // Actualizar stock después de una compra
  async updateStock(id: string, newStock: number) {
    const docRef = doc(this.firestore, `products/${id}`);
    return updateDoc(docRef, { stock: newStock });
  }
}
