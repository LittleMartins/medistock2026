export interface Address {
  id?: string;
  userId: string;
  name: string; // Nombre para identificar la dirección (ej: "Casa", "Oficina")
  nombre: string;
  apellido: string;
  telefono: string;
  direccion: string;
  numeroDepto?: string;
  region: string;
  comuna: string;
  codigoPostal?: string;
  referencias?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt?: string;
}
