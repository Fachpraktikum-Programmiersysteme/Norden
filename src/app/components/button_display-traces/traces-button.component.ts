import {Component, OnDestroy} from '@angular/core';
// import {MatFabButton} from "@angular/material/button";
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';

import {Subscription} from 'rxjs';

import {DisplayService} from '../../services/display.service';
import {GlobalStateSingleton} from "../../classes/global-state/global-state.singleton";

@Component({
    selector: 'traces-button',
    templateUrl: './traces-button.component.html',
    styleUrls: ['./traces-button.component.css'],
    standalone: true,
    imports: [
        // MatFabButton,
        MatIconModule,
        MatTooltipModule
    ]
})
export class TracesButtonComponent implements OnDestroy {

    /* attributes */

    private readonly _sub : Subscription;

    private _disabled : boolean;

    private _animationsDiabled : boolean = false;

    /* methods - constructor */

    constructor(
        private _displayService : DisplayService,
        private globalState: GlobalStateSingleton,
    ) {
        this._disabled = true;
        this._sub  = this._displayService.graph$.subscribe(
            graph => {
                console.log('traces-button_component noticed new log');
                if (this._displayService.graph.logArray.length > 0) {
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

    public get animationsDiabled() : boolean {
        return this._animationsDiabled;
    };

    public get tooltip() : string {
        if (this._disabled) {
            return '[currently disabled]';
        } else {
            return 'display traces as animated objects';
        };
    };

    /* methods - other */

    private prevent(inEvent: Event) {
        inEvent.preventDefault();
        inEvent.stopPropagation();
    };

    public processMouseClick(inEvent: MouseEvent) {
        /* to be removed - start */
        console.log('traces button clicked - event : ' + inEvent);
        /* to be removed - end */
        this._animationsDiabled = !(this._animationsDiabled);
        this.globalState.updateState({ animationsDisabled: this._animationsDiabled });
        this._displayService.refreshData();
    };

};
