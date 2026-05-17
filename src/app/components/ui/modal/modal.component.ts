import { Component, Injectable, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, AlertCircle, CheckCircle, Info, X, Trash2, HelpCircle } from 'lucide-angular';
import { animate, style, transition, trigger } from '@angular/animations';

export interface ModalConfig {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'confirm' | 'delete';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private activeModalSignal = signal<ModalConfig | null>(null);

  get activeModal() {
    return this.activeModalSignal;
  }

  showAlert(title: string, message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.activeModalSignal.set({
      title,
      message,
      type,
      confirmText: 'Aceptar'
    });
  }

  showConfirm(title: string, message: string, onConfirm: () => void, onCancel?: () => void) {
    this.activeModalSignal.set({
      title,
      message,
      type: 'confirm',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      onConfirm: () => {
        onConfirm();
        this.close();
      },
      onCancel: () => {
        if (onCancel) onCancel();
        this.close();
      }
    });
  }

  showDelete(title: string, message: string, onConfirm: () => void) {
    this.activeModalSignal.set({
      title,
      message,
      type: 'delete',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: () => {
        onConfirm();
        this.close();
      },
      onCancel: () => this.close()
    });
  }

  close() {
    this.activeModalSignal.set(null);
  }
}

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div *ngIf="modalService.activeModal() as config" class="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
      <!-- Fondo con opacidad y blur -->
      <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in" (click)="modalService.close()"></div>
      
      <!-- Contenedor del Modal -->
      <div class="relative surface max-w-sm w-full p-8 shadow-2xl animate-slide-up text-center border-slate-200 dark:border-slate-800">
        <!-- Icono según tipo -->
        <div class="h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border"
          [ngClass]="{
            'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border-emerald-100 dark:border-emerald-900/30': config.type === 'success',
            'bg-red-50 dark:bg-red-950/30 text-red-600 border-red-100 dark:border-red-900/30': config.type === 'error' || config.type === 'delete',
            'bg-blue-50 dark:bg-blue-950/30 text-blue-600 border-blue-100 dark:border-blue-900/30': config.type === 'info',
            'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 border-indigo-100 dark:border-indigo-900/30': config.type === 'confirm'
          }">
          <lucide-icon *ngIf="config.type === 'success'" [name]="CheckCircleIcon" class="h-10 w-10"></lucide-icon>
          <lucide-icon *ngIf="config.type === 'error'" [name]="AlertCircleIcon" class="h-10 w-10"></lucide-icon>
          <lucide-icon *ngIf="config.type === 'info'" [name]="InfoIcon" class="h-10 w-10"></lucide-icon>
          <lucide-icon *ngIf="config.type === 'confirm'" [name]="HelpCircleIcon" class="h-10 w-10"></lucide-icon>
          <lucide-icon *ngIf="config.type === 'delete'" [name]="Trash2Icon" class="h-10 w-10"></lucide-icon>
        </div>
        
        <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-2">{{ config.title }}</h3>
        <p class="text-slate-500 dark:text-slate-400 mb-8 text-sm font-medium leading-relaxed">
          {{ config.message }}
        </p>
        
        <div class="flex flex-col sm:flex-row gap-3">
          <button *ngIf="config.cancelText" (click)="config.onCancel ? config.onCancel() : modalService.close()" 
            class="flex-1 px-6 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
            {{ config.cancelText }}
          </button>
          <button (click)="config.onConfirm ? config.onConfirm() : modalService.close()" 
            class="flex-1 px-6 py-4 rounded-2xl font-bold transition-all shadow-lg"
            [ngClass]="{
              'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/30': config.type === 'success',
              'bg-red-600 text-white hover:bg-red-700 shadow-red-600/30': config.type === 'error' || config.type === 'delete',
              'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/30': config.type === 'info',
              'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/30': config.type === 'confirm',
              'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-600/30': !config.type
            }">
            {{ config.confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  animations: [
    trigger('fade-in', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('slide-up', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateY(20px)', opacity: 0 }))
      ])
    ])
  ]
})
export class ModalComponent {
  readonly CheckCircleIcon = CheckCircle;
  readonly AlertCircleIcon = AlertCircle;
  readonly InfoIcon = Info;
  readonly XIcon = X;
  readonly Trash2Icon = Trash2;
  readonly HelpCircleIcon = HelpCircle;

  constructor(public modalService: ModalService) {}
}
