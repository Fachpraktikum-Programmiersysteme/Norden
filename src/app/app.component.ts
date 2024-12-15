import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';

import {TextParserService} from './services/text-parser.service';
import {JsonParserService} from './services/json-parser.service';
import {XesParserService} from './services/xes-parser.service';
import {DisplayService} from './services/display.service';
import {Graph} from './classes/graph-representation/graph';
import { ToastService } from './services/toast/toast.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent {

    /* attributes */

    public fileAreaFc: FormControl;
    public logAreaFc: FormControl;
    toastMessages: Array<{
        message: string,
        type: "success" | "error" | "warning" | "info",
        duration: number }> = [];

    /* methods - constructor */

    constructor(
        private _txtParserService: TextParserService,
        private _xesParserService: XesParserService,
        private _jsonParserService: JsonParserService,
        private _displayService: DisplayService,
        private toastService: ToastService
    ) {
        this.fileAreaFc = new FormControl();
        this.fileAreaFc.disable();
        this.logAreaFc = new FormControl();
        this.logAreaFc.disable();
        this.toastService.toast$.subscribe(toast => {
            this.toastMessages.push(toast);
            setTimeout(() => {
                this.toastMessages.shift(); // Entfernt den ältesten Toast
            }, toast.duration);
        });
    };

    /* methods - other */

    public processSourceChange(inSourceData : [string, string]) : void {
        /* to be removed - start*/
        console.log('processing SourceChange-event - type: "' + inSourceData[0] + '", content: "' + inSourceData[1] + '"');
        /* to be removed - end*/
        this.fileAreaFc.setValue(inSourceData[1]);
        let parsedContent : [Graph, number[][]] | undefined;
        switch (inSourceData[0]) {
            case 'txt' : {
                parsedContent = this._txtParserService.parse(inSourceData[1]);
                break;
            }
            case 'xes' : {
                parsedContent = this._xesParserService.parse(inSourceData[1]);
                break;
            }
            case 'json' : {
                parsedContent = this._jsonParserService.parse(inSourceData[1]);
                break;
            }
        }
        if (parsedContent !== undefined) {
            this._displayService.updateData(parsedContent[0], parsedContent[1]);
            this.logAreaFc.setValue(parsedContent[1]);
        }
    };

}
