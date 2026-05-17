import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService, InventoryLog } from '../../../services/inventory.service';
import { LucideAngularModule, Activity, RefreshCw, Search, Filter, ArrowUpCircle, ArrowDownCircle, Package } from 'lucide-angular';

@Component({
  selector: 'app-admin-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './admin-inventario.component.html'
})
export class AdminInventarioComponent implements OnInit {
  private inventoryService = inject(InventoryService);

  readonly ActivityIcon = Activity;
  readonly RefreshCwIcon = RefreshCw;
  readonly SearchIcon = Search;
  readonly FilterIcon = Filter;
  readonly ArrowUpCircleIcon = ArrowUpCircle;
  readonly ArrowDownCircleIcon = ArrowDownCircle;
  readonly PackageIcon = Package;

  logs: InventoryLog[] = [];
  filteredLogs: InventoryLog[] = [];
  isLoading = true;
  searchTerm = '';
  reasonFilter = 'todos';

  async ngOnInit() {
    await this.loadLogs();
  }

  async loadLogs() {
    this.isLoading = true;
    try {
      this.logs = await this.inventoryService.getLogs(100);
      this.applyFilters();
    } catch (error) {
      console.error('Error loading inventory logs:', error);
    } finally {
      this.isLoading = false;
    }
  }

  applyFilters() {
    let filtered = [...this.logs];

    // Filter by reason
    if (this.reasonFilter !== 'todos') {
      filtered = filtered.filter(log => log.reason === this.reasonFilter);
    }

    // Filter by search term (product name or ID)
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(log => 
        log.productName.toLowerCase().includes(term) ||
        log.productId.toLowerCase().includes(term) ||
        (log.orderId && log.orderId.toLowerCase().includes(term))
      );
    }

    this.filteredLogs = filtered;
  }

  getReasonText(reason: string): string {
    const reasons: Record<string, string> = {
      'manual_entry': 'Ingreso Manual',
      'sale': 'Venta',
      'return': 'Devolución',
      'adjustment': 'Ajuste'
    };
    return reasons[reason] || reason;
  }
}
