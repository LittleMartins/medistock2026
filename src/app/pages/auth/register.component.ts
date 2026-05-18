import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, UserRole } from '../../services/auth.service';
import { 
  validateRUT, 
  validatePassword, 
  validateChileanPhone, 
  validateChileanPostalCode, 
  validateEmail,
  formatRUT,
  formatChileanPhone
} from '../../utils/validators';
import { LucideAngularModule, UserPlus, Mail, Lock, User, MapPin, Phone, Building2, Activity, XCircle, CreditCard } from 'lucide-angular';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly UserPlusIcon = UserPlus;
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly UserIcon = User;
  readonly MapPinIcon = MapPin;
  readonly PhoneIcon = Phone;
  readonly BuildingIcon = Building2;
  readonly ActivityIcon = Activity;
  readonly XCircleIcon = XCircle;
  readonly CreditCardIcon = CreditCard;

  nombre = '';
  apellido = '';
  email = '';
  rut = '';
  password = '';
  confirmPassword = '';
  role: UserRole = 'paciente';
  
  // Datos de envío
  telefono = '';
  direccion = '';
  numeroDepto = '';
  region = '';
  comuna = '';
  codigoPostal = '';
  referencias = '';
  
  // Campos adicionales para institución
  razonSocial = '';
  empresaRut = '';
  representanteLegal = '';
  timbre = false;
  proveedores = '';
  
  isLoading = false;
  errorMessage = '';
  rutError = '';
  empresaRutError = '';
  telefonoError = '';
  codigoPostalError = '';
  emailError = '';
  passwordErrors: string[] = [];
  showPassword = false;

  // Validadores simplificados para el template
  get hasMinLength(): boolean {
    return !!this.password && this.password.length >= 8;
  }

  get hasLowercase(): boolean {
    return !!this.password && /[a-z]/.test(this.password);
  }

  get hasUppercase(): boolean {
    return !!this.password && /[A-Z]/.test(this.password);
  }

  get hasNumber(): boolean {
    return !!this.password && /[0-9]/.test(this.password);
  }

  get hasSpecialChar(): boolean {
    return !!this.password && /[!@#$%^&*()_+{}[\]:;<>,.?~\\/-]/.test(this.password);
  }

  regionesChile = [
    'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo', 'Valparaíso', 
    'Metropolitana de Santiago', 'Libertador Gral. Bernardo O’Higgins', 'Maule', 'Ñuble', 
    'Biobío', 'La Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén del Gral. Carlos Ibáñez del Campo', 
    'Magallanes y de la Antártica Chilena'
  ];

  comunasPorRegion: Record<string, string[]> = {
    'Metropolitana de Santiago': ['Santiago', 'Conchalí', 'Huechuraba', 'Independencia', 'Quilicura', 'Recoleta', 'Renca', 'Las Condes', 'Lo Barnechea', 'Providencia', 'Vitacura', 'La Reina', 'Macul', 'Ñuñoa', 'Peñalolén', 'La Florida', 'La Granja', 'El Bosque', 'La Pintana', 'San Ramón', 'Lo Espejo', 'Pedro Aguirre Cerda', 'San Joaquín', 'San Miguel', 'Cerrillos', 'Estación Central', 'Maipú', 'Cerro Navia', 'Lo Prado', 'Pudahuel', 'Quinta Normal', 'Puente Alto'],
    'Valparaíso': ['Valparaíso', 'Viña del Mar', 'Concón', 'Quilpué', 'Villa Alemana', 'San Antonio'],
    'Biobío': ['Concepción', 'Talcahuano', 'San Pedro de la Paz', 'Chiguayante']
  };

  comunasDisponibles: string[] = [];

  onRegionChange() {
    this.comunasDisponibles = this.comunasPorRegion[this.region] || ['Comuna Genérica 1', 'Comuna Genérica 2'];
    this.comuna = '';
  }

  validateRUTInput() {
    if (!this.rut) {
      this.rutError = '';
      return;
    }
    this.rutError = validateRUT(this.rut) ? '' : 'El RUT ingresado no es válido';
  }

  validateEmpresaRUTInput() {
    if (!this.empresaRut) {
      this.empresaRutError = '';
      return;
    }
    this.empresaRutError = validateRUT(this.empresaRut) ? '' : 'El RUT de empresa no es válido';
  }

  validatePhoneInput() {
    if (!this.telefono) {
      this.telefonoError = '';
      return;
    }
    this.telefonoError = validateChileanPhone(this.telefono) ? '' : 'Ingresa un teléfono válido (+569XXXXXXXX)';
  }

  validatePostalCodeInput() {
    if (!this.codigoPostal) {
      this.codigoPostalError = '';
      return;
    }
    this.codigoPostalError = validateChileanPostalCode(this.codigoPostal) ? '' : 'Ingresa un código postal válido';
  }

  validateEmailInput() {
    if (!this.email) {
      this.emailError = '';
      return;
    }
    this.emailError = validateEmail(this.email) ? '' : 'Ingresa un correo electrónico válido';
  }

  validatePasswordInput() {
    const result = validatePassword(this.password);
    this.passwordErrors = result.errors;
  }

  formatRUT() {
    if (!this.rut) return;
    this.rut = formatRUT(this.rut);
  }

  formatPhone() {
    if (!this.telefono) return;
    this.telefono = formatChileanPhone(this.telefono);
  }

  async onSubmit() {
    // Validar RUT personal
    if (!this.rut || !validateRUT(this.rut)) {
      this.errorMessage = 'Por favor, ingresa un RUT válido';
      this.rutError = 'El RUT ingresado no es válido';
      return;
    }

    // Validar RUT de empresa si es institución
    if (this.role === 'institucion' && this.empresaRut && !validateRUT(this.empresaRut)) {
      this.errorMessage = 'Por favor, ingresa un RUT de empresa válido';
      this.empresaRutError = 'El RUT de empresa no es válido';
      return;
    }

    // Validar teléfono
    if (!this.telefono || !validateChileanPhone(this.telefono)) {
      this.errorMessage = 'Por favor, ingresa un teléfono válido';
      this.telefonoError = 'Ingresa un teléfono válido (+569XXXXXXXX)';
      return;
    }

    // Validar código postal
    if (this.codigoPostal && !validateChileanPostalCode(this.codigoPostal)) {
      this.errorMessage = 'Por favor, ingresa un código postal válido';
      this.codigoPostalError = 'Ingresa un código postal válido';
      return;
    }

    // Validar email
    if (!this.email || !validateEmail(this.email)) {
      this.errorMessage = 'Por favor, ingresa un correo electrónico válido';
      this.emailError = 'Ingresa un correo electrónico válido';
      return;
    }

    // Validar contraseña segura
    const passwordCheck = validatePassword(this.password);
    if (!passwordCheck.valid) {
      this.errorMessage = passwordCheck.errors[0] || 'La contraseña no cumple con los estándares de seguridad';
      return;
    }

    if (!this.nombre || !this.apellido || !this.email || !this.password || !this.confirmPassword || !this.telefono || !this.direccion || !this.region || !this.comuna) {
      this.errorMessage = 'Por favor, completa todos los campos obligatorios.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const extraData = {
        name: this.nombre,
        lastName: this.apellido,
        rut: this.rut,
        telefono: this.telefono,
        direccion: this.direccion,
        numeroDepto: this.numeroDepto,
        region: this.region,
        comuna: this.comuna,
        codigoPostal: this.codigoPostal,
        referencias: this.referencias,
        razonSocial: this.razonSocial,
        empresaRut: this.empresaRut,
        representanteLegal: this.representanteLegal,
        timbre: this.timbre,
        proveedores: this.proveedores ? this.proveedores.split(',').map(p => p.trim()).filter(p => p) : []
      };

      await this.authService.register(this.email, this.password, this.nombre, this.role, extraData);
      
      this.router.navigate(['/']);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        this.errorMessage = 'El correo electrónico ya está registrado.';
      } else {
        this.errorMessage = 'Ocurrió un error al registrarse. Intenta nuevamente.';
      }
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }
}
