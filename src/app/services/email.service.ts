import { Injectable, inject } from '@angular/core';
import { Order } from '../models/order.model';
import { UserData } from './auth.service';
import { PdfService } from './pdf.service';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private pdfService = inject(PdfService);

  constructor() { }

  private resolveName(user: Partial<UserData> & { displayName?: string } | null | undefined): string {
    if (!user) return 'Cliente';
    const explicitName = (user as any).name;
    if (typeof explicitName === 'string' && explicitName.trim()) return explicitName.trim();
    const displayName = (user as any).displayName;
    if (typeof displayName === 'string' && displayName.trim()) return displayName.trim();
    const email = (user as any).email;
    if (typeof email === 'string' && email.includes('@')) return email.split('@')[0];
    return 'Cliente';
  }

  /**
   * Intenta enviar un correo de confirmación de compra con boleta adjunta vía Cloud Function.
   * Si la función no está disponible, simula el envío.
   */
  async sendOrderConfirmationEmail(user: UserData, order: Order): Promise<boolean> {
    console.log(`[EmailService] Preparando correo a: ${user.email}`);
    
    try {
      const userName = this.resolveName(user as any);
      
      let pdfBase64;
      try {
        pdfBase64 = this.pdfService.generateInvoiceBase64(order);
      } catch(e) {
        console.warn('Could not generate PDF:', e);
      }
      
      const pdfName = `Boleta_Medistock_${order.id}.pdf`;

      // Intentar llamar a la Cloud Function usando ruta relativa
      const response = await fetch(`/api/sendEmailWithPdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: user.email,
          subject: `Confirmación de Pedido ${order.id} - Medistock`,
          text: `Hola ${userName}, tu pedido ha sido procesado exitosamente. Adjuntamos tu boleta.`,
          html: `<p>Hola <strong>${userName}</strong>,</p><p>Tu pedido <strong>${order.id}</strong> ha sido procesado exitosamente.</p><p>Adjuntamos tu boleta en formato PDF.</p>`,
          pdfBase64: pdfBase64,
          pdfName: pdfName
        })
      });

      if (response.ok) {
        console.log(`[EmailService] Correo enviado exitosamente a ${user.email} vía Cloud Function`);
        return true;
      } else {
        throw new Error('Cloud function returned error: ' + response.statusText);
      }
    } catch (error) {
      console.warn('[EmailService] Cloud Function no disponible o error al generar PDF. Simulando envío...', error);
      // Fallback: Simulamos un retraso de red
      return new Promise(resolve => {
        setTimeout(() => {
          console.log(`[EmailService] (Simulado) Correo enviado exitosamente a ${user.email}`);
          resolve(true);
        }, 1500);
      });
    }
  }

  /**
   * Envía un correo cuando un pago es rechazado
   */
  async sendPaymentRejectedEmail(email: string, userName: string): Promise<boolean> {
    console.log(`[EmailService] Simulando correo de rechazo a: ${email}`);
    
    try {
      const response = await fetch(`/api/sendEmailWithPdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: `Pago Rechazado - Medistock`,
          text: `Hola ${userName}, lamentamos informarte que tu pago no pudo ser procesado.`,
          html: `<p>Hola <strong>${userName}</strong>,</p><p>Lamentamos informarte que tu pago ha sido rechazado por el banco o cancelado.</p><p>Puedes intentar nuevamente con otro medio de pago.</p>`
        })
      });

      if (response.ok) {
        console.log(`[EmailService] Correo de rechazo enviado exitosamente a ${email}`);
        return true;
      }
    } catch (error) {
      console.warn('Falló el envío real del correo de rechazo, usando simulador local:', error);
    }
    
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  }

  /**
   * Envía un correo automático cuando el estado de un pedido cambia
   */
  async sendOrderUpdateEmail(email: string, order: Order): Promise<boolean> {
    console.log(`[EmailService] Enviando actualización de estado (${order.estado}) a: ${email}`);
    
    try {
      const response = await fetch(`/api/sendEmailWithPdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: `Actualización de tu Pedido ${order.id} - Medistock`,
          text: `Hola, el estado de tu pedido ha cambiado a: ${order.estado}.`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px;">
              <h2 style="color: #0f172a;">Actualización de Pedido</h2>
              <p>Tu pedido <strong>${order.id}</strong> ha cambiado su estado a:</p>
              <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <span style="font-size: 20px; font-weight: bold; color: #0284c7; text-transform: uppercase;">${order.estado}</span>
              </div>
              <p>Puedes seguir el progreso de tu compra en nuestra plataforma:</p>
              <a href="https://medistock-15247.web.app/tracking/${order.id}" style="display: inline-block; background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Ver Seguimiento</a>
            </div>
          `
        })
      });

      return response.ok;
    } catch (error) {
      console.warn('Error enviando correo de actualización:', error);
      return false;
    }
  }
}
