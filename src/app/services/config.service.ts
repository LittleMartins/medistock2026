import { Injectable } from '@angular/core';

export interface SiteConfig {
  companyName: string;
  contactPhone: string;
  contactEmail: string;
  schedule: string;
  address: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  readonly config: SiteConfig = {
    companyName: 'Medistock',
    contactPhone: '+56 2 2123 4567',
    contactEmail: 'soporte@medistock.cl',
    schedule: 'Lun-Vie: 9:00 - 18:00',
    address: 'Santiago, Chile'
  };

  constructor() { }

  getConfig(): SiteConfig {
    return this.config;
  }
}
