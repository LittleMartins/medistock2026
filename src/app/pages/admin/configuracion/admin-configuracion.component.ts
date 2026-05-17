import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, AppSettings } from '../../../services/settings.service';
import { LucideAngularModule, Save, Settings, ShieldAlert, Store, Mail, Phone, Percent, Bell, CheckCircle } from 'lucide-angular';

@Component({
  selector: 'app-admin-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './admin-configuracion.component.html'
})
export class AdminConfiguracionComponent implements OnInit {
  private settingsService = inject(SettingsService);

  readonly SaveIcon = Save;
  readonly SettingsIcon = Settings;
  readonly ShieldAlertIcon = ShieldAlert;
  readonly StoreIcon = Store;
  readonly MailIcon = Mail;
  readonly PhoneIcon = Phone;
  readonly PercentIcon = Percent;
  readonly BellIcon = Bell;
  readonly CheckCircleIcon = CheckCircle;

  isLoading = true;
  isSaving = false;
  saveSuccess = false;
  
  settings: AppSettings = {
    storeName: '',
    contactEmail: '',
    supportPhone: '',
    currency: 'CLP',
    taxRate: 19,
    lowStockThreshold: 10,
    enableEmails: true,
    maintenanceMode: false
  };

  async ngOnInit() {
    await this.loadSettings();
  }

  async loadSettings() {
    this.isLoading = true;
    try {
      this.settings = await this.settingsService.getSettings();
    } catch (error) {
      console.error('Error loading settings', error);
    } finally {
      this.isLoading = false;
    }
  }

  async saveSettings() {
    this.isSaving = true;
    this.saveSuccess = false;
    try {
      await this.settingsService.saveSettings(this.settings);
      this.saveSuccess = true;
      setTimeout(() => this.saveSuccess = false, 3000);
    } catch (error) {
      console.error('Error saving settings', error);
    } finally {
      this.isSaving = false;
    }
  }
}
