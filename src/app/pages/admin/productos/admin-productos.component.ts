import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { ProductService } from '../../../services/product.service';
import { InventoryService } from '../../../services/inventory.service';
import { AuthService } from '../../../services/auth.service';
import { ModalService } from '../../../components/ui/modal/modal.component';
import { ChangeHistoryService } from '../../../services/change-history.service';
import { StorageService } from '../../../services/storage.service';
import { Product } from '../../../models/product.model';
import { LucideAngularModule, Plus, Edit, Trash2, Search, X, Download, Activity, Package, Upload, Image as ImageIcon } from 'lucide-angular';

@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './admin-productos.component.html',
  styleUrls: ['./admin-productos.component.css']
})
export class AdminProductosComponent implements OnInit {
  private productService = inject(ProductService);
  private inventoryService = inject(InventoryService);
  private authService = inject(AuthService);
  private modalService = inject(ModalService);
  private changeHistoryService = inject(ChangeHistoryService);
  private storageService = inject(StorageService);

  readonly PlusIcon = Plus;
  readonly EditIcon = Edit;
  readonly Trash2Icon = Trash2;
  readonly SearchIcon = Search;
  readonly XIcon = X;
  readonly DownloadIcon = Download;
  readonly ActivityIcon = Activity;
  readonly PackageIcon = Package;
  readonly UploadIcon = Upload;
  readonly ImageIcon = ImageIcon;

  // Estado para tabs de carga de imágenes
  imageUploadTab: 'url' | 'device' = 'url';
  imageUploading = false;
  galleryImageUploading: { [key: number]: boolean } = {};
  galleryImageTabs: { [key: number]: 'url' | 'device' } = {};

  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm = '';
  isLoading = true;

  // Modal state
  showModal = false;
  isEditing = false;
  currentProduct: Partial<Product> = {};

  categories = ['equipamiento', 'descartables', 'instrumental', 'farmacia'];

  ngOnInit() {
    this.productService.getProducts().subscribe(data => {
      this.products = data;
      this.applyFilter();
      this.isLoading = false;
    });
  }

  applyFilter() {
    if (!this.searchTerm.trim()) {
      this.filteredProducts = [...this.products];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredProducts = this.products.filter(p => 
        p.nombre.toLowerCase().includes(term) || 
        p.codigo.toLowerCase().includes(term)
      );
    }
  }

  syncTotalStock() {
    if (this.currentProduct.bodegas) {
      const b = this.currentProduct.bodegas;
      this.currentProduct.stock = (b.principal || 0) + (b.norte || 0) + (b.sur || 0);
    }
  }

  async toggleProductStatus(product: Product) {
    if (!product.id) return;
    const newStatus = product.activo === false ? true : false;
    try {
      await this.productService.updateProduct(product.id, { activo: newStatus });
    } catch (error) {
      console.error('Error toggling product status', error);
      this.modalService.showAlert('Error', 'No se pudo cambiar el estado del producto', 'error');
    }
  }

