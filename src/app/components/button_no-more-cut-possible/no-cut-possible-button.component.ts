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
export class NoCutPossibleButtonComponent {


    /* methods - constructor */

    constructor(
        private _minerService : InductiveMinerService,
        private _displayService : DisplayService,

    ) {}


    /* methods - other */

    public processMouseClick(inEvent: MouseEvent) {
        this._minerService.checkCutsAndSave(this._displayService.graph);
    };

}
