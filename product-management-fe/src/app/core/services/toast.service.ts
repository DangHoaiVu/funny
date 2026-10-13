import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSignal = signal<ToastMessage[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();

  showSuccess(message: string, title: string = 'Thành công'): void {
    this.addToast('success', title, message);
  }

  showError(message: string, title: string = 'Lỗi'): void {
    this.addToast('error', title, message);
  }

  showInfo(message: string, title: string = 'Thông báo'): void {
    this.addToast('info', title, message);
  }

  private addToast(type: 'success' | 'error' | 'info', title: string, message: string): void {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5);
    const newToast: ToastMessage = { id, type, title, message };

    this.toastsSignal.update(toasts => [...toasts, newToast]);

    // Tự động đóng toast sau 3.5 giây
    setTimeout(() => {
      this.remove(id);
    }, 3500);
  }

  remove(id: string): void {
    this.toastsSignal.update(toasts => toasts.filter(t => t.id !== id));
  }
}
