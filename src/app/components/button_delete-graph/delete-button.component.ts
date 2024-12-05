import {Component, OnDestroy} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';

import {Subscription} from 'rxjs';

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
        private _displayService : DisplayService
    ) {
        this._disabled = true;
        this._sub  = this._displayService.graph$.subscribe(
            graph => {
                console.log('delete-button_component noticed new graph');
                if (graph.initialState === true) {
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
    
    /* methods - other */

    prevent(inEvent: Event) {
        inEvent.preventDefault();
        inEvent.stopPropagation();
    };

    processMouseClick(inEvent: MouseEvent) {
        /* to be removed - start */
        console.log('delete button clicked - event : ' + inEvent);
        /* to be removed - end */
        this._displayService.deleteGraph();
    };

};