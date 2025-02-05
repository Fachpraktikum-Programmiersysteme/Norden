import {Component, OnDestroy} from '@angular/core';
// import {MatFabButton} from "@angular/material/button";
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';

import {Subscription} from 'rxjs';

import {ToastService} from '../../services/toast.service';
import {DisplayService} from '../../services/display.service';
import {InductiveMinerService} from '../../services/inductive-miner.service';

import {SettingsSingleton} from "../../classes/settings/settings.singleton";

@Component({
    selector: 'basecase-button',
    templateUrl: './basecase-button.component.html',
    styleUrls: ['./basecase-button.component.css'],
    standalone: true,
    imports: [
        // MatFabButton,
        MatIconModule,
        MatTooltipModule
    ]
})
export class BaseCaseButtonComponent implements OnDestroy {

    /* attributes */

    private readonly _sub : Subscription;

    private _disabled : boolean;
    private _graphEmpty : boolean;
    private _minerTerminated : boolean;

    private _automationDisabled : boolean;

    /* methods - constructor */

    constructor(
        private _settings : SettingsSingleton,
        private _minerService : InductiveMinerService,
        private _displayService : DisplayService,
        private _toastService : ToastService,
    ) {
        this._disabled = true;
        this._graphEmpty = false;
        this._minerTerminated = false;
        this._automationDisabled = false;
        this._sub  = this._displayService.graph$.subscribe(
            graph => {
                if (this._displayService.graphEmpty) {
                    this._disabled = true;
                    this._graphEmpty = true;
                    this._minerTerminated = false;
                } else if (this._minerService.checkTermination(graph)) {
                    this._disabled = true;
                    this._graphEmpty = false;
                    this._minerTerminated = true;
                } else {
                    this._disabled = false;
                    this._graphEmpty = false;
                    this._minerTerminated = false;
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

    public get automationDisabled() : boolean {
        return this._automationDisabled;
    };

    public get tooltip() : string {
        if (this._disabled) {
            if (this._graphEmpty) {
                return '[disabled] - (graph empty)';
            } else if (this._minerTerminated) {
                return '[disabled] - (miner terminated)';
            } else {
                return '[currently disabled]';
            };
        } else {
            if (this._automationDisabled) {
                return 'automatically convert Base Cases';
            } else {
                return 'disable automatic Base Case conversion';
            };
        };
    };

    /* methods - other */

    public processMouseClick() {
        this._automationDisabled = !(this._automationDisabled);
        if (this._automationDisabled) {
            this._settings.updateState({ basecaseMode: 'manual' });
        } else {
            this._settings.updateState({ basecaseMode: 'auto' });
        };
        this._displayService.refreshData();
        if (this._automationDisabled) {
            this._toastService.showToast('automatic Base Case conversion disabled', 'info');
        } else {
            this._toastService.showToast('automatic Base Case conversion enabled', 'info');
        };
    };

};