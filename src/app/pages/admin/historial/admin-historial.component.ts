import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Clock } from 'lucide-angular';
import { ChangeHistoryService } from '../../../services/change-history.service';
import { ChangeHistory } from '../../../models/change-history.model';

@Component({
  selector: 'app-admin-historial',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './admin-historial.component.html'
})
export class AdminHistorialComponent implements OnInit {
  private changeHistoryService = inject(ChangeHistoryService);
  
  readonly ClockIcon = Clock;

  history: ChangeHistory[] = [];
  isLoading = true;

  async ngOnInit() {
    try {
      this.history = await this.changeHistoryService.getRecentChanges(100);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      this.isLoading = false;
    }
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getActionLabel(action: string): string {
    const labels: Record<string, string> = {
      create: 'Crear',
      update: 'Actualizar',
      delete: 'Eliminar'
    };
    return labels[action] || action;
  }

  getEntityLabel(entity: string): string {
    const labels: Record<string, string> = {
      product: 'Producto',
      order: 'Pedido',
      user: 'Usuario',
      provider: 'Proveedor'
    };
    return labels[entity] || entity;
  }
}
