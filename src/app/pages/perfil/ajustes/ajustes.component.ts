import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService, UserData } from '../../../services/auth.service';
import { LucideAngularModule, User, Mail, Phone, MapPin, Camera, Save, Loader2, ChevronRight, Home, Building2, Map, Link, Package, Check, CheckCircle, XCircle, AlertCircle } from 'lucide-angular';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-ajustes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  templateUrl: './ajustes.component.html'
})
export class AjustesComponent implements OnInit {
  private authService = inject(AuthService);
  private storage = inject(Storage);

  readonly UserIcon = User;
  readonly MailIcon = Mail;
  readonly PhoneIcon = Phone;
  readonly MapPinIcon = MapPin;
  readonly CameraIcon = Camera;
  readonly SaveIcon = Save;
  readonly Loader2Icon = Loader2;
  readonly ChevronRightIcon = ChevronRight;
  readonly HomeIcon = Home;
  readonly Building2Icon = Building2;
  readonly MapIcon = Map;
  readonly LinkIcon = Link;
  readonly PackageIcon = Package;
  readonly CheckIcon = Check;
  readonly CheckCircleIcon = CheckCircle;
  readonly XCircleIcon = XCircle;

  userData: UserData | null = null;
  isLoading = true;
  isSaving = false;
  successMessage = '';
  errorMessage = '';
  showUrlInput = false;

  // Form fields
  nombre = '';
  apellido = '';
  telefono = '';
  direccion = '';
  numeroDepto = '';
  region = '';
  comuna = '';
  referencias = '';
  fotoUrl = '';
  inputFotoUrl = '';

  async ngOnInit() {
    try {
      this.userData = await firstValueFrom(this.authService.userData$);
      if (this.userData) {
        this.nombre = this.userData.name || '';
        this.apellido = this.userData.lastName || '';
        this.telefono = this.userData.telefono || this.userData.phone || '';
        this.direccion = this.userData.direccion || this.userData.address || '';
        this.numeroDepto = this.userData.numeroDepto || '';
        this.region = this.userData.region || '';
        this.comuna = this.userData.comuna || '';
        this.referencias = this.userData.referencias || '';
        this.fotoUrl = this.userData.photoUrl || '';
        this.inputFotoUrl = this.fotoUrl;
      }
    } catch (error) {
      console.error('Error al cargar datos de usuario:', error);
    } finally {
      this.isLoading = false;
    }
  }

  toggleUrlInput() {
    this.showUrlInput = !this.showUrlInput;
  }

  async applyPhotoUrl() {
    if (!this.inputFotoUrl || !this.userData) return;
    
    try {
      this.isSaving = true;
      this.fotoUrl = this.inputFotoUrl;
      await this.authService.updateUserData(this.userData.uid, { photoUrl: this.fotoUrl });
      this.successMessage = 'Imagen de perfil actualizada desde URL.';
      this.showUrlInput = false;
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error) {
      this.errorMessage = 'No se pudo actualizar la imagen desde la URL.';
    } finally {
      this.isSaving = false;
    }
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file || !this.userData) return;

    try {
      this.isSaving = true;
      const filePath = `perfiles/${this.userData.uid}/${Date.now()}_${file.name}`;
      const storageRef = ref(this.storage, filePath);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      this.fotoUrl = downloadURL;
      await this.authService.updateUserData(this.userData.uid, { photoUrl: downloadURL });
      this.successMessage = 'Foto de perfil actualizada correctamente.';
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error) {
      console.error('Error al subir foto:', error);
      this.errorMessage = 'No se pudo subir la foto. Inténtalo de nuevo.';
    } finally {
      this.isSaving = false;
    }
  }

  async guardarCambios() {
    if (!this.userData) return;

    try {
      this.isSaving = true;
      this.errorMessage = '';
      
      const updatedData = {
        name: this.nombre,
        lastName: this.apellido,
        telefono: this.telefono,
        direccion: this.direccion,
        numeroDepto: this.numeroDepto,
        region: this.region,
        comuna: this.comuna,
        referencias: this.referencias
      };

      await this.authService.updateUserData(this.userData.uid, updatedData);
      this.successMessage = 'Tus datos se han actualizado con éxito.';
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      this.errorMessage = 'Hubo un error al guardar los cambios.';
    } finally {
      this.isSaving = false;
    }
  }
}
