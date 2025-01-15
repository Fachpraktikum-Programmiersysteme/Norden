import {Component, OnDestroy} from '@angular/core';
import {FormControl} from '@angular/forms';

import {Subscription} from 'rxjs';

import {TextParserService} from './services/text-parser.service';
import {JsonParserService} from './services/json-parser.service';
import {XesParserService} from './services/xes-parser.service';
import {DisplayService} from './services/display.service';
import {Graph} from './classes/graph-representation/graph';
import { ToastService } from './services/toast/toast.service';
import {GraphLogService} from "./classes/graph-log/graph-log.service";

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

    public logArray : [string, string][][];
    toastMessages: Array<{
        message: string,
        type: "success" | "error" | "warning" | "info",
        duration: number }> = [];

    /* methods - constructor */

    constructor(
        private _jsonParserService : JsonParserService,
        private _xesParserService : XesParserService,
        private _txtParserService : TextParserService,
        private _displayService : DisplayService,
        private toastService: ToastService
    ) {
        this.fileAreaFc = new FormControl();
        this.fileAreaFc.disable();
        this.logAreaFc = new FormControl();
        this.logAreaFc.disable();
        this.logArray = [];
        this._sub = this._displayService.graph$.subscribe(
            graph => {
                /* to be removed - start*/
                console.log('app_component noticed new graph through subscription');
                /* to be removed - end*/
                this.logAreaFc.setValue(this._displayService.generateOutputLogString());
                this.logArray = GraphLogService.generateOutputLogArray(graph);
            }
        );
        this.toastService.toast$.subscribe(toast => {
            this.toastMessages.push(toast);
            setTimeout(() => {
                this.toastMessages.shift(); //removes oldest toast
            }, toast.duration);
        });
    };

    /* methods - on destroy */

    ngOnDestroy(): void {
        this._sub.unsubscribe();
    };

    /* methods - other */

    public processSourceChange(inSourceData : [string, string]) : void {
        /* to be removed - start*/
        console.log('processing SourceChange-event - type: "' + inSourceData[0] + '", content: "' + inSourceData[1] + '"');
        /* to be removed - end*/
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
        this._displayService.updateData(parsedContent);
    };

}
