import {Component, EventEmitter, OnDestroy, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatFormFieldModule} from '@angular/material/form-field';

import {Subscription} from 'rxjs';

import {DisplayService} from '../../services/display.service';

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

    private readonly _sub : Subscription;

    private _inputText: string;

    private _disabled : boolean;

    /* methods - constructor */

    public constructor(
        private _displayService: DisplayService,
    ) {
        this.textData = new EventEmitter<[string, string]>();
        this._sub  = this._displayService.graph$.subscribe(
            graph => {
                console.log('text-input_component noticed new graph');
            }
        );
        this._inputText = '';
        this._disabled = false;
    };

    /* methods - on destroy */

    ngOnDestroy(): void {
        this._sub.unsubscribe();
        this.textData.complete();
    };

    /* methods - getters */

    public get disabled() : boolean {
        return this._disabled;
    }

    public get inputText() : string {
        return this._inputText;
    }

    /* methods - setters */

    public set inputText(inString : string) {
        this._inputText = inString;
    }


    /* methods - other */

    processFormSubmit(inEvent : SubmitEvent) : void {
        inEvent.preventDefault();
        this.emitTextData(this._inputText);
        /* to be removed - start */
        console.log('submit action triggered - text : "' + this._inputText + '"');
        /* to be removed - end */
    }

    private emitTextData(inString : string | undefined) : void {
        if (inString === undefined) {
            return;
        };
        this.textData.emit(['txt', inString]);
    };

};