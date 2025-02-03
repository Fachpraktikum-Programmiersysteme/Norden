import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
// import {MatFabButton} from "@angular/material/button";
// import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

import {DisplayService} from '../../services/display.service';
import {SettingsSingleton} from "../../classes/settings/settings.singleton";

@Component({
    selector: 'display-button',
    templateUrl: './display-button.component.html',
    styleUrls: ['./display-button.component.css'],
    standalone: true,
    imports: [
        // MatFabButton,
        // MatIconModule,
        MatTooltipModule,
        MatButtonToggleModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisplayButtonComponent {

    /* attributes */

    private _displayMode : 'dfg' | 'changes';

    /* methods - constructor */

    constructor(
        private _settings: SettingsSingleton,
        private _displayService : DisplayService,
    ) {
        this._displayMode = 'dfg';
    };

    /* methods - getters */

    public get displayMode() : 'dfg' | 'changes' {
        return this._displayMode;
    };

    public get tooltip() : string {
        if (this._displayMode === 'dfg') {
            return 'switch display mode to highlight the latest cut\'s changes';
        } else {
            return 'switch display mode to highlight DFG\'s';
        }
    };

    /* methods - other */

    public processMouseClickA(inEvent: MouseEvent) {
        /* to be removed - start */
        console.log('display toggle clicked - selected option A (dfg) : ' + inEvent);
        /* to be removed - end */
        if (this._displayMode === 'changes') {
            this._displayMode = 'dfg';
            this._settings.updateState({ displayMode: this._displayMode });
            this._displayService.refreshData();
        };
    };

    public processMouseClickB(inEvent: MouseEvent) {
        /* to be removed - start */
        console.log('display toggle clicked - selected option B (changes) : ' + inEvent);
        /* to be removed - end */
        if (this._displayMode === 'dfg') {
            this._displayMode = 'changes';
            this._settings.updateState({ displayMode: this._displayMode });
            this._displayService.refreshData();
        };
    };

};