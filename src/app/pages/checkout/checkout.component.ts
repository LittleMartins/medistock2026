import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { EmailService } from '../../services/email.service';
import { PaymentService } from '../../services/payment.service';
import { ModalService } from '../../components/ui/modal/modal.component';
import { validateRUT } from '../../utils/validators';
import { LucideAngularModule, CreditCard, MapPin, CheckCircle, Package, Lock, XCircle } from 'lucide-angular';
import { firstValueFrom, Observable } from 'rxjs';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private orderService = inject(OrderService);
  private emailService = inject(EmailService);
  private paymentService = inject(PaymentService);
  private modalService = inject(ModalService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly CreditCardIcon = CreditCard;
  readonly MapPinIcon = MapPin;
  readonly CheckCircleIcon = CheckCircle;
  readonly PackageIcon = Package;
  readonly LockIcon = Lock;
  readonly XCircleIcon = XCircle;

  cartItems$: Observable<CartItem[]> = this.cartService.cartItems$;
  total$: Observable<number> = this.cartService.cartTotal$;

  nombre = '';
  apellido = '';
  email = '';
  rut = '';
  telefono = '';
  direccion = '';
  numeroDepto = '';
  region = '';
  comuna = '';
  codigoPostal = '';
  referencias = '';
  metodoPago = 'webpay';
  tipoDespacho = 'normal'; // normal o express
  
  // Campos adicionales
  razonSocial = '';
  empresaRut = '';
  representanteLegal = '';
  timbre = false;
  precioEnvioPrioritario = 0;
  
  isProcessing = false;
  isLoading = false;
  isWebpaySimulating = false;
  webpayStatus: 'idle' | 'processing' | 'success' | 'error' | 'rejected' | 'cancelled' = 'idle';
  paymentStatus: 'success' | 'rejected' | 'cancelled' | 'error' | 'idle' = 'idle';
  
  errorMessage = '';
  successMessage = '';
  createdOrderId = '';
  rutError = '';

  regionesChile = [
    'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo', 'Valparaíso', 
    'Metropolitana de Santiago', 'Libertador Gral. Bernardo O’Higgins', 'Maule', 'Ñuble', 
    'Biobío', 'La Araucanía', 'La Ríos', 'Los Lagos', 'Aysén del Gral. Carlos Ibáñez del Campo', 
    'Magallanes y de la Antártica Chilena'
  ];

  comunasPorRegion: Record<string, string[]> = {
    'Metropolitana de Santiago': ['Santiago', 'Conchalí', 'Huechuraba', 'Independencia', 'Quilicura', 'Recoleta', 'Renca', 'Las Condes', 'Lo Barnechea', 'Providencia', 'Vitacura', 'La Reina', 'Macul', 'Ñuñoa', 'Peñalolén', 'La Florida', 'La Granja', 'El Bosque', 'La Pintana', 'San Ramón', 'Lo Espejo', 'Pedro Aguirre Cerda', 'San Joaquín', 'San Miguel', 'Cerrillos', 'Estación Central', 'Maipú', 'Cerro Navia', 'Lo Prado', 'Pudahuel', 'Quinta Normal', 'Puente Alto'],
    'Valparaíso': ['Valparaíso', 'Viña del Mar', 'Concón', 'Quilpué', 'Villa Alemana', 'San Antonio'],
    // Placeholder para simplificar. En producción se cargarían todas.
    'Biobío': ['Concepción', 'Talcahuano', 'San Pedro de la Paz', 'Chiguayante']
  };

  comunasDisponibles: string[] = [];

  // Getters para el resumen (usados en el template)
  get subtotalNormal(): number {
    return 0; // Se calculará en el template con async pipe o podemos mejorarlo
  }

  get discountTotal(): number {
    return 0; // Se calculará en el template
  }

  get costoEnvio(): number {
    return this.tipoDespacho === 'express' ? 4990 : 0;
  }

  get total(): number {
    return 0; // Se calculará en el template
  }

  isFormValid(): boolean {
    return !!(this.nombre && this.apellido && this.telefono && this.direccion && this.region && this.comuna);
  }

  async processCheckout() {
    await this.procesarPedido();
  }

  getDiscountTotal(items: CartItem[]): number {
    return items.reduce((total, item) => {
      if (item.precioOferta) {
        return total + ((item.precioNormal - item.precioOferta) * item.cantidad);
      }
      return total;
    }, 0);
  }

  getSubtotalNormal(items: CartItem[]): number {
    return items.reduce((total, item) => total + (item.precioNormal * item.cantidad), 0);
  }

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

  formatRUT() {
    if (!this.rut) return;
    
    let cleanRUT = this.rut.replace(/[^0-9kK]/g, '');
    if (cleanRUT.length > 1) {
      const dv = cleanRUT.slice(-1);
      const cuerpo = cleanRUT.slice(0, -1);
      
      if (cuerpo.length > 0) {
        let formatted = '';
        for (let i = cuerpo.length - 1, j = 1; i >= 0; i--, j++) {
          formatted = cuerpo.charAt(i) + formatted;
          if (j % 3 === 0 && i > 0) {
            formatted = '.' + formatted;
          }
        }
        this.rut = formatted + '-' + dv.toUpperCase();
      }
    }
  }

  async ngOnInit() {
    // SOLO: Cargar datos desde el perfil del usuario autenticado en Firestore
    this.authService.userData$.subscribe(userData => {
      if (userData) {
        this.nombre = userData.name || '';
        this.apellido = userData.lastName || '';
        this.email = userData.email || '';
        this.rut = userData.rut || '';
        this.telefono = userData.telefono || userData.phone || '';
        this.direccion = userData.direccion || userData.address || '';
        this.numeroDepto = userData.numeroDepto || '';
        this.region = userData.region || '';
        this.comuna = userData.comuna || '';
        this.codigoPostal = userData.codigoPostal || '';
        this.referencias = userData.referencias || '';
        this.razonSocial = userData.razonSocial || '';
        this.empresaRut = userData.empresaRut || '';
        this.representanteLegal = userData.representanteLegal || '';
        this.timbre = userData.timbre || false;
        if (this.region) this.onRegionChange();
      }
    });

    const items = await firstValueFrom(this.cartService.cartItems$);
    const hasStatus = this.route.snapshot.queryParamMap.has('status');

    if (items.length === 0 && !hasStatus) {
      console.log('Carrito vacío y sin status de pago, redirigiendo...');
      // Comentamos la redirección temporalmente para diagnosticar si esto es lo que causa el salto al inicio
      // this.router.navigate(['/carrito']);
      return;
    }

    // Check if coming from Webpay
    this.route.queryParams.subscribe(async params => {
      const status = params['status'];
      const token = params['token'];
      const buyOrder = params['buyOrder'];
      
      console.log('Checkout Params:', { status, token, buyOrder });

      if (status) {
        // Esperar un momento a que Firebase Auth se inicialice
        let user = await firstValueFrom(this.authService.currentUser$);
        
        // Si no hay usuario inmediatamente, esperar un segundo (reintento)
        if (!user) {
          console.log('Usuario no detectado inmediatamente, reintentando en 1.5s...');
          await new Promise(resolve => setTimeout(resolve, 1500));
          user = await firstValueFrom(this.authService.currentUser$);
        }

        if (!user) {
          console.error('Error: Sesión no detectada tras reintento.');
          this.errorMessage = 'Sesión expirada o no detectada. Por favor, asegúrate de estar logueado.';
          return;
        }

        const total = await firstValueFrom(this.cartService.cartTotal$);

        if (status === 'success') {
          this.isWebpaySimulating = true;
          this.webpayStatus = 'success';
          
          await this.paymentService.logPayment({
            userId: user.uid,
            userEmail: user.email || '',
            amount: total,
            status: 'approved',
            buyOrder: buyOrder || '',
            token: token || '',
            method: 'Webpay Plus'
          });
          
          // Esperar un poco para que el usuario vea el mensaje de "Pago Aprobado" en el modal
          setTimeout(async () => {
            await this.finalizarPedido('pagado', 'Webpay Plus', user);
          }, 2000);

        } else if (status === 'rejected' || status === 'cancelled') {
          this.isProcessing = false;
          this.paymentStatus = status;
          this.errorMessage = status === 'rejected' ? 'El pago fue rechazado por la entidad bancaria.' : 'La transacción fue cancelada.';
          
          await this.paymentService.logPayment({
            userId: user.uid,
            userEmail: user.email || '',
            amount: total,
            status: status === 'cancelled' ? 'cancelled' : 'rejected',
            buyOrder: buyOrder,
            token: token,
            method: 'Webpay Plus'
          });

          if (user.email) {
            const displayName = (user as any).displayName || user.email.split('@')[0];
            await this.emailService.sendPaymentRejectedEmail(user.email, displayName);
          }

          this.modalService.showAlert(status === 'rejected' ? 'Pago Rechazado' : 'Pago Cancelado', this.errorMessage, 'error');
        } else if (status === 'error') {
          this.isProcessing = false;
          this.errorMessage = 'Hubo un problema técnico al procesar el pago con Webpay. Por favor, intenta nuevamente.';
          this.modalService.showAlert('Error de Comunicación', this.errorMessage, 'error');
        } else {
          this.isProcessing = false;
          this.errorMessage = 'Ocurrió un error inesperado con el pago en Webpay.';
        }
        
        // Remove query params to clean URL and prevent duplicate orders on refresh
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { status: null, token: null, buyOrder: null },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      }
    });
  }

  async procesarPedido() {
    // Validar RUT
    if (!this.rut || !validateRUT(this.rut)) {
      this.errorMessage = 'Por favor, ingresa un RUT válido';
      this.rutError = 'El RUT ingresado no es válido';
      return;
    }

    if (!this.nombre || !this.apellido || !this.telefono || !this.direccion || !this.region || !this.comuna) {
      this.errorMessage = 'Por favor, completa todos los datos obligatorios de envío.';
      return;
    }

    const user = await firstValueFrom(this.authService.currentUser$);
    if (!user) {
      this.errorMessage = 'Debes iniciar sesión para finalizar la compra.';
      return;
    }

    // Actualizar perfil del usuario con los datos usados en el checkout para futuras compras
    try {
      await this.authService.updateUserData(user.uid, {
        name: this.nombre,
        lastName: this.apellido,
        rut: this.rut,
        telefono: this.telefono,
        direccion: this.direccion,
        numeroDepto: this.numeroDepto,
        region: this.region,
        comuna: this.comuna,
        codigoPostal: this.codigoPostal,
        referencias: this.referencias
      });
    } catch (e) {
      console.warn('No se pudo actualizar el perfil automáticamente:', e);
    }

    if (this.metodoPago === 'webpay') {
      this.iniciarWebpay(user);
      return;
    }

    await this.finalizarPedido('pendiente', 'Transferencia Bancaria', user);
  }

  async iniciarWebpay(user: any) {
    this.isWebpaySimulating = true;
    this.webpayStatus = 'processing';
    
    try {
      const items = await firstValueFrom(this.cartService.cartItems$);
      const subtotal = this.getSubtotalNormal(items) - this.getDiscountTotal(items);
      const envio = this.tipoDespacho === 'express' ? 4990 : 0;
      const totalFinal = subtotal + envio;
      
      const sessionId = `SESSION_${new Date().getTime()}`;
      const buyOrder = `ORD_${new Date().getTime()}`;
      
      const baseUrl = window.location.origin;
      const returnUrl = `${baseUrl}/api/confirmWebpayTransaction`;

      console.log('Iniciando Webpay:', { buyOrder, amount: totalFinal, returnUrl });

      // Guardar datos temporales ANTES de ir a Webpay
      localStorage.setItem('pending_order_data', JSON.stringify({
        nombre: this.nombre,
        apellido: this.apellido,
        email: user.email,
        telefono: this.telefono,
        direccion: this.direccion,
        numeroDepto: this.numeroDepto,
        region: this.region,
        comuna: this.comuna,
        codigoPostal: this.codigoPostal,
        referencias: this.referencias,
        metodoPago: 'webpay',
        tipoDespacho: this.tipoDespacho,
        total: totalFinal,
        items: items
      }));

      // Intentar integración con Cloud Function
      // Volver a usar la ruta relativa para aprovechar el Hosting Rewrite y evitar CORS
      const response = await fetch(`/api/initWebpayTransaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyOrder,
          sessionId,
          amount: totalFinal,
          returnUrl
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url && data.token) {
          // Redirigir a Webpay real mediante POST
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = data.url;
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'token_ws';
          input.value = data.token;
          form.appendChild(input);
          document.body.appendChild(form);
          form.submit();
          return;
        }
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error en la respuesta del servidor de pagos');
    } catch (error: any) {
      console.error('Error en el flujo de Webpay:', error);
      this.webpayStatus = 'error';
      this.errorMessage = `Error al conectar con Webpay: ${error.message}`;
      this.isWebpaySimulating = false;
      this.isProcessing = false;
      this.modalService.showAlert('Error de Pago', 'No se pudo iniciar la transacción con Webpay. Por favor, intenta más tarde.', 'error');
    }
  }

  private async finalizarPedido(estadoPago: 'pendiente' | 'pagado', metodoReal: string, user: any) {
    this.isProcessing = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const items = await firstValueFrom(this.cartService.cartItems$);
      const subtotal = this.getSubtotalNormal(items) - this.getDiscountTotal(items);

      if (!items || items.length === 0) {
        // Si el carrito está vacío pero venimos de Webpay, tal vez ya se procesó
        if (this.createdOrderId) return; 
        throw new Error('El carrito está vacío. No se puede crear el pedido.');
      }

      // Convert CartItem[] to order items format
      const orderItems = items.map(item => ({
        productoId: item.productoId,
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad
      }));

      const envio = this.tipoDespacho === 'express' ? 4990 : 0;
      const totalConEnvio = subtotal + envio;

      // El total ya incluye el envío porque lo guardamos así en procesarPedido()
      const orderData: any = {
        userId: user?.uid || 'guest',
        userEmail: user?.email || '',
        items: orderItems,
        subtotal: subtotal,
        envio: envio,
        total: totalConEnvio,
        tipoDespacho: this.tipoDespacho,
        estado: estadoPago,
        fecha: new Date(),
        direccionEnvio: {
          nombre: this.nombre,
          apellido: this.apellido,
          telefono: this.telefono,
          direccion: this.direccion,
          numeroDepto: this.numeroDepto,
          region: this.region,
          comuna: this.comuna,
          codigoPostal: this.codigoPostal,
          referencias: this.referencias
        },
        metodoPago: metodoReal,
        timbre: this.timbre,
        razonSocial: this.razonSocial,
        empresaRut: this.empresaRut,
        representanteLegal: this.representanteLegal,
        precioEnvioPrioritario: this.tipoDespacho === 'express' ? 4990 : 0
      };

      console.log('Creando pedido en Firestore...');
      const orderId = await this.orderService.createOrder(orderData);
      console.log('Pedido creado con ID:', orderId);
      
      this.createdOrderId = orderId;
      this.successMessage = '¡Pedido procesado con éxito!';
      
      // LIMPIAR CARRITO INMEDIATAMENTE
      this.cartService.clearCart();
      localStorage.removeItem('checkout_direccion');

      // Trigger automatic email simulation
      try {
        await this.emailService.sendOrderConfirmationEmail(user as any, { id: orderId, ...orderData } as any);
      } catch (emailError) {
        console.warn('Error al enviar email de confirmación:', emailError);
      }

      // Redirigir a tracking después de un breve delay para que vea el mensaje de éxito
      setTimeout(() => {
        this.router.navigate(['/tracking', orderId]);
      }, 3000);

    } catch (error: any) {
      console.error('Error al finalizar pedido:', error);
      this.errorMessage = error.message || 'Ocurrió un error al procesar tu pedido. Verifica el stock e intenta nuevamente.';
      this.isWebpaySimulating = false; // Cerrar modal si hay error
    } finally {
      this.isProcessing = false;
      // No cerramos isWebpaySimulating aquí si fue exitoso, para que el modal de éxito se mantenga hasta la redirección o el successMessage lo cubra
    }
  }
}
