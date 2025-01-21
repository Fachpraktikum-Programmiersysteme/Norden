import {Component, OnDestroy} from '@angular/core';
// import {MatFabButton} from "@angular/material/button";
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';

import {Subscription} from 'rxjs';

import {ToastService} from '../../services/toast.service';
import {DisplayService} from '../../services/display.service';
import {DisplaySettingsSingleton} from "../../classes/display/display-settings.singleton";

@Component({
    selector: 'weight-button',
    templateUrl: './weight-button.component.html',
    styleUrls: ['./weight-button.component.css'],
    standalone: true,
    imports: [
        // MatFabButton,
        MatIconModule,
        MatTooltipModule
    ]
})
export class WeightButtonComponent implements OnDestroy {

    /* attributes */

    private readonly _sub : Subscription;

    private _disabled : boolean;
    private _graphEmpty : boolean;

    private _weightsDisabled : boolean;

    /* methods - constructor */

    constructor(
        private _displaySettings : DisplaySettingsSingleton,
        private _displayService : DisplayService,
        private _toastService : ToastService,
    ) {
        this._disabled = true;
        this._graphEmpty = false;
        this._weightsDisabled = true;
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

    public get weightsDisabled() : boolean {
        return this._weightsDisabled;
    };

    public get tooltip() : string {
        if (this._disabled) {
            if (this._graphEmpty) {
                return '[disabled] - (graph empty)';
            } else {
                return '[currently disabled]';
            };
        } else {
            if (this._weightsDisabled) {
                return 'display arc weights';
            } else {
                return 'hide arc weights';
            };
        };
    };

    /* methods - other */

    public processMouseClick(inEvent: MouseEvent) {
        this._weightsDisabled = !(this._weightsDisabled);
        this._displaySettings.updateState({ arcWeightsDisabled: this._weightsDisabled });
        this._displayService.refreshData();
        if (this._weightsDisabled) {
            this._toastService.showToast('arc weights hidden', 'info');
        } else {
            this._toastService.showToast('arc weights shown', 'info');
        };
    };

};
