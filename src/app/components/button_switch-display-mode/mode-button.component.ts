import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
// import {MatFabButton} from "@angular/material/button";
// import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

import {DisplayService} from '../../services/display.service';
import {DisplaySettingsSingleton} from "../../classes/display/display-settings.singleton";

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

    private _mode : 'dfg' | 'changes';

    /* methods - constructor */

    constructor(
        private _displaySettings: DisplaySettingsSingleton,
        private _displayService : DisplayService,
    ) {
        this._mode = 'dfg';
    };

    /* methods - getters */

    public get mode() : 'dfg' | 'changes' {
        return this._mode;
    };

    public get tooltip() : string {
        if (this._mode === 'dfg') {
            return 'switch display mode to highlight the latest cut\'s changes';
        } else {
            return 'switch display mode to highlight DFG\'s';
        }
    };

    /* methods - other */

    public processMouseClickA(inEvent: MouseEvent) {
        /* to be removed - start */
        console.log('mode button clicked - selected option A (dfg) : ' + inEvent);
        /* to be removed - end */
        if (this._mode === 'changes') {
            this._mode = 'dfg';
            this._displaySettings.updateState({ mode: this._mode });
            this._displayService.refreshData();
        };
    };

    public processMouseClickB(inEvent: MouseEvent) {
        /* to be removed - start */
        console.log('mode button clicked - selected option B (changes) : ' + inEvent);
        /* to be removed - end */
        if (this._mode === 'dfg') {
            this._mode = 'changes';
            this._displaySettings.updateState({ mode: this._mode });
            this._displayService.refreshData();
        };
    };

};
