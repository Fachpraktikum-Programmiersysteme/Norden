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
    private _graphEmpty : boolean;
    private _minerTerminated : boolean;
    private _nothingMarked : boolean;

    /* methods - constructor */

    constructor(
        private _minerService : InductiveMinerService,
        private _displayService : DisplayService,
    ) {
        this._disabled = true;
        this._graphEmpty = false;
        this._minerTerminated = false;
        this._nothingMarked = false;
        this._sub  = this._displayService.graph$.subscribe(
            graph => {
                if (this._displayService.graphEmpty) {
                    this._disabled = true;
                    this._graphEmpty = true;
                    this._minerTerminated = false;
                    this._nothingMarked = false;
                } else if (this._minerService.checkTermination(graph)) {
                    this._disabled = true;
                    this._graphEmpty = false;
                    this._minerTerminated = true;
                    this._nothingMarked = false;
                } else if ((this._displayService.graph.markedNodes.length < 1) && (this._displayService.graph.markedArcs.length < 1)) {
                    this._disabled = true;
                    this._graphEmpty = false;
                    this._minerTerminated = false;
                    this._nothingMarked = true;
                } else {
                    this._disabled = false;
                    this._graphEmpty = false;
                    this._minerTerminated = false;
                    this._nothingMarked = false;
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
            if (this._graphEmpty) {
                return '[disabled] - (graph empty)';
            } else if (this._minerTerminated) {
                return '[disabled] - (miner terminated)';
            } else if (this._nothingMarked) {
                return '[disabled] - (nothing marked)';
            } else {
                return '[currently disabled]';
            };
        } else {
            return 'check currently selected cut';
        };
    };

    /* methods - other */

    public processMouseClick(inEvent: MouseEvent) {
        this._minerService.checkInput(this._displayService.graph);
    };

};
