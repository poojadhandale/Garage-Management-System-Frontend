import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-toast',
 standalone: true,
  imports: [CommonModule],
  template: `
    <div class="custom-toast" *ngIf="(toastService.toast$ | async)?.show">
      {{ (toastService.toast$ | async)?.message }}
    </div>
  `,
  styleUrl: './toast.css'
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
