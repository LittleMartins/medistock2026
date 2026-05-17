export interface OrderItem {
  productoId: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

export interface Order {
  id?: string;
  userId: string;
  userEmail: string;
  items: any[];
  subtotal: number;
  envio: number;
  total: number;
  tipoDespacho: 'normal' | 'express';
  urgenciaMedica?: boolean;
  aprobadaPorEjecutivo?: boolean;
  estado: 'pendiente' | 'pagado' | 'preparando' | 'enviado' | 'entregado' | 'cancelado';
  fecha: string | Date | any;
  direccionEnvio: {
    nombre: string;
    apellido: string;
    telefono: string;
    direccion: string;
    numeroDepto?: string;
    region: string;
    comuna: string;
    codigoPostal?: string;
    referencias?: string;
  };
  metodoPago: string;
  
  // Campos adicionales
  timbre?: boolean;
  razonSocial?: string;
  empresaRut?: string;
  representanteLegal?: string;
  precioEnvioPrioritario?: number;
}
