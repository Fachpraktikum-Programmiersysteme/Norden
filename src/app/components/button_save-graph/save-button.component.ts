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

    private _outId : number;

    /* methods - constructor */

    constructor(
        private _displayService : DisplayService,
        private _fileWriterService : FileWriterService
    ) {
        this._outId = 0;
        this._disabled = true;
        this._sub  = this._displayService.graph$.subscribe(
            graph => {
                console.log('save-button_component noticed new graph');
                if (graph.initialState === true) {
                    this._disabled = true;
                } else {
                    this._disabled = false;
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
    }

    /* methods - other */

    prevent(inEvent: Event) {
        inEvent.preventDefault();
        inEvent.stopPropagation();
    };

    public get tooltip() : string {
        if (this._disabled) {
            return '[currently disabled]';
        } else {
            return 'save currently displayed graph';
        }
    }

    processMouseClick(inEvent: MouseEvent) {
        /* to be removed - start */
        console.log(' >> save button clicked - event : ' + inEvent);
        /* to be removed - end */
        const currentGraph = this._displayService.graph;
        const isPN : boolean = this._fileWriterService.isPetriNet(currentGraph);
        let fileName : string = 'out';
        /* to be removed - start */
        // let savePath : string = '../../../assets/files-out';
        /* to be removed - end */
        if (isPN) {
            fileName = (fileName + '_' + this._outId + '_PetriNet');
        } else {
            fileName = (fileName + '_' + this._outId + '_Graph');
        }
        this._fileWriterService.writeFile(fileName, currentGraph)
        this._outId++;
    };

};
