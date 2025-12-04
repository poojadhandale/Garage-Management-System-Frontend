import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastState = new BehaviorSubject<{ show: boolean; message: string }>({
    show: false,
    message: '',
  });

  toast$ = this.toastState.asObservable();

  show(message: string, duration: number = 3000) {
    this.toastState.next({ show: true, message });

    setTimeout(() => {
      this.toastState.next({ show: false, message: '' });
    }, duration);
  }
}