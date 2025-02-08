import {Component, OnDestroy} from '@angular/core';
// import {MatFabButton} from "@angular/material/button";
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';

import {Subscription} from 'rxjs';

import {ToastService} from '../../services/toast.service';
import {DisplayService} from '../../services/display.service';
import {SettingsSingleton} from "../../classes/settings/settings.singleton";

@Component({
    selector: 'embedder-button',
    templateUrl: './embedder-button.component.html',
    styleUrls: ['./embedder-button.component.css'],
    standalone: true,
    imports: [
        // MatFabButton,
        MatIconModule,
        MatTooltipModule
    ]
})
export class EmbedderButtonComponent implements OnDestroy {

    /* attributes */

    private readonly _sub : Subscription;

    private _disabled : boolean;
    private _graphEmpty : boolean;

    private _embedderDisabled : boolean;

    /* methods - constructor */

    constructor(
        private _settings : SettingsSingleton,
        private _displayService : DisplayService,
        private _toastService : ToastService,
    ) {
        this._disabled = false;
        this._graphEmpty = false;
        this._embedderDisabled = false;
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

    public get embedderDisabled() : boolean {
        return this._embedderDisabled;
    };

    public get tooltip() : string {
        if (this._disabled) {
            if (this._graphEmpty) {
                return '[disabled] - (graph empty)';
            } else {
                return '[currently disabled]';
            };
        } else {
            if (this._embedderDisabled) {
                return 'automatically arrange graph';
            } else {
                return 'disable graph arrangement';
            };
        };
    };

    /* methods - other */

    public processMouseClick() {
        this._embedderDisabled = !(this._embedderDisabled);
        this._settings.updateState({ springEmbedderDisabled: this._embedderDisabled });
        this._displayService.refreshData();
        if (this._embedderDisabled) {
            this._toastService.showToast('automatic graph arrangement disabled', 'info');
        } else {
            this._toastService.showToast('automatic graph arrangement enabled', 'info');
        };
    };

};