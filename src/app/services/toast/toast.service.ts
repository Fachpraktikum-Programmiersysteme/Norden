import { Injectable } from '@angular/core';

export interface ToastMessage {
    text: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
}

@Injectable({
    providedIn: 'root',
})
export class ToastService {
    private toasts: ToastMessage[] = [];

    getToasts() {
        return this.toasts;
    }

    showToast(message: ToastMessage) {
        this.toasts.push(message);
        if (message.duration) {
            setTimeout(() => this.dismissToast(message), message.duration);
        }
    }

    dismissToast(message: ToastMessage) {
        this.toasts = this.toasts.filter((toast) => toast !== message);
    }
}
