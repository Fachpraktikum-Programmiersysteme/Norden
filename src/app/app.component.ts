import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';

import {TextParserService} from './services/text-parser.service';
import {JsonParserService} from './services/json-parser.service';
import {XesParserService} from './services/xes-parser.service';
import {DisplayService} from './services/display.service';
import {Graph} from './classes/graph-representation/graph';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent {

    /* attributes */

    public textAreaFc: FormControl;

    /* methods - constructor */

    constructor(
        private _txtParserService: TextParserService,
        private _xesParserService: XesParserService,
        private _jsonParserService: JsonParserService,
        private _displayService: DisplayService
    ) {
        this.textAreaFc = new FormControl();
        this.textAreaFc.disable();
    };

    /* methods - other */

    public processSourceChange(inSourceData : [string, string]) : void {
        /* to be removed - start*/
        console.log('processing SourceChange-event - type: "' + inSourceData[0] + '", content: "' + inSourceData[1] + '"');
        /* to be removed - end*/
        this.textAreaFc.setValue(inSourceData[1]);
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
            };
        };
        if (parsedContent !== undefined) {
            this._displayService.updateData(parsedContent[0], parsedContent[1]);
        };
    };
    
};