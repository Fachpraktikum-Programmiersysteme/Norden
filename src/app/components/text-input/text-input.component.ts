import {Component, EventEmitter, OnDestroy, Output} from '@angular/core';
import {FormsModule, NgForm} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatFormFieldModule} from '@angular/material/form-field';

import {Subscription} from 'rxjs';

import {SettingsSingleton} from 'src/app/classes/settings/settings.singleton';

@Component({
    selector: 'text-input',
    templateUrl: './text-input.component.html',
    styleUrls: ['./text-input.component.css'],
    standalone: true,
    imports: [
        FormsModule,
        MatInputModule,
        MatButtonModule,
        MatTooltipModule,
        MatFormFieldModule
    ]
})
export class TextInputComponent implements OnDestroy {

    /* properties */

    @Output('textData') textData : EventEmitter<[string, string]>;

    /* attributes */

    private _sub : Subscription;

    private _inputText : string;

    /* methods - constructor */

    public constructor(
        private _settings : SettingsSingleton
    ) {
        this.textData = new EventEmitter<[string, string]>();
        this._inputText = '';
        this._sub = this._settings.state$.subscribe(
            state => {
                if (state.resetInputForm) {
                    this._inputText = '';
                    this._settings.updateState({ resetInputForm : false });
                };
            }
        );
    };

    /* methods - on destroy */

    ngOnDestroy(): void {
        this.textData.complete();
    };

    /* methods - getters */

    public get inputText() : string {
        return this._inputText;
    };

    /* methods - setters */

    public set inputText(inString : string) {
        this._inputText = inString;
    };

    /* methods - other */

    public processFormSubmit(inEvent : SubmitEvent) : void {
        inEvent.preventDefault();
        this.emitTextData(this._inputText);
        /* to be removed - start */
        console.log('submit action triggered - text : "' + this._inputText + '"');
        /* to be removed - end */
    };

    private emitTextData(inString : string | undefined) : void {
        if (inString === undefined) {
            return;
        };
        this.textData.emit(['txt', inString]);
    };

};