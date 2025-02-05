import {Component, OnDestroy} from '@angular/core';
// import {MatFabButton} from "@angular/material/button";
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';

import {Subscription} from 'rxjs';

import {DisplayService} from '../../services/display.service';
import {FileWriterService} from 'src/app/services/file-writer.service';


@Component({
    selector: 'save-button',
    templateUrl: './save-button.component.html',
    styleUrls: ['./save-button.component.css'],
    standalone: true,
    imports: [
        // MatFabButton,
        MatIconModule,
        MatTooltipModule
    ]
})
export class SaveButtonComponent implements OnDestroy {

    /* attributes */

    private readonly _sub : Subscription;

    private _disabled : boolean;
    private _graphEmpty : boolean;

    private _outId : number;

    /* methods - constructor */

    constructor(
        private _fileWriterService : FileWriterService,
        private _displayService : DisplayService,
    ) {
        this._outId = 0;
        this._disabled = true;
        this._graphEmpty = false;
        this._sub  = this._displayService.graph$.subscribe(
            graph => {
                if (graph.initialState === true) {
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
            return 'save graph';
        }
    };

    /* methods - other */
    
    processMouseClick() {
        const currentGraph = this._displayService.graph;
        const isPN : boolean = this._fileWriterService.isPetriNet(currentGraph);
        let fileName : string = 'saved_graph_' + this._outId;
        if (isPN) {
            fileName = (fileName + '_(PetriNet)');
        };
        this._fileWriterService.writeFile(fileName, currentGraph)
        this._outId++;
    };

};