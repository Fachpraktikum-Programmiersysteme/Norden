import {Component, OnDestroy} from '@angular/core';
// import {MatFabButton} from "@angular/material/button";
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';

import {Subscription} from 'rxjs';

import {ToastService} from '../../services/toast.service';
import {DisplayService} from '../../services/display.service';
import {SettingsSingleton} from "../../classes/settings/settings.singleton";

@Component({
    selector: 'labels-button',
    templateUrl: './labels-button.component.html',
    styleUrls: ['./labels-button.component.css'],
    standalone: true,
    imports: [
        // MatFabButton,
        MatIconModule,
        MatTooltipModule
    ]
})
export class LabelsButtonComponent implements OnDestroy {

    /* attributes */

    private readonly _sub : Subscription;

    private _disabled : boolean;
    private _graphEmpty : boolean;

    private _labelsDisabled : boolean;

    /* methods - constructor */

    constructor(
        private _settings : SettingsSingleton,
        private _displayService : DisplayService,
        private _toastService : ToastService,
    ) {
        this._disabled = true;
        this._graphEmpty = false;
        this._labelsDisabled = true;
        this._sub  = this._displayService.graph$.subscribe(
            graph => {
                if (this._displayService.graphEmpty) {
                    this._disabled = true;
                    this._graphEmpty = true;
                } else {
                    this._disabled = false;
                    this._graphEmpty = false;
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

    public get labelsDisabled() : boolean {
        return this._labelsDisabled;
    };

    public get tooltip() : string {
        if (this._disabled) {
            if (this._graphEmpty) {
                return '[disabled] - (graph empty)';
            } else {
                return '[currently disabled]';
            };
        } else {
            if (this._labelsDisabled) {
                return 'display node labels';
            } else {
                return 'hide node labels';
            };
        };
    };

    /* methods - other */

    public processMouseClick(inEvent: MouseEvent) {
        this._labelsDisabled = !(this._labelsDisabled);
        this._settings.updateState({ nodeLabelsDisabled: this._labelsDisabled });
        this._displayService.refreshData();
        if (this._labelsDisabled) {
            this._toastService.showToast('node labels hidden', 'info');
        } else {
            this._toastService.showToast('node labels shown', 'info');
        };
    };

};