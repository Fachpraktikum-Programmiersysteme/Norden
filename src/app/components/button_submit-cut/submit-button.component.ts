import {Component, OnDestroy} from '@angular/core';
// import {MatFabButton} from "@angular/material/button";
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';

import {Subscription} from 'rxjs';

import {DisplayService} from '../../services/display.service';
import {InductiveMinerService} from '../../services/inductive-miner.service';

import {SettingsSingleton} from "../../classes/settings/settings.singleton";

@Component({
    selector: 'submit-button',
    templateUrl: './submit-button.component.html',
    styleUrls: ['./submit-button.component.css'],
    standalone: true,
    imports: [
        // MatFabButton,
        MatIconModule,
        MatTooltipModule
    ]
})
export class SubmitButtonComponent implements OnDestroy {

    /* attributes */

    private readonly _sub : Subscription;

    private _disabled : boolean;
    private _graphEmpty : boolean;
    private _minerTerminated : boolean;
    private _noElementsMarked : boolean;
    private _noNodesMarked : boolean;
    private _noArcsMarked : boolean;
    private _arcsMarked : boolean;

    /* methods - constructor */

    constructor(
        private _settings: SettingsSingleton,
        private _minerService : InductiveMinerService,
        private _displayService : DisplayService,
    ) {
        this._disabled = true;
        this._graphEmpty = false;
        this._minerTerminated = false;
        this._noElementsMarked = false;
        this._noNodesMarked = false;
        this._noArcsMarked = false;
        this._arcsMarked = false;
        this._sub  = this._displayService.graph$.subscribe(
            graph => {
                if (this._displayService.graphEmpty) {
                    this._disabled = true;
                    this._graphEmpty = true;
                    this._minerTerminated = false;
                    this._noElementsMarked = false;
                    this._noNodesMarked = false;
                    this._noArcsMarked = false;
                    this._arcsMarked = false;
                } else if (this._minerService.checkTermination(graph)) {
                    this._disabled = true;
                    this._graphEmpty = false;
                    this._minerTerminated = true;
                    this._noElementsMarked = false;
                    this._noNodesMarked = false;
                    this._noArcsMarked = false;
                    this._arcsMarked = false;
                } else if (this._displayService.graph.markedNodes.length < 1) {
                        if (this._displayService.graph.markedArcs.length < 1) {
                            this._disabled = true;
                            this._graphEmpty = false;
                            this._minerTerminated = false;
                            this._noElementsMarked = true;
                            this._noNodesMarked = false;
                            this._noArcsMarked = false;
                            this._arcsMarked = false;
                        } else {
                            this._disabled = true;
                            this._graphEmpty = false;
                            this._minerTerminated = false;
                            this._noElementsMarked = false;
                            this._noNodesMarked = true;
                            this._noArcsMarked = false;
                            this._arcsMarked = false;
                        };
                } else if (this._displayService.graph.markedArcs.length < 1) {
                    if ((this._settings.currentState.checkMode !== 'bc') && (this._settings.currentState.checkMode !== 'ft')) {
                        this._disabled = true;
                        this._graphEmpty = false;
                        this._minerTerminated = false;
                        this._noElementsMarked = false;
                        this._noNodesMarked = false;
                        this._noArcsMarked = true;
                        this._arcsMarked = false;
                    } else {
                        this._disabled = false;
                        this._graphEmpty = false;
                        this._minerTerminated = false;
                        this._noElementsMarked = false;
                        this._noNodesMarked = false;
                        this._noArcsMarked = false;
                        this._arcsMarked = false;
                    };
                } else {
                    if ((this._settings.currentState.checkMode !== 'bc') && (this._settings.currentState.checkMode !== 'ft')) {
                        this._disabled = false;
                        this._graphEmpty = false;
                        this._minerTerminated = false;
                        this._noElementsMarked = false;
                        this._noNodesMarked = false;
                        this._noArcsMarked = false;
                        this._arcsMarked = false;
                    } else {
                        this._disabled = true;
                        this._graphEmpty = false;
                        this._minerTerminated = false;
                        this._noElementsMarked = false;
                        this._noNodesMarked = false;
                        this._noArcsMarked = false;
                        this._arcsMarked = true;
                    };
                };
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
            } else if (this._minerTerminated) {
                return '[disabled] - (miner terminated)';
            } else if (this._noElementsMarked) {
                return '[disabled] - (nothing marked)';
            } else if (this._noNodesMarked) {
                return '[disabled] - (no marked Nodes)';
            } else if (this._noArcsMarked) {
                return '[disabled] - (no marked Arcs)';
            } else if (this._arcsMarked) {
                return '[disabled] - (unmark Arcs)';
            } else {
                return '[currently disabled]';
            };
        } else {
            switch (this._settings.currentState.checkMode) {
                case 'ec' : {
                    return 'check selected Exclusive Cut';
                }
                case 'sc' : {
                    return 'check selected Secuence Cut';
                }
                case 'pc' : {
                    return 'check selected Parallel Cut';
                }
                case 'lc' : {
                    return 'check selected Loop Cut';
                }
                case 'bc' : {
                    return 'check selected Base Case';
                }
                case 'ft' : {
                    return 'check for Fall Through';
                }
            };
        };
    };

    /* methods - other */

    public processMouseClick() {
        this._minerService.checkInput(this._displayService.graph);
    };

};