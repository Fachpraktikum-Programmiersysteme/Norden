import {Component} from '@angular/core';
import { ToastService, ToastMessage } from '../../services/toast/toast.service';

@Component({
    selector: 'app-toast',
    templateUrl: './toast.component.html',
    styleUrls: ['./toast.component.css']
})
export class ToastComponent {
    toasts: ToastMessage[];

    constructor(private toastService: ToastService) {
        this.toasts = this.toastService.getToasts();
    }

    dismiss(toast: ToastMessage) {
        this.toastService.dismissToast(toast);
    }
}
