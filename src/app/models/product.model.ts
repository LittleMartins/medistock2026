export interface Product {
  id?: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precioOferta?: number;
  precioEnvioPrioritario?: number;
  stock: number;
  bodegas?: {
    principal: number;
    norte: number;
    sur: number;
  };
  categoria: string;
  imagen: string;
  imagenes?: string[];
  sku?: string;
  destacado?: boolean;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
