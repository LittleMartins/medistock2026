import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, addDoc, getDoc, getDocs, updateDoc, query, where, orderBy, Timestamp, setDoc } from '@angular/fire/firestore';
import { Order } from '../models/order.model';
import { ProductService } from './product.service';
import { InventoryService } from './inventory.service';

import { EmailService } from './email.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private firestore = inject(Firestore);
  private productService = inject(ProductService);
  private inventoryService = inject(InventoryService);
  private emailService = inject(EmailService);
  private ordersCollection = collection(this.firestore, 'orders');

  private generateOrderNumber(): string {
    const min = 100000;
    const max = 999999;
    const random = Math.floor(Math.random() * (max - min + 1)) + min;
    return `ORD-2026-${random}`;
  }

  async createOrder(orderData: Omit<Order, 'id'>): Promise<string> {
    try {
      // 1. Verificar si hay items
      if (!orderData.items || orderData.items.length === 0) {
        throw new Error('El pedido no tiene items.');
      }

      // 2. Usar transacciones para descontar stock de forma segura
      const itemsToDiscount = orderData.items.map(item => ({
        productId: item.productoId,
        quantity: item.cantidad
      }));
      await this.productService.discountStock(itemsToDiscount);

      // 3. Generar ID único ORD-2026-XXXXXX
      const orderId = this.generateOrderNumber();
      
      // 4. Crear pedido con el ID personalizado
      const docRef = doc(this.firestore, `orders/${orderId}`);
      await setDoc(docRef, {
        ...orderData,
        id: orderId,
        fecha: Timestamp.fromDate(new Date()) // Convert to Firestore Timestamp
      });

      // 5. Registrar movimientos de inventario
      for (const item of orderData.items) {
        await this.inventoryService.logMovement({
          productId: item.productoId,
          productName: item.nombre,
          change: -item.cantidad,
          reason: 'sale',
          orderId: orderId,
          date: new Date().toISOString()
        });
      }

      // 6. Integración Automática con API de Logística (Shippo/Chilexpress Simulation)
      if (orderData.estado === 'pagado') {
        this.generateTrackingNumber(orderId, orderData.direccionEnvio);
      }

      return orderId;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Consume la API de logística para generar número de seguimiento
   */
  async generateTrackingNumber(orderId: string, direccion: any): Promise<void> {
    try {
      const response = await fetch('/api/logistica/crear-etiqueta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          address: direccion.direccion,
          city: direccion.comuna
        })
      });
      const data = await response.json();
      console.log('Logística integrada:', data.tracking_number);
    } catch (error) {
      console.error('Error en integración de logística:', error);
    }
  }

  async getOrderById(id: string): Promise<Order | null> {
    const docRef = doc(this.firestore, `orders/${id}`);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        fecha: data['fecha'] instanceof Timestamp ? data['fecha'].toDate() : data['fecha']
      } as Order;
    }
    return null;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    const q = query(
      this.ordersCollection, 
      where('userId', '==', userId),
      orderBy('fecha', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fecha: data['fecha'] instanceof Timestamp ? data['fecha'].toDate() : data['fecha']
      } as Order;
    });
  }

  async updateOrderStatus(orderId: string, status: Order['estado']): Promise<void> {
    const docRef = doc(this.firestore, `orders/${orderId}`);
    
    if (status === 'cancelado') {
      const order = await this.getOrderById(orderId);
      if (order && order.estado !== 'cancelado') {
        // Return stock
        const itemsToReturn = order.items.map(item => ({
          productId: item.productoId,
          quantity: -item.cantidad // negative quantity means adding stock in our transaction logic
        }));
        
        try {
          await this.productService.discountStock(itemsToReturn);
          // Log movement
          for (const item of order.items) {
            await this.inventoryService.logMovement({
              productId: item.productoId,
              productName: item.nombre,
              change: item.cantidad,
              reason: 'return',
              orderId: orderId,
              date: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error('Error returning stock for cancelled order', error);
        }
      }
    }
    
    await updateDoc(docRef, { estado: status });

    // Enviar correo de actualización de estado si es un cambio relevante
    try {
      const order = await this.getOrderById(orderId);
      if (order && order.userEmail) {
        await this.emailService.sendOrderUpdateEmail(order.userEmail, order);
      }
    } catch (e) {
      console.warn('Error al enviar correo de actualización:', e);
    }
  }

  async getAllOrders(): Promise<Order[]> {
    const q = query(this.ordersCollection, orderBy('fecha', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fecha: data['fecha'] instanceof Timestamp ? data['fecha'].toDate() : data['fecha']
      } as Order;
    });
  }
}
