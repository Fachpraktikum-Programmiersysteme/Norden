import {Component, OnDestroy} from '@angular/core';
// import {MatFabButton} from "@angular/material/button";
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';

import {Subscription} from 'rxjs';

import {ToastService} from '../../services/toast.service';
import {DisplayService} from '../../services/display.service';
import {SettingsSingleton} from "../../classes/settings/settings.singleton";

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
    private _logEmpty : boolean;

    private _animationsDisabled : boolean;

    /* methods - constructor */

    constructor(
        private _settings : SettingsSingleton,
        private _displayService : DisplayService,
        private _toastService : ToastService,
    ) {
        this._disabled = true;
        this._logEmpty = false;
        this._animationsDisabled = true;
        this._sub  = this._displayService.graph$.subscribe(
            graph => {
                if (this._displayService.graph.logArray.length > 0) {
                    this._disabled = false;
                    this._logEmpty = false;
                } else {
                    this._disabled = true;
                    this._logEmpty = true;
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

    public get animationsDisabled() : boolean {
        return this._animationsDisabled;
    };

    public get tooltip() : string {
        if (this._disabled) {
            if (this._logEmpty) {
                return '[disabled] - (log empty)';
            } else {
                return '[currently disabled]';
            };
        } else {
            if (this._animationsDisabled) {
                return 'display animated trace objects';
            } else {
                return 'hide animated trace objects';
            };
        };
    };

    /* methods - other */

    public processMouseClick(inEvent: MouseEvent) {
        this._animationsDisabled = !(this._animationsDisabled);
        this._settings.updateState({ traceAnimationsDisabled: this._animationsDisabled });
        this._displayService.refreshData();
        if (this._animationsDisabled) {
            this._toastService.showToast('animated traces hidden', 'info');
        } else {
            this._toastService.showToast('animated traces shown', 'info');
        };
    };

};