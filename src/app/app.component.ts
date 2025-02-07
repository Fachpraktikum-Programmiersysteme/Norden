import {Component, OnDestroy} from '@angular/core';
import {FormControl} from '@angular/forms';

import {Subscription} from 'rxjs';

import {TextParserService} from './services/text-parser.service';
import {JsonParserService} from './services/json-parser.service';
import {XesParserService} from './services/xes-parser.service';
import {GraphLogService} from "./services/graph-log.service";
import {DisplayService} from './services/display.service';
import {ToastService} from './services/toast.service';
import {Graph} from './classes/graph-representation/graph';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnDestroy {

    /* attributes */

    private _sub : Subscription;

    public fileAreaFc : FormControl;
    public logAreaFc : FormControl;

    public logArray : {id : number, events : {id : number, label : string, color : string}[]}[] = [];

    public toastMessages: Array<{
        message: string,
        type: "success" | "error" | "warning" | "info",
        duration: number }> = [];

    /* methods - constructor */

    constructor(
        private _jsonParserService : JsonParserService,
        private _xesParserService : XesParserService,
        private _txtParserService : TextParserService,
        private _displayService : DisplayService,
        private _toastService : ToastService
    ) {
        this.fileAreaFc = new FormControl();
        this.fileAreaFc.disable();
        this.logAreaFc = new FormControl();
        this.logAreaFc.disable();
        this.logArray = [];
        this._sub = this._displayService.graph$.subscribe(
            graph => {
                this.logAreaFc.setValue(this._displayService.generateOutputLogString());
                this.logArray = GraphLogService.generateOutputLogArray(graph);
            }
        );
        this._toastService.toast$.subscribe(toast => {
            this.toastMessages.push(toast);
            setTimeout(() => {
                /* removes oldest toast */
                this.toastMessages.shift();
            }, toast.duration);
        });
    };

    /* methods - on destroy */

    ngOnDestroy(): void {
        this._sub.unsubscribe();
    };

    /* methods - other */

    public processSourceChange(inSourceData : [string, string]) : void {
        this.fileAreaFc.setValue(inSourceData[1]);
        let parsedContent : Graph = new Graph;
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
        this._displayService.resetZoom();
        this._displayService.updateData(parsedContent);
    };

};