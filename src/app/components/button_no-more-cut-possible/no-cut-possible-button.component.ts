import {Component, OnDestroy} from '@angular/core';
//import {MatFabButton} from "@angular/material/button";
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';

import {Subscription} from 'rxjs';

import {DisplayService} from '../../services/display.service';
import {InductiveMinerService} from '../../services/inductive-miner.service';

@Component({
    selector: 'no-cut-possible-button',
    templateUrl: './no-cut-possible-button.component.html',
    styleUrls: ['./no-cut-possible-button.component.css'],
    standalone: true,
    imports: [
        //MatFabButton,
        MatIconModule,
        MatTooltipModule
    ]
})
export class NoCutPossibleButtonComponent implements OnDestroy{

    private readonly _sub : Subscription;

    private _disabled : boolean;
    private _graphEmpty : boolean;
    //private _minerTerminated : boolean;
    /* methods - constructor */

    constructor(
        private _minerService : InductiveMinerService,
        private _displayService : DisplayService,
    ){
        this._disabled = true;
        this._graphEmpty = false;
//        this._minerTerminated = false
        this._sub  = this._displayService.graph$.subscribe(
            graph => {
                if (this._displayService.graphEmpty) {
                    this._disabled = true;
                    this._graphEmpty = true;
  //                  this._minerTerminated = false
                } else {
                    this._disabled = false;
                    this._graphEmpty = false;
                }
            }
        );
    };
    // {
    //     this._disabled = true;
    //     this._graphEmpty = false;
    //     this._minerTerminated = false;
    //     this._sub  = this._displayService.graph$.subscribe(
    //         graph => {
    //             if (this._displayService.graphEmpty) {
    //                 this._disabled = true;
    //                 this._graphEmpty = true;
    //                 this._minerTerminated = false;
    //             } else if (this._minerService.checkTermination(graph)) {
    //                 this._disabled = true;
    //                 this._graphEmpty = false;
    //                 this._minerTerminated = true;
    //             } else {
    //                 this._disabled = false;
    //                 this._graphEmpty = false;
    //                 this._minerTerminated = false;
    //             }
    //         }
    //     );
    // };


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
            return 'check for cuts';
        };
    };

    /* methods - other */


    public processMouseClick(inEvent: MouseEvent) {
        this._minerService.checkCutsAndSave(this._displayService.graph);
    };

}
