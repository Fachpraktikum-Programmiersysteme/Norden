import {Injectable, OnDestroy} from '@angular/core';

import {BehaviorSubject, Observable} from 'rxjs';

import {Graph} from '../classes/graph-representation/graph';

@Injectable({
    providedIn: 'root'
})
export class DisplayService implements OnDestroy {

    /* attributes */

    private readonly _graph$ : BehaviorSubject<Graph>;
    private _graphEmpty : boolean;

    /* methods - constructor */

    public constructor() {
        this._graph$ = new BehaviorSubject<Graph>(new Graph());
        this._graphEmpty = true;
    };

    /* methods - on destroy */

    ngOnDestroy(): void {
        this._graph$.complete();
        // this._log$.complete();
    };

    /* methods - getters */

    public get graph$(): Observable<Graph> {
        return this._graph$.asObservable();
    };

    public get graph(): Graph {
        return this._graph$.getValue();
    };

    public get graphEmpty(): boolean {
        return this._graphEmpty;
    };

    /* methods - other */

    public deleteData() : void {
        this.updateData(undefined);
    };

    public refreshData() : void {
        this.updateData(this._graph$.getValue());
    };

    public async updateData(inGraph: Graph | undefined) {
        return await new Promise(
            resolve => {
                let newGraph : Graph = new Graph();
                let graphEmpty : boolean = true;
                if (inGraph !== undefined) {
                    newGraph = inGraph;
                    if ((newGraph.nodes.length !== 0) || (newGraph.arcs.length !== 0)) {
                        graphEmpty = false;
                    };
                };
                this._graphEmpty = graphEmpty;
                this._graph$.next(newGraph);
            }
        );
    };

    public generateOutputLogString() : string {
        let outLogString : string = '';
        for (const trace of this.graph.logArray) {
            let eventIdx : number = 0;
            for (const event of trace) {
                if (eventIdx !== 0) {
                    outLogString = outLogString + ' + "' + event.label + '"'
                } else {
                    outLogString = outLogString + '"' + event.label + '"'
                };
                eventIdx++;
            };
            if (eventIdx !== 0) {
                outLogString = outLogString + '\n'
                outLogString = outLogString + '\n'
            };
        };
        return outLogString;
    };

};
