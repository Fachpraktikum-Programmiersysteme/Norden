import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
// import {MatFabButton} from "@angular/material/button";
// import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

import {DisplayService} from '../../services/display.service';
import {GlobalStateSingleton} from "../../classes/global-state/global-state.singleton";

@Component({
    selector: 'mode-button',
    templateUrl: './mode-button.component.html',
    styleUrls: ['./mode-button.component.css'],
    standalone: true,
    imports: [
        // MatFabButton,
        // MatIconModule,
        MatTooltipModule,
        MatButtonToggleModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModeButtonComponent {

    /* attributes */

    private _mode : 'default' | 'dfg';

    /* methods - constructor */

    constructor(
        private _displayService : DisplayService,
        private globalState: GlobalStateSingleton,
    ) {
        this._mode = 'default';
    };

    /* methods - getters */

    public get mode() : 'default' | 'dfg' {
        return this._mode;
    };

    public get tooltip() : string {
        if (this._mode) {
            return 'switch display mode' + '\,\n';
        } else {
            return 'switch display mode' + '\,\n' + '(currently displaying DFG\'s)';
        }
    };

    /* methods - other */

    private prevent(inEvent: Event) {
        inEvent.preventDefault();
        inEvent.stopPropagation();
    };

    public processMouseClickA(inEvent: MouseEvent) {
        /* to be removed - start */
        console.log('mode button clicked - selected option A (default) : ' + inEvent);
        /* to be removed - end */
        if (this._mode === 'dfg') {
            this._mode = 'default';
            this.globalState.updateState({ mode: this._mode });
            this._displayService.refreshData();
        };
    };

    public processMouseClickB(inEvent: MouseEvent) {
        /* to be removed - start */
        console.log('mode button clicked - selected option B (dfg) : ' + inEvent);
        /* to be removed - end */
        if (this._mode === 'default') {
            this._mode = 'dfg';
            this.globalState.updateState({ mode: this._mode });
            this._displayService.refreshData();
        };
    };

};
