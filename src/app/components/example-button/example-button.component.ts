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

    @Input() title: string | undefined;

    constructor(
        private toastService: ToastService
    ) {}

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

    processMouseClick(e: MouseEvent) {
        this.toastService.showToast({
            text: '`Template button "${this.title}" clicked`!',
            type: 'success',
            duration: 3000,
        });
    }

}
