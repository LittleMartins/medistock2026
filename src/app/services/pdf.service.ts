import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }

  generateInvoice(order: Order, download: boolean = true): jsPDF {
    const doc = new jsPDF();
    
    // Configuración general
    const pageWidth = doc.internal.pageSize.getWidth();
    const primaryColor: [number, number, number] = [14, 165, 233]; // bg-primary-500
    
    // Encabezado - Logo/Nombre Empresa
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('MEDISTOCK', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Venta de Insumos Médicos', 14, 26);
    doc.text('contacto@medistock.cl | +56 9 1234 5678', 14, 31);
    
    // Datos de la Boleta
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('BOLETA ELECTRÓNICA', pageWidth - 14, 20, { align: 'right' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`N° Pedido: ${order.id}`, pageWidth - 14, 26, { align: 'right' });
    
    const orderDate = order.fecha instanceof Date ? order.fecha : (order.fecha as any).toDate ? (order.fecha as any).toDate() : new Date(order.fecha);
    doc.text(`Fecha: ${orderDate.toLocaleDateString('es-CL')} ${orderDate.toLocaleTimeString('es-CL')}`, pageWidth - 14, 31, { align: 'right' });
    
    // Línea separadora
    doc.setDrawColor(200);
    doc.line(14, 36, pageWidth - 14, 36);

    // Datos del Cliente
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Datos del Cliente:', 14, 45);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Usuario ID / Email: ${order.userId}`, 14, 52);
    
    if (order.direccionEnvio) {
      doc.text(`Dirección: ${order.direccionEnvio.direccion}, ${order.direccionEnvio.comuna}`, 14, 57);
      doc.text(`Código Postal: ${order.direccionEnvio.codigoPostal}`, 14, 62);
    }
    
    doc.text(`Método de Pago: ${order.metodoPago || 'No especificado'}`, 14, 67);
    doc.text(`Estado del Pago: ${order.estado === 'pagado' ? 'APROBADO' : 'PENDIENTE'}`, 14, 72);

    // Productos (Tabla)
    const tableBody = order.items.map(item => [
      item.nombre,
      item.cantidad.toString(),
      `$${item.precio.toLocaleString('es-CL')}`,
      `$${(item.cantidad * item.precio).toLocaleString('es-CL')}`
    ]);

    autoTable(doc, {
      startY: 80,
      head: [['Producto', 'Cant.', 'Precio Unit.', 'Subtotal']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255 },
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      }
    });

    // Total
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`TOTAL PAGADO: $${order.total.toLocaleString('es-CL')}`, pageWidth - 14, finalY, { align: 'right' });
    
    // Pie de página
    doc.setFontSize(9);
    doc.setTextColor(150);
    const footerText = 'Gracias por su compra en Medistock. Este documento es válido como comprobante de pago.';
    doc.text(footerText, pageWidth / 2, 280, { align: 'center' });

    if (download) {
      doc.save(`Boleta_Medistock_${order.id}.pdf`);
    }

    return doc;
  }

  generateInvoiceBase64(order: Order): string {
    const doc = this.generateInvoice(order, false);
    // return base64 string without data:application/pdf;filename=generated.pdf;base64,
    const dataUri = doc.output('datauristring');
    return dataUri.split(',')[1];
  }
}