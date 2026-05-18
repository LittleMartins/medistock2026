import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronDown, ChevronUp, HelpCircle, Phone, Mail, Truck, CreditCard, Shield, Package } from 'lucide-angular';
import { ConfigService } from '../../services/config.service';

interface FAQItem {
  question: string;
  answer: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <lucide-icon [name]="HelpCircleIcon" class="w-8 h-8 text-blue-600"></lucide-icon>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-4">Preguntas Frecuentes</h1>
          <p class="text-lg text-gray-600">Encuentra respuestas a las preguntas más comunes sobre Medistock</p>
        </div>

        <!-- Contact Info -->
        <div class="grid md:grid-cols-3 gap-6 mb-12">
          <div class="bg-white rounded-xl shadow-sm p-6 text-center">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-3">
              <lucide-icon [name]="PhoneIcon" class="w-6 h-6 text-red-600"></lucide-icon>
            </div>
            <h3 class="font-semibold text-gray-900 mb-1">Teléfono</h3>
            <p class="text-gray-600">{{ config.contactPhone }}</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-6 text-center">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
              <lucide-icon [name]="MailIcon" class="w-6 h-6 text-blue-600"></lucide-icon>
            </div>
            <h3 class="font-semibold text-gray-900 mb-1">Correo</h3>
            <p class="text-gray-600">{{ config.contactEmail.replace('@', '&#64;') }}</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-6 text-center">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
              <lucide-icon [name]="PackageIcon" class="w-6 h-6 text-green-600"></lucide-icon>
            </div>
            <h3 class="font-semibold text-gray-900 mb-1">Horario</h3>
            <p class="text-gray-600">{{ config.schedule }}</p>
          </div>
        </div>

        <!-- FAQ Items -->
        <div class="space-y-4">
          <div 
            *ngFor="let item of faqItems; let i = index"
            class="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <button
              (click)="toggleFaq(i)"
              class="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span class="font-semibold text-gray-900">{{ item.question }}</span>
              <lucide-icon
                *ngIf="!item.isOpen"
                [name]="ChevronDownIcon"
                class="w-5 h-5 text-gray-500"
              ></lucide-icon>
              <lucide-icon
                *ngIf="item.isOpen"
                [name]="ChevronUpIcon"
                class="w-5 h-5 text-blue-600"
              ></lucide-icon>
            </button>
            <div
              *ngIf="item.isOpen"
              class="px-6 pb-4 text-gray-600"
              [@.disabled]="false"
            >
              <p>{{ item.answer }}</p>
            </div>
          </div>
        </div>

