import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as XLSX from 'xlsx';
import { OrderService } from '../../../services/order.service';
import { AuthService } from '../../../services/auth.service';
import { ModalService } from '../../../components/ui/modal/modal.component';
import { Order } from '../../../models/order.model';
import { LucideAngularModule, Search, Eye, Filter, X, Download, CheckCircle, Truck, Landmark, ShieldCheck, AlertCircle, Package } from 'lucide-angular';

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './admin-pedidos.component.html',
  styleUrls: ['./admin-pedidos.component.css']
})
export class AdminPedidosComponent implements OnInit {
  private orderService = inject(OrderService);
  private route = inject(ActivatedRoute);
  public authService = inject(AuthService);
  private modalService = inject(ModalService);

  readonly SearchIcon = Search;
  readonly EyeIcon = Eye;
  readonly FilterIcon = Filter;
  readonly XIcon = X;
  readonly DownloadIcon = Download;
  readonly CheckCircleIcon = CheckCircle;
  readonly TruckIcon = Truck;
  readonly LandmarkIcon = Landmark;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly AlertCircleIcon = AlertCircle;
  readonly PackageIcon = Package;

  orders: Order[] = [];
  filteredOrders: Order[] = [];
  
  searchTerm = '';
  statusFilter = 'todos';
  isLoading = true;
  currentView = 'admin'; // 'admin' | 'logistica' | 'analista' | 'ejecutivo'

  // Modal
  showModal = false;
  selectedOrder: Order | null = null;
  newStatus = '';

  statusOptions = [
    { value: 'todos', label: 'Todos' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'pagado', label: 'Pagado' },
    { value: 'preparando', label: 'Preparando' },
    { value: 'enviado', label: 'Enviado' },
    { value: 'entregado', label: 'Entregado' },
    { value: 'cancelado', label: 'Cancelado' }
  ];

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.currentView = params['view'] || 'admin';
      this.loadOrders();
    });
  }

  async loadOrders() {
    this.isLoading = true;
    try {
      this.orders = await this.orderService.getAllOrders();
      this.applyFilters();
    } catch (error) {
      console.error('Error loading orders', error);
    } finally {
      this.isLoading = false;
    }
  }

  applyFilters() {
    let result = [...this.orders];

    // Filtros por Vista
    if (this.currentView === 'logistica') {
      // Logística ve órdenes pagadas o en preparación, priorizando express
      result = result.filter(o => ['pagado', 'preparando'].includes(o.estado));
      result.sort((a, b) => {
        if (a.tipoDespacho === 'express' && b.tipoDespacho !== 'express') return -1;
        if (a.tipoDespacho !== 'express' && b.tipoDespacho === 'express') return 1;
        return 0;
      });
    } else if (this.currentView === 'analista') {
      // Analistas ven transferencias pendientes de confirmación
      result = result.filter(o => o.metodoPago === 'transferencia' && o.estado === 'pendiente');
    } else if (this.currentView === 'ejecutivo') {
      // Ejecutivos ven compras institucionales pendientes de aprobación
      result = result.filter(o => o.estado === 'pendiente');
    }

    if (this.statusFilter !== 'todos' && this.currentView === 'admin') {
      result = result.filter(o => o.estado === this.statusFilter);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(o => 
        o.id?.toLowerCase().includes(term) ||
        (o.direccionEnvio.comuna && o.direccionEnvio.comuna.toLowerCase().includes(term)) ||
        (o.direccionEnvio.region && o.direccionEnvio.region.toLowerCase().includes(term)) ||
        o.userEmail.toLowerCase().includes(term)
      );
    }

    this.filteredOrders = result;
  }

  async approveOrder(order: Order) {
    try {
      await this.orderService.updateOrderStatus(order.id!, 'pagado');
      this.modalService.showAlert('¡Éxito!', 'Orden aprobada exitosamente', 'success');
      this.loadOrders();
    } catch (error) {
      this.modalService.showAlert('Error', 'No se pudo aprobar la orden', 'error');
    }
  }

  async setPreparing(order: Order) {
    try {
      await this.orderService.updateOrderStatus(order.id!, 'preparando');
      this.loadOrders();
    } catch (error) {
      this.modalService.showAlert('Error', 'No se pudo actualizar el estado', 'error');
    }
  }

  async setDispatched(order: Order) {
    try {
      await this.orderService.updateOrderStatus(order.id!, 'enviado');
      this.loadOrders();
    } catch (error) {
      alert('Error al actualizar');
    }
  }

  openOrderDetails(order: Order) {
    this.selectedOrder = order;
    this.newStatus = order.estado;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedOrder = null;
  }

  async updateStatus() {
    if (this.selectedOrder && this.selectedOrder.id && this.newStatus !== this.selectedOrder.estado) {
      try {
        await this.orderService.updateOrderStatus(this.selectedOrder.id, this.newStatus as Order['estado']);
        this.modalService.showAlert('Actualizado', 'Estado del pedido actualizado correctamente', 'success');
        this.selectedOrder.estado = this.newStatus as Order['estado'];
        // Actualizar la lista en memoria
        const index = this.orders.findIndex(o => o.id === this.selectedOrder!.id);
        if (index !== -1) {
          this.orders[index].estado = this.newStatus as Order['estado'];
          this.applyFilters();
        }
      } catch (error) {
        console.error('Error updating status', error);
        this.modalService.showAlert('Error', 'No se pudo actualizar el estado', 'error');
      }
    }
  }

  exportToExcel() {
    if (this.filteredOrders.length === 0) {
      alert('No hay pedidos para exportar');
      return;
    }

    const dataToExport = this.filteredOrders.map(order => ({
      'ID Pedido': order.id || '',
      'Fecha': new Date(order.fecha).toLocaleString(),
      'Estado': order.estado,
      'Total ($)': order.total,
      'Región': order.direccionEnvio.region || '',
      'Comuna': order.direccionEnvio.comuna || '',
      'Dirección': order.direccionEnvio.direccion || '',
      'Código Postal': order.direccionEnvio.codigoPostal || ''
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook: XLSX.WorkBook = { Sheets: { 'Pedidos': worksheet }, SheetNames: ['Pedidos'] };
    
    XLSX.writeFile(workbook, `pedidos_medistock_${new Date().getTime()}.xlsx`);
  }
}
