import {Component, OnDestroy} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';

import {Subscription} from 'rxjs';
import { ToastService } from '../../services/toast/toast.service';
import {DisplayService} from '../../services/display.service';

@Component({
    selector: 'delete-button',
    templateUrl: './delete-button.component.html',
    styleUrls: ['./delete-button.component.css'],
    standalone: true,
    imports: [
        MatIconModule,
        MatTooltipModule
    ]
})
export class DeleteButtonComponent implements OnDestroy {

    /* attributes */

    private readonly _sub : Subscription;

    private _disabled : boolean;

    /* methods - constructor */

    constructor(
        private _displayService : DisplayService,
        private toastService: ToastService
    ) {
        this._disabled = true;
        this._sub  = this._displayService.graph$.subscribe(
            graph => {
                console.log('delete-button_component noticed new graph');
                if (this._displayService.graphEmpty) {
                    this._disabled = true;
                } else {
                    this._disabled = false;
                };
            }
        );
    };

    /* methods - on destroy */

    ngOnDestroy(): void {
        this._sub.unsubscribe();
    };

    /* methods - getters */

    public get disabled() : boolean {
        return this._disabled;
    }

    public get tooltip() : string {
        if (this._disabled) {
            return '[currently disabled]';
        } else {
            return 'delete currently displayed graph';
        };
    };

    /* methods - other */

    private prevent(inEvent: Event) {
        inEvent.preventDefault();
        inEvent.stopPropagation();
    };
    triggerToast() {
        this.toastService.showToast('Delete button clicked', 'success');
    }

    public processMouseClick(inEvent: MouseEvent) {
        /* to be removed - start */
        console.log('delete button clicked - event : ' + inEvent);
        /* to be removed - end */
        this._displayService.deleteData();
        this.triggerToast();
    };

}
