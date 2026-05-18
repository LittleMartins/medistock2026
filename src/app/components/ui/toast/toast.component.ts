import { Component, Injectable, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-angular';
import { animate, style, transition, trigger } from '@angular/animations';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSignal = signal<Toast[]>([]);
  private nextId = 0;

  get toasts() {
    return this.toastsSignal;
  }

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success', duration = 3000) {
    const id = this.nextId++;
    this.toastsSignal.update(toasts => [...toasts, { id, message, type }]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  remove(id: number) {
    this.toastsSignal.update(toasts => toasts.filter(t => t.id !== id));
  }
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <div 
        *ngFor="let toast of toastService.toasts()"
        @toastAnimation
        class="flex items-center p-4 mb-2 text-sm rounded-lg shadow-lg"
        [ngClass]="{
          'bg-green-100 text-green-800 dark:bg-green-900/80 dark:text-green-200': toast.type === 'success',
          'bg-red-100 text-red-800 dark:bg-red-900/80 dark:text-red-200': toast.type === 'error',
          'bg-blue-100 text-blue-800 dark:bg-blue-900/80 dark:text-blue-200': toast.type === 'info',
          'bg-amber-100 text-amber-800 dark:bg-amber-900/80 dark:text-amber-200': toast.type === 'warning'
        }"
        role="alert"
      >
        <lucide-icon *ngIf="toast.type === 'success'" [name]="CheckCircleIcon" class="h-5 w-5 mr-3 flex-shrink-0"></lucide-icon>
        <lucide-icon *ngIf="toast.type === 'error'" [name]="AlertCircleIcon" class="h-5 w-5 mr-3 flex-shrink-0"></lucide-icon>
        <lucide-icon *ngIf="toast.type === 'info'" [name]="InfoIcon" class="h-5 w-5 mr-3 flex-shrink-0"></lucide-icon>
        <lucide-icon *ngIf="toast.type === 'warning'" [name]="AlertTriangleIcon" class="h-5 w-5 mr-3 flex-shrink-0"></lucide-icon>
        
        <span class="font-medium mr-4">{{ toast.message }}</span>
        
        <button (click)="toastService.remove(toast.id)" class="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-black/10 focus:ring-2 focus:ring-black/20">
          <span class="sr-only">Close</span>
          <lucide-icon [name]="XIcon" class="h-4 w-4"></lucide-icon>
        </button>
      </div>
    </div>
  `,
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateY(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class ToastComponent {
  readonly CheckCircleIcon = CheckCircle;
  readonly AlertCircleIcon = AlertCircle;
  readonly InfoIcon = Info;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly XIcon = X;

  constructor(public toastService: ToastService) {}
}
