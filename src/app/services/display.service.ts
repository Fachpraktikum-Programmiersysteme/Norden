import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Graph} from '../classes/graph-representation/graph';
// import {Node} from '../classes/graph-representation/node';

@Injectable({
    providedIn: 'root'
})
export class DisplayService implements OnDestroy {

    /* attributes */

    private readonly _graph$ : BehaviorSubject<Graph>;
    private readonly _log$ : BehaviorSubject<number[][]>;
    private _max : number;
    private _graphEmpty : boolean;
    private _logEmpty : boolean;

    /* methods - constructor */

    public constructor() {
        this._graph$ = new BehaviorSubject<Graph>(new Graph());
        this._log$ = new BehaviorSubject<number[][]>([]);
        this._max = 0;
        this._graphEmpty = true;
        this._logEmpty = true;
    };

    /* methods - on destroy */

    ngOnDestroy(): void {
        this._graph$.complete();
        this._log$.complete();
    };

    /* methods - getters */

    public get graph$(): Observable<Graph> {
        return this._graph$.asObservable();
    };

    public get graph(): Graph {
        return this._graph$.getValue();
    };

    public get log$(): Observable<number[][]> {
        return this._log$.asObservable();
    };

    public get log(): number[][] {
        return this._log$.getValue();
    };

    public get maxTraceLength(): number {
        return this._max;
    };

    public get graphEmpty(): boolean {
        return this._graphEmpty;
    };

    public get logEmpty(): boolean {
        return this._logEmpty;
    };

    /* methods - other */

    private calcMaxTraceLength(inEventLog : number[][]) : number {
        let max : number = 0;
        for (const trace of inEventLog) {
            if (trace.length > max) {
                max = trace.length;
            };
        };
        return max;
    };

    public deleteData() : void {
        this.updateData(new Graph(), []);
    };

    public refreshData() : void {
        this.updateData(this._graph$.getValue(), this._log$.getValue());
    };

    public async updateData(inGraph: Graph | undefined, inEventLog: number[][] | undefined) {
        return await new Promise(
            resolve => {
                let newGraph : Graph = new Graph();
                let graphEmpty : boolean = true;
                let newLog : number[][] = [];
                let logEmpty : boolean = true;
                if (inGraph !== undefined) {
                    newGraph = inGraph;
                    if ((newGraph.nodes.length !== 0) || (newGraph.arcs.length !== 0)) {
                        graphEmpty = false;
                    };
                };
                if (inEventLog !== undefined) {
                    newLog = inEventLog;
                    if (newLog.length !== 0) {
                        logEmpty = false;
                    };
                };
                this._graphEmpty = graphEmpty;
                this._logEmpty = logEmpty;
                this._max = this.calcMaxTraceLength(newLog);
                this._log$.next(newLog);
                this._graph$.next(newGraph);
            }
        );
    };

};