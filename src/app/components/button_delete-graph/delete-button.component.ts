import {Component, OnDestroy} from '@angular/core';
// import {MatFabButton} from "@angular/material/button";
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';

import {Subscription} from 'rxjs';

import {ToastService} from '../../services/toast.service';
import {DisplayService} from '../../services/display.service';
import {SettingsSingleton} from 'src/app/classes/settings/settings.singleton';

@Component({
    selector: 'delete-button',
    templateUrl: './delete-button.component.html',
    styleUrls: ['./delete-button.component.css'],
    standalone: true,
    imports: [
        // MatFabButton,
        MatIconModule,
        MatTooltipModule
    ]
})
export class DeleteButtonComponent implements OnDestroy {

    /* attributes */

    private readonly _sub : Subscription;

    private _disabled : boolean;
    private _graphEmpty : boolean;

    /* methods - constructor */

    constructor(
        private _settings : SettingsSingleton,
        private _displayService : DisplayService,
        private _toastService: ToastService,
    ) {
        this._disabled = true;
        this._graphEmpty = false;
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

    public get tooltip() : string {
        if (this._disabled) {
            if (this._graphEmpty) {
                return '[disabled] - (graph empty)';
            } else {
                return '[currently disabled]';
            };
        } else {
            return 'delete graph';
        };
    };

    /* methods - other */

    public processMouseClick() {
        this._displayService.deleteData();
        this._settings.updateState({ falseInputStage : 0 });
        this._settings.updateState({ resetInputForm : true });
        this._toastService.showToast('graph deleted', 'info');
    };

};