        <!-- Categories -->
        <div class="mt-12 grid md:grid-cols-2 gap-6">
          <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex items-center mb-4">
              <div class="flex-shrink-0">
                <lucide-icon [name]="TruckIcon" class="w-6 h-6 text-blue-600"></lucide-icon>
              </div>
              <h3 class="ml-3 text-lg font-semibold text-gray-900">Envíos</h3>
            </div>
            <ul class="space-y-2 text-gray-600 text-sm">
              <li>• Envío gratis en compras sobre $50.000</li>
              <li>• Tiempo de entrega: 2-5 días hábiles</li>
              <li>• Seguimiento en tiempo real</li>
            </ul>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex items-center mb-4">
              <div class="flex-shrink-0">
                <lucide-icon [name]="CreditCardIcon" class="w-6 h-6 text-green-600"></lucide-icon>
              </div>
              <h3 class="ml-3 text-lg font-semibold text-gray-900">Pagos</h3>
            </div>
            <ul class="space-y-2 text-gray-600 text-sm">
              <li>• Webpay Plus (tarjetas de crédito/débito)</li>
              <li>• Transferencia bancaria</li>
              <li>• Pago seguro y encriptado</li>
            </ul>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex items-center mb-4">
              <div class="flex-shrink-0">
                <lucide-icon [name]="ShieldIcon" class="w-6 h-6 text-red-600"></lucide-icon>
              </div>
              <h3 class="ml-3 text-lg font-semibold text-gray-900">Garantía</h3>
            </div>
            <ul class="space-y-2 text-gray-600 text-sm">
              <li>• Garantía de 6 meses en todos los productos</li>
              <li>• Devoluciones hasta 30 días</li>
              <li>• Soporte técnico especializado</li>
            </ul>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex items-center mb-4">
              <div class="flex-shrink-0">
                <lucide-icon [name]="PackageIcon" class="w-6 h-6 text-amber-600"></lucide-icon>
              </div>
              <h3 class="ml-3 text-lg font-semibold text-gray-900">Productos</h3>
            </div>
            <ul class="space-y-2 text-gray-600 text-sm">
              <li>• Productos originales y certificados</li>
              <li>• Stock disponible en tiempo real</li>
              <li>• Asesoría profesional en selección</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FaqComponent {
  private configService = inject(ConfigService);
  
  readonly HelpCircleIcon = HelpCircle;
  readonly PhoneIcon = Phone;
  readonly MailIcon = Mail;
  readonly PackageIcon = Package;
  readonly ChevronDownIcon = ChevronDown;
  readonly ChevronUpIcon = ChevronUp;
  readonly TruckIcon = Truck;
  readonly CreditCardIcon = CreditCard;
  readonly ShieldIcon = Shield;
  
  readonly config = this.configService.getConfig();

  faqItems: FAQItem[] = [
    {
      question: '¿Cómo puedo realizar un pedido?',
      answer: 'Para realizar un pedido, simplemente agrega los productos que deseas al carrito, completa los datos de envío y selecciona tu método de pago preferido. Aceptamos Webpay Plus y transferencia bancaria.',
      isOpen: false
    },
    {
      question: '¿Cuáles son los tiempos de entrega?',
      answer: 'Los tiempos de entrega varían según tu ubicación. En Santiago y Región Metropolitana, generalmente es de 2 a 3 días hábiles. Para regiones, puede tomar entre 3 y 5 días hábiles.',
      isOpen: false
    },
    {
      question: '¿Hay envío gratis?',
      answer: '¡Sí! Ofrecemos envío gratis en compras sobre $50.000 en todo Chile. Para compras menores, el costo de envío es de $3.990 para envío normal y $4.990 para envío express.',
      isOpen: false
    },
    {
      question: '¿Puedo devolver un producto?',
      answer: 'Sí, puedes devolver cualquier producto dentro de los primeros 30 días después de recibirlo. El producto debe estar en su empaque original y sin usar. Contáctanos para coordinar la devolución.',
      isOpen: false
    },
    {
      question: '¿Los productos tienen garantía?',
      answer: 'Todos nuestros productos tienen garantía de 6 meses por defectos de fabricación. Algunos productos pueden tener garantía extendida según el fabricante.',
      isOpen: false
    },
    {
      question: '¿Cómo puedo rastrear mi pedido?',
      answer: 'Después de confirmar tu pedido, recibirás un correo con un número de seguimiento. También puedes ingresar a la sección "Seguimiento de Pedidos" en nuestra página web y escribir tu ID de pedido.',
      isOpen: false
    },
    {
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos Webpay Plus (tarjetas de crédito y débito Visa, Mastercard y American Express) y transferencia bancaria. Todos los pagos son seguros y encriptados.',
      isOpen: false
    },
    {
      question: '¿Puedo modificar o cancelar mi pedido?',
      answer: 'Puedes modificar o cancelar tu pedido siempre que no haya sido enviado. Contáctanos lo antes posible y te ayudaremos con el proceso.',
      isOpen: false
    },
    {
      question: '¿Venden a instituciones y empresas?',
      answer: '¡Sí! Trabajamos con hospitales, clínicas, consultorios y empresas del rubro médico. Ofrecemos facturación electrónica, timbres y condiciones especiales para compras al por mayor. Contáctanos para más información.',
      isOpen: false
    },
    {
      question: '¿Cómo puedo contactar con soporte?',
      answer: 'Puedes contactarnos a través de nuestro teléfono +56 2 2123 4567, correo soporte@medistock.cl o completando el formulario de contacto en nuestra página web. Nuestro horario es de lunes a viernes de 9:00 a 18:00 horas.',
      isOpen: false
    }
  ];

  toggleFaq(index: number) {
    this.faqItems[index].isOpen = !this.faqItems[index].isOpen;
  }
}
