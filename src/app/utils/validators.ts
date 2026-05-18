// Validador de RUT Chileno
export function validateRUT(rut: string): boolean {
  if (!rut) return false;
  
  // Limpiar el RUT
  rut = rut.replace(/\./g, '').replace(/-/g, '').trim();
  if (rut.length < 2) return false;

  const dv = rut.slice(-1).toUpperCase();
  let cuerpo = rut.slice(0, -1);
  
  // Validar que el cuerpo sea numérico
  if (!/^\d+$/.test(cuerpo)) return false;

  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i)) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }

  const dvEsperado = 11 - (suma % 11);
  const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();

  return dv === dvCalculado;
}

// Validador de Contraseña Segura
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!password || password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe incluir al menos una letra minúscula');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe incluir al menos una letra mayúscula');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe incluir al menos un número');
  }

  if (!/[!@#$%^&*()_+{}[\]:;<>,.?~\\/-]/.test(password)) {
    errors.push('La contraseña debe incluir al menos un carácter especial (!@#$%^&*)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Validador de Teléfono Chileno (+569XXXXXXXX)
export function validateChileanPhone(phone: string): boolean {
  if (!phone) return false;
  
  // Limpiar el teléfono
  phone = phone.replace(/\s/g, '').replace(/-/g, '');
  
  // Aceptar formatos: +569XXXXXXXX, 569XXXXXXXX, 9XXXXXXXX
  const regex = /^(\+?56)?9\d{8}$/;
  return regex.test(phone);
}

// Validador de Código Postal Chileno
export function validateChileanPostalCode(postalCode: string): boolean {
  if (!postalCode) return false;
  
  // Formato: XXXXXXXX o XXX-XXXX
  const regex = /^\d{7,8}$|^\d{3}-\d{4}$/;
  return regex.test(postalCode.trim());
}

// Validador de Email Robusto
export function validateEmail(email: string): boolean {
  if (!email) return false;
  
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return regex.test(email.trim());
}

// Formatear RUT para mostrar (ej: 12.345.678-9)
export function formatRUT(rut: string): string {
  if (!rut) return '';
  
  rut = rut.replace(/\./g, '').replace(/-/g, '').trim();
  if (rut.length < 2) return rut;
  
  const dv = rut.slice(-1);
  let cuerpo = rut.slice(0, -1);
  
  // Agregar puntos cada 3 dígitos
  cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${cuerpo}-${dv}`;
}

// Formatear teléfono chileno (ej: +56 9 1234 5678)
export function formatChileanPhone(phone: string): string {
  if (!phone) return '';
  
  phone = phone.replace(/\D/g, '');
  
  if (phone.startsWith('56')) {
    phone = phone.slice(2);
  }
  
  if (phone.startsWith('9') && phone.length === 9) {
    return `+56 9 ${phone.slice(1, 5)} ${phone.slice(5)}`;
  }
  
  return phone;
}
