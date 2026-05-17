import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { UserService } from '../../../services/user.service';
import { UserData } from '../../../services/auth.service';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models/order.model';
import { LucideAngularModule, Search, Edit, Trash2, Ban, ShieldAlert, CheckCircle, Clock, Download, Plus } from 'lucide-angular';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './admin-usuarios.component.html'
})
export class AdminUsuariosComponent implements OnInit {
  private userService = inject(UserService);
  private orderService = inject(OrderService);

  readonly SearchIcon = Search;
  readonly EditIcon = Edit;
  readonly Trash2Icon = Trash2;
  readonly BanIcon = Ban;
  readonly ShieldAlertIcon = ShieldAlert;
  readonly CheckCircleIcon = CheckCircle;
  readonly ClockIcon = Clock;
  readonly DownloadIcon = Download;
  readonly PlusIcon = Plus;

  users: UserData[] = [];
  filteredUsers: UserData[] = [];
  searchTerm = '';
  roleFilter = 'todos';
  statusFilter = 'todos';
  isLoading = true;

  // Modal
  showModal = false;
  isSaving = false;
  selectedUser: UserData | null = null;
  userOrders: Order[] = [];
  isLoadingOrders = false;

  // Edición
  editMode = false;
  isAdding = false;
  editedUser: Partial<UserData> & { password?: string } = {};

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    this.isLoading = true;
    try {
      this.users = await this.userService.getAllUsers();
      this.applyFilters();
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      this.isLoading = false;
    }
  }

  applyFilters() {
    let result = [...this.users];

    if (this.roleFilter !== 'todos') {
      result = result.filter(u => u.role === this.roleFilter);
    }
    
    if (this.statusFilter !== 'todos') {
      if (this.statusFilter === 'active') {
        result = result.filter(u => u.status !== 'blocked');
      } else {
        result = result.filter(u => u.status === 'blocked');
      }
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(u => 
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.uid?.toLowerCase().includes(term)
      );
    }

    this.filteredUsers = result;
  }

  async viewUserDetails(user: UserData) {
    this.selectedUser = user;
    this.editMode = false;
    this.showModal = true;
    this.isLoadingOrders = true;
    this.userOrders = [];

    try {
      this.userOrders = await this.orderService.getUserOrders(user.uid);
    } catch (error) {
      console.error('Error loading user orders:', error);
    } finally {
      this.isLoadingOrders = false;
    }
  }

  openAddModal() {
    this.selectedUser = null;
    this.editedUser = {
      name: '',
      email: '',
      password: '',
      role: 'user',
      status: 'active'
    };
    this.editMode = true;
    this.isAdding = true;
    this.showModal = true;
  }

  editUser(user: UserData) {
    this.selectedUser = user;
    this.editedUser = { ...user };
    this.editMode = true;
    this.isAdding = false;
    this.showModal = true;
  }

  async saveUser() {
    try {
      if (this.isAdding) {
        // En un entorno real, la creación de usuarios con contraseña debe hacerse en el backend.
        // Aquí simularemos agregarlo a la base de datos de Firestore.
        const newUser = { ...this.editedUser, uid: 'user_' + new Date().getTime(), createdAt: new Date().toISOString() };
        delete newUser.password; // No guardar contraseña en texto plano en Firestore
        await this.userService.createUser(newUser as UserData);
      } else if (this.selectedUser) {
        await this.userService.updateUser(this.selectedUser.uid, this.editedUser);
      }
      await this.loadUsers();
      this.closeModal();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error al guardar el usuario.');
    }
  }

  async toggleBlockStatus(user: UserData) {
    if (!confirm(`¿Estás seguro de que deseas ${user.status === 'blocked' ? 'desbloquear' : 'bloquear'} al usuario ${user.email}?`)) {
      return;
    }

    try {
      const newStatus = user.status === 'blocked' ? 'active' : 'blocked';
      await this.userService.updateUser(user.uid, { status: newStatus });
      await this.loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  }

  async deleteUser(user: UserData) {
    if (!confirm(`¿ADVERTENCIA: Estás seguro de que deseas eliminar permanentemente el registro de ${user.email}? Esto no eliminará su cuenta de autenticación de Firebase.`)) {
      return;
    }

    try {
      await this.userService.deleteUser(user.uid);
      await this.loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }

  closeModal() {
    this.showModal = false;
    this.selectedUser = null;
    this.editMode = false;
    this.isAdding = false;
    this.userOrders = [];
  }

  exportToExcel() {
    if (this.filteredUsers.length === 0) {
      alert('No hay usuarios para exportar');
      return;
    }

    const dataToExport = this.filteredUsers.map(user => ({
      'ID Usuario': user.uid,
      'Nombre': user.name,
      'Email': user.email,
      'Rol': user.role === 'admin' ? 'Administrador' : 'Usuario',
      'Estado': user.status === 'blocked' ? 'Bloqueado' : 'Activo',
      'Teléfono': user.phone || 'N/A',
      'Dirección': user.address || 'N/A',
      'Fecha Registro': new Date(user.createdAt || new Date()).toLocaleDateString()
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook: XLSX.WorkBook = { Sheets: { 'Usuarios': worksheet }, SheetNames: ['Usuarios'] };
    
    XLSX.writeFile(workbook, `usuarios_medistock_${new Date().getTime()}.xlsx`);
  }
}
