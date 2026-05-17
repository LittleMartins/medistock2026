export interface Provider {
  id?: string;
  nombre: string;
  rut: string;
  razonSocial: string;
  representanteLegal: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  productos?: string[];
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
