import {Component, OnDestroy} from '@angular/core';
// import {MatFabButton} from "@angular/material/button";
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';

import {Subscription} from 'rxjs';

import {DisplayService} from '../../services/display.service';
import {InductiveMinerService} from '../../services/inductive-miner.service';

@Component({
    selector: 'submit-button',
    templateUrl: './submit-button.component.html',
    styleUrls: ['./submit-button.component.css'],
    standalone: true,
    imports: [
        // MatFabButton,
        MatIconModule,
        MatTooltipModule
    ]
})
export class SubmitButtonComponent implements OnDestroy {

    /* attributes */

    private readonly _sub : Subscription;

    private _disabled : boolean;

    /* methods - constructor */

    constructor(
        private _displayService : DisplayService, 
        private _minerService : InductiveMinerService
    ) {
        this._disabled = true;
        this._sub  = this._displayService.graph$.subscribe(
            graph => {
                console.log('delete-button_component noticed new graph');
                if ((this._displayService.graph.markedNodes.length > 0) || (this._displayService.graph.markedArcs.length > 0)) {
                    this._disabled = false;
                } else {
                    this._disabled = true;
                }
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
    };

    public get tooltip() : string {
        if (this._disabled) {
            return '[currently disabled]';
        } else {
            return 'check currently selected cut';
        };
    };
    
    /* methods - other */

    private prevent(inEvent: Event) {
        inEvent.preventDefault();
        inEvent.stopPropagation();
    };

    public processMouseClick(inEvent: MouseEvent) {
        /* to be removed - start */
        console.log('submit button clicked - event : ' + inEvent);
        /* to be removed - end */
        this._minerService.checkCut(this._displayService.graph);
    };

};