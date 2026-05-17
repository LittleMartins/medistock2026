import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { PdfService } from '../../services/pdf.service';
import { Order } from '../../models/order.model';
import { LucideAngularModule, Package, Truck, CheckCircle, Clock, Download, Search, AlertTriangle, MapPin, Eye } from 'lucide-angular';

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.css']
})
export class TrackingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);
  private pdfService = inject(PdfService);

  readonly PackageIcon = Package;
  readonly TruckIcon = Truck;
  readonly CheckCircleIcon = CheckCircle;
  readonly ClockIcon = Clock;
  readonly DownloadIcon = Download;
  readonly SearchIcon = Search;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly MapPinIcon = MapPin;
  readonly EyeIcon = Eye;

  orderId = '';
  lookupOrderId = '';
  order: Order | null = null;
  isLoading = true;
  error = '';

  async ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      this.orderId = params.get('id') || '';
      if (!this.orderId) {
        this.isLoading = false;
        this.order = null;
        return;
      }

      this.isLoading = true;
      this.error = '';
      try {
        this.order = await this.orderService.getOrderById(this.orderId) as Order;
        if (!this.order) {
          this.error = 'Pedido no encontrado. Verifica el número de seguimiento.';
        }
      } catch (err) {
        console.error(err);
        this.error = 'Error al cargar los datos del pedido.';
      } finally {
        this.isLoading = false;
      }
    });
  }

  buscarPedido() {
    const trimmed = (this.lookupOrderId || '').trim();
    if (!trimmed) return;
    this.router.navigate(['/tracking', trimmed]);
  }

  getStepStatus(stepIndex: number): 'completed' | 'current' | 'pending' {
    if (!this.order) return 'pending';

    const states = ['pendiente', 'pagado', 'preparando', 'enviado', 'entregado'];
    const currentStateIndex = states.indexOf(this.order.estado);
    
    if (this.order.estado === 'cancelado') return 'pending'; // Manejar cancelado de forma especial si es necesario
    
    // Simplificamos mapeando a 4 pasos en la UI
    // stepIndex: 0=Pendiente, 1=Preparando (procesando/pagado), 2=Enviado, 3=Entregado
    let mappedCurrentStep = 0;
    if (currentStateIndex === 0) mappedCurrentStep = 0; // pendiente
    if (currentStateIndex === 1 || currentStateIndex === 2) mappedCurrentStep = 1; // pagado o preparando
    if (currentStateIndex === 3) mappedCurrentStep = 2; // enviado
    if (currentStateIndex === 4) mappedCurrentStep = 3; // entregado

    if (stepIndex < mappedCurrentStep) return 'completed';
    if (stepIndex === mappedCurrentStep) return 'current';
    return 'pending';
  }

  downloadInvoice() {
    if (this.order) {
      this.pdfService.generateInvoice(this.order);
    }
  }
}
