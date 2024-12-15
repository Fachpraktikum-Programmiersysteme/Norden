import {Component, Input} from '@angular/core';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ToastService} from "../../services/toast/toast.service";

@Component({
    selector: 'app-example-button',
    templateUrl: './example-button.component.html',
    styleUrls: ['./example-button.component.css'],
    standalone: true,
    imports: [
        MatTooltipModule
    ]
})
export class ExampleButtonComponent {

    public static readonly META_DATA_CODE = 'drag-file-location';
    toastMessages: Array<{ message: string, type: string, duration: number }> = [];

    @Input() title: string | undefined;


    constructor(private toastService: ToastService) { }

    prevent(e: Event) {
        e.preventDefault();
        e.stopPropagation();
    }

    hoverStart(e: MouseEvent) {
        this.prevent(e);
        const target = (e.target as HTMLElement);
        target.classList.add('mouse-hover');
    }

    hoverEnd(e: MouseEvent) {
        this.prevent(e);
        const target = (e.target as HTMLElement);
        target.classList.remove('mouse-hover');
    }

    triggerToast() {
        this.toastService.showToast('Dies ist eine erfolgreiche Nachricht!', 'success');
    }

    processMouseClick(e: MouseEvent) {
        this.triggerToast()
    }

}
