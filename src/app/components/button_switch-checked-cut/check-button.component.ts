import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
// import {MatFabButton} from "@angular/material/button";
// import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

import {DisplayService} from '../../services/display.service';
import {SettingsSingleton} from "../../classes/settings/settings.singleton";

@Component({
    selector: 'check-button',
    templateUrl: './check-button.component.html',
    styleUrls: ['./check-button.component.css'],
    standalone: true,
    imports: [
        // MatFabButton,
        // MatIconModule,
        MatTooltipModule,
        MatButtonToggleModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckButtonComponent {

    /* attributes */

    private _checkMode : 'ec' | 'sc' | 'pc' | 'lc' | 'bc' | 'ft';

    /* methods - constructor */

    constructor(
        private _settings: SettingsSingleton,
        private _displayService : DisplayService,
    ) {
        this._checkMode = 'ec';
    };

    /* methods - getters */

    public get checkMode() : 'ec' | 'sc' | 'pc' | 'lc' | 'bc' | 'ft' {
        return this._checkMode;
    };

    public get tooltip() : string {
        switch (this._checkMode) {
            case 'ec' : {
                return 'checking for Exclusive Cut';
            }
            case 'sc' : {
                return 'checking for Sequence Cut';
            }
            case 'pc' : {
                return 'checking for Parallel Cut';
            }
            case 'lc' : {
                return 'checking for Loop Cut';
            }
            case 'bc' : {
                return 'checking for Base Case';
            }
            case 'ft' : {
                return 'checking for Fall Through';
            }
        };
    };

    /* methods - other */

    public processMouseClickA() {
        if (this._checkMode !== 'ec') {
            this._checkMode = 'ec';
            this._settings.updateState({ checkMode: this._checkMode });
            this._displayService.refreshData();
        };
    };

    public processMouseClickB() {
        if (this._checkMode !== 'sc') {
            this._checkMode = 'sc';
            this._settings.updateState({ checkMode: this._checkMode });
            this._displayService.refreshData();
        };
    };

    public processMouseClickC() {
        if (this._checkMode !== 'pc') {
            this._checkMode = 'pc';
            this._settings.updateState({ checkMode: this._checkMode });
            this._displayService.refreshData();
        };
    };

    public processMouseClickD() {
        if (this._checkMode !== 'lc') {
            this._checkMode = 'lc';
            this._settings.updateState({ checkMode: this._checkMode });
            this._displayService.refreshData();
        };
    };

    public processMouseClickE() {
        if (this._checkMode !== 'bc') {
            this._checkMode = 'bc';
            this._settings.updateState({ checkMode: this._checkMode });
            this._displayService.refreshData();
        };
    };

    public processMouseClickF() {
        if (this._checkMode !== 'ft') {
            this._checkMode = 'ft';
            this._settings.updateState({ checkMode: this._checkMode });
            this._displayService.refreshData();
        };
    };

};