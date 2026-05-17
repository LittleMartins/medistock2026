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
