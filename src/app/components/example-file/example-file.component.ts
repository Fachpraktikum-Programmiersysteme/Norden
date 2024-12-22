import {Component, Input} from '@angular/core';
import {MatFabButton} from "@angular/material/button";
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
    selector: 'app-example-file', 
    templateUrl: './example-file.component.html', 
    styleUrls: ['./example-file.component.css'], 
    standalone: true, 
    imports: [
        MatFabButton, 
        MatIconModule, 
        MatTooltipModule
    ]
})
export class ExampleFileComponent {

    @Input() title: string | undefined;
    @Input() label: string | undefined;
    @Input({required: true}) link: string = '';

    /* attributes */

    public static readonly META_DATA_CODE = 'drag-file-location';

    private dragInProgress : boolean = false;

    /* methods - constructor */

    constructor() {}

    /* methods - getters */

    public get tooltip() : string {
        if (this.dragInProgress) {
            return '';
        } else {
            return 'drag and drop onto canvas to display graph';
        };
    };

    public get type() : boolean {
        if (this.link.split('.').pop() === 'xes') {
            return true;
        } else {
            return false;
        };
    };

    /* methods - other */

    private prevent(inEvent: Event) {
        inEvent.preventDefault();
        inEvent.stopPropagation();
    }

    public processMouseEnter(inEvent: MouseEvent) {
        this.prevent(inEvent);
        this.dragInProgress = false;
        const target = (inEvent.target as HTMLElement);
        target.classList.add('mouse-hover');
    }

    public processMouseLeave(inEvent: MouseEvent) {
        this.prevent(inEvent);
        const target = (inEvent.target as HTMLElement);
        target.classList.remove('mouse-hover');
    }

    public processDragEvent(inEvent: DragEvent) {
        this.dragInProgress = true;
        inEvent.dataTransfer!.effectAllowed = 'link';
        inEvent.dataTransfer!.setData(ExampleFileComponent.META_DATA_CODE, this.link);
    }

}