  // Función para limpiar campos undefined/null de forma recursiva
  cleanUndefined(obj: any): any {
    if (obj === null || obj === undefined) return undefined;
    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanUndefined(item)).filter(item => item !== undefined);
    }
    if (typeof obj === 'object') {
      const newObj: any = {};
      for (const key of Object.keys(obj)) {
        const cleaned = this.cleanUndefined(obj[key]);
        if (cleaned !== undefined) {
          newObj[key] = cleaned;
        }
      }
      return newObj;
    }
    return obj;
  }

  openAddModal() {
    this.isEditing = false;
    this.currentProduct = {
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      bodegas: { principal: 0, norte: 0, sur: 0 },
      codigo: '',
      sku: '',
      categoria: 'equipamiento',
      imagen: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
      imagenes: [],
      destacado: false,
      activo: true
    };
    this.showModal = true;
  }

  openEditModal(product: Product) {
    this.isEditing = true;
    this.currentProduct = { 
      ...product,
      bodegas: product.bodegas || { principal: product.stock, norte: 0, sur: 0 }
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.currentProduct = {};
  }

  addImage() {
    if (!this.currentProduct.imagenes) {
      this.currentProduct.imagenes = [];
    }
    this.currentProduct.imagenes.push('');
  }

  removeImage(index: number) {
    if (this.currentProduct.imagenes) {
      this.currentProduct.imagenes.splice(index, 1);
    }
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }

  triggerGalleryImageInput(index: number) {
    const input = document.getElementById(`galleryImage_${index}`) as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  getGalleryImageTab(index: number): 'url' | 'device' {
    return this.galleryImageTabs[index] || 'url';
  }

  setGalleryImageTab(index: number, tab: 'url' | 'device') {
    this.galleryImageTabs[index] = tab;
  }

  async onMainImageUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.imageUploading = true;
    try {
      const url = await this.storageService.uploadImage(file);
      this.currentProduct.imagen = url;
    } catch (error) {
      console.error('Error al subir la imagen principal:', error);
      this.modalService.showAlert('Error', 'No se pudo subir la imagen. Intenta nuevamente.', 'error');
    } finally {
      this.imageUploading = false;
      event.target.value = '';
    }
  }

  async onGalleryImageUpload(event: any, index: number) {
    const file = event.target.files[0];
    if (!file) return;

    this.galleryImageUploading[index] = true;
    try {
      const url = await this.storageService.uploadImage(file);
      if (this.currentProduct.imagenes) {
        this.currentProduct.imagenes[index] = url;
      }
    } catch (error) {
      console.error('Error al subir la imagen de galería:', error);
      this.modalService.showAlert('Error', 'No se pudo subir la imagen. Intenta nuevamente.', 'error');
    } finally {
      this.galleryImageUploading[index] = false;
      event.target.value = '';
    }
  }

  async saveProduct() {
    if (!this.currentProduct.nombre || !this.currentProduct.codigo || !this.currentProduct.precio) return;

    try {
      const adminEmail = this.authService.currentUserValue?.email || 'Admin@admin.com';
      if (this.isEditing && this.currentProduct.id) {
        const oldProduct = this.products.find(p => p.id === this.currentProduct.id);
        const stockDiff = (this.currentProduct.stock || 0) - (oldProduct?.stock || 0);

        const { id, ...updateData } = this.currentProduct as any;
        updateData.updatedAt = new Date().toISOString();
        await this.productService.updateProduct(this.currentProduct.id, this.cleanUndefined(updateData));
        
        if (stockDiff !== 0) {
          await this.inventoryService.logMovement({
            productId: this.currentProduct.id,
            productName: this.currentProduct.nombre || '',
            change: stockDiff,
            reason: 'manual_entry',
            date: new Date().toISOString(),
            adminEmail: adminEmail
          });
        }

        await this.changeHistoryService.logChange({
          action: 'update',
          entity: 'product',
          entityId: this.currentProduct.id,
          details: `Producto "${this.currentProduct.nombre}" actualizado por ${adminEmail}`
        });
        
        this.modalService.showAlert('¡Éxito!', 'Producto actualizado exitosamente', 'success');
      } else {
        const newProductData = this.cleanUndefined({
          ...this.currentProduct,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }) as Omit<Product, 'id'>;
        
        const docRef = await this.productService.addProduct(newProductData);
        
        if (this.currentProduct.stock && this.currentProduct.stock > 0) {
          await this.inventoryService.logMovement({
            productId: docRef.id,
            productName: this.currentProduct.nombre || '',
            change: this.currentProduct.stock,
            reason: 'manual_entry',
            date: new Date().toISOString(),
            adminEmail: adminEmail
          });
        }

        await this.changeHistoryService.logChange({
          action: 'create',
          entity: 'product',
          entityId: docRef.id,
          details: `Nuevo producto "${this.currentProduct.nombre}" creado por ${adminEmail}`
        });

        this.modalService.showAlert('¡Éxito!', 'Producto agregado exitosamente', 'success');
      }
      this.closeModal();
    } catch (error) {
      console.error('Error saving product', error);
      this.modalService.showAlert('Error', 'No se pudo guardar el producto', 'error');
    }
  }

  async deleteProduct(id: string) {
    const productToDelete = this.products.find(p => p.id === id);
    this.modalService.showDelete(
      '¿Eliminar Producto?',
      'Esta acción no se puede deshacer. El producto será eliminado permanentemente del inventario.',
      async () => {
        try {
          await this.productService.deleteProduct(id);
          
          if (productToDelete) {
            const adminEmail = this.authService.currentUserValue?.email || 'Admin@admin.com';
            await this.changeHistoryService.logChange({
              action: 'delete',
              entity: 'product',
              entityId: id,
              details: `Producto "${productToDelete.nombre}" eliminado por ${adminEmail}`
            });
          }
          
          this.modalService.showAlert('Eliminado', 'El producto ha sido eliminado correctamente', 'success');
        } catch (error) {
          console.error('Error deleting product', error);
          this.modalService.showAlert('Error', 'No se pudo eliminar el producto', 'error');
        }
      }
    );
  }

  exportToExcel() {
    if (this.filteredProducts.length === 0) {
      alert('No hay productos para exportar');
      return;
    }

    const dataToExport = this.filteredProducts.map(product => ({
      'ID Producto': product.id || '',
      'Nombre': product.nombre,
      'Código': product.codigo,
      'Categoría': product.categoria,
      'Precio ($)': product.precio,
      'Stock': product.stock,
      'Destacado': product.destacado ? 'Sí' : 'No'
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook: XLSX.WorkBook = { Sheets: { 'Productos': worksheet }, SheetNames: ['Productos'] };
    
    XLSX.writeFile(workbook, `productos_medistock_${new Date().getTime()}.xlsx`);
  }

  async importFromExcel(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convertir a JSON con cabeceras normalizadas (trim y minúsculas)
        const rawData = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (rawData.length === 0) {
          this.modalService.showAlert('Error', 'El archivo Excel está vacío o no tiene el formato correcto.', 'error');
          return;
        }

        this.modalService.showConfirm(
          'Confirmar Importación',
          `Se han detectado ${rawData.length} filas en el archivo. ¿Deseas iniciar la carga masiva?`,
          async () => {
            this.isLoading = true;
            let importedCount = 0;
            let skippedCount = 0;
            let errorCount = 0;

            for (const row of rawData) {
              try {
                // Función auxiliar para buscar valores en diferentes variantes de nombres de columna
                const getVal = (keys: string[]) => {
                  const foundKey = Object.keys(row).find(k => 
                    keys.some(searchKey => k.toLowerCase().trim() === searchKey.toLowerCase())
                  );
                  return foundKey ? row[foundKey] : undefined;
                };

                const nombre = getVal(['nombre', 'product', 'item', 'articulo', 'producto']);
                const precio = Number(getVal(['precio', 'price', 'valor', 'costo']) || 0);
                
                if (!nombre || precio <= 0) {
                  console.warn('Fila saltada por falta de nombre o precio:', row);
                  skippedCount++;
                  continue;
                }

                const newProduct: any = {
                  nombre: String(nombre),
                  descripcion: String(getVal(['descripcion', 'description', 'detalle']) || ''),
                  precio: precio,
                  stock: Number(getVal(['stock', 'cantidad', 'existencias', 'total']) || 0),
                  codigo: String(getVal(['codigo', 'code', 'id', 'referencia', 'ref']) || `IMP-${Date.now()}-${importedCount}`),
                  sku: String(getVal(['sku', 'part number', 'pn']) || ''),
                  categoria: String(getVal(['categoria', 'category', 'tipo']) || 'equipamiento').toLowerCase(),
                  imagen: String(getVal(['imagen', 'image', 'url', 'foto']) || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80'),
                  imagenes: [],
                  destacado: getVal(['destacado', 'featured', 'top']) === 'Sí' || getVal(['destacado', 'featured', 'top']) === true,
                  activo: true,
                  bodegas: {
                    principal: Number(getVal(['stock', 'cantidad', 'existencias']) || 0),
                    norte: 0,
                    sur: 0
                  }
                };

                // Añadir precioOferta solo si existe y es válido
                const precioOferta = getVal(['oferta', 'precio oferta', 'descuento']);
                if (precioOferta !== undefined && precioOferta !== null && precioOferta !== '') {
                  newProduct.precioOferta = Number(precioOferta);
                }

                await this.productService.addProduct(this.cleanUndefined(newProduct));
                importedCount++;
              } catch (err) {
                console.error('Error crítico al procesar fila:', row, err);
                errorCount++;
              }
            }

            this.isLoading = false;
            
            if (importedCount > 0) {
              let msg = `Carga finalizada: ${importedCount} productos agregados.`;
              if (skippedCount > 0) msg += `\n${skippedCount} filas saltadas por datos incompletos.`;
              if (errorCount > 0) msg += `\n${errorCount} errores técnicos.`;
              
              this.modalService.showAlert('Proceso Completado', msg, 'success');
            } else {
              this.modalService.showAlert('Importación Fallida', 'No se pudo agregar ningún producto. Asegúrese de que las columnas tengan nombres como "Nombre" y "Precio".', 'error');
            }
            
            // Forzar recarga de la lista (aunque el observable debería manejarlo)
            event.target.value = '';
          }
        );
      } catch (error) {
        console.error('Error al leer el archivo Excel:', error);
        this.modalService.showAlert('Error de Lectura', 'El archivo no es un Excel válido o está dañado.', 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  downloadTemplate() {
    const template = [
      {
        'Nombre': 'Producto Ejemplo',
        'Descripción': 'Descripción del producto médico',
        'Precio': 15000,
        'Stock': 50,
        'Categoría': 'equipamiento',
        'Código': 'REF-001',
        'SKU': 'SKU-001',
        'Imagen': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
        'Destacado': 'No'
      }
    ];

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(template);
    const workbook: XLSX.WorkBook = { Sheets: { 'Plantilla': worksheet }, SheetNames: ['Plantilla'] };
    XLSX.writeFile(workbook, 'plantilla_importacion_medistock.xlsx');
  }
}
