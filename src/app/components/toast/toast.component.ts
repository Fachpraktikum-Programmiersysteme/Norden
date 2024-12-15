import {Component, Input, OnInit, OnDestroy, NgModule} from '@angular/core';


//import { ToastService } from '../../services/toast/toast.service';

@Component({
    selector: 'app-toast',
    templateUrl: './toast.component.html',
    styleUrls: ['./toast.component.css']
})

export class ToastComponent implements OnInit, OnDestroy {

    @Input() message: string = '';
    @Input() duration: number = 3000; // default-value 3 seconds
    @Input() type: 'success' | 'error' | 'info' = 'info'; // Toast-Typ: success, error oder info

    private timer: any;

    constructor() { }

    ngOnInit() {
        // toast disappears after set duration
        this.timer = setTimeout(() => {
            this.close();
        }, this.duration);
    }

    ngOnDestroy() {
        // cleanup timer when component is being destroyed
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    close() {
        // event triggering to remove toast or usage of service to remove toast
    }

}

