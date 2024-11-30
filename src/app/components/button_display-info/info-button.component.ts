import {Component, OnDestroy} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';

import {Subscription} from 'rxjs';

import {DisplayService} from '../../services/display.service';
import {SvgService} from '../../services/svg.service';

@Component({
    selector: 'info-button',
    templateUrl: './info-button.component.html',
    styleUrls: ['./info-button.component.css'],
    standalone: true,
    imports: [
        MatIconModule,
        MatTooltipModule
    ]
})
export class InfoButtonComponent implements OnDestroy {

    /* attributes */

    private readonly _sub : Subscription;

    private _disabled : boolean;

    private _overwriteActive : boolean = false;

    /* methods - constructor */

    constructor(
        private _displayService : DisplayService,
        private _svgService : SvgService
    ) {
        this._disabled = true;
        this._sub  = this._displayService.graph$.subscribe(
            graph => {
                console.log('info-button_component noticed new graph');
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

    public get overwriteActive() : boolean {
        return this._overwriteActive;
    }

    public get tooltip() : string {
        if (this._disabled) {
            return '[currently disabled]';
        } else {
            return 'display all node information';
        };
    };
    
    /* methods - other */

    private prevent(inEvent: Event) {
        inEvent.preventDefault();
        inEvent.stopPropagation();
    };

    public processMouseClick(inEvent: MouseEvent) {
        /* to be removed - start */
        console.log('info button clicked - event : ' + inEvent);
        /* to be removed - end */
        this._overwriteActive = !(this._overwriteActive);
        this._svgService.infoOverwrite = this._overwriteActive;
        this._displayService.refreshData();
    };

};