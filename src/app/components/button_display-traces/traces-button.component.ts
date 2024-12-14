import {Component, OnDestroy} from '@angular/core';
// import {MatFabButton} from "@angular/material/button";
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';

import {Subscription} from 'rxjs';

import {DisplayService} from '../../services/display.service';
import {SvgService} from '../../services/svg.service';

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
        private _svgService : SvgService
    ) {
        this._disabled = true;
        this._sub  = this._displayService.log$.subscribe(
            log => {
                console.log('traces-button_component noticed new log');
                if (this._displayService.logEmpty) {
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

    public get animationsDiabled() : boolean {
        return this._animationsDiabled;
    }

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
        this._svgService.noAnimations = this._animationsDiabled;
        this._displayService.refreshData();
    };

};