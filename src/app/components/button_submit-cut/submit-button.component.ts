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
                console.log('submit-button_component noticed new graph');
                if (this._minerService.checkTermination(graph)) {
                    this._disabled = true;
                } else if ((this._displayService.graph.markedNodes.length < 1) && (this._displayService.graph.markedArcs.length < 1)) {
                    this._disabled = true;
                } else {
                    this._disabled = false;
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

    public async processMouseClick(inEvent: MouseEvent) {
        /* to be removed - start */
        console.log('submit button clicked - event : ' + inEvent);
        /* to be removed - end */
        // this._minerService.checkCut(this._displayService.graph);
        // this._displayService.refreshData();
        /* to be removed - start */
        this._minerService.testExclusiveCut(this._displayService.graph);
        console.error('waiting 5s');
        await new Promise(resolve => setTimeout(resolve, 5000));
        this._minerService.testUnmarkMarked(this._displayService.graph);
        this._displayService.refreshData();
        console.error('waiting 20s');
        await new Promise(resolve => setTimeout(resolve, 20000));
        this._minerService.testBaseCase(this._displayService.graph);
        this._displayService.refreshData();
        /* to be removed - end */
    };

};