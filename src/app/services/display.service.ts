import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Graph} from '../classes/graph-representation/graph';

@Injectable({
    providedIn: 'root'
})
export class DisplayService implements OnDestroy {

    /* attributes */

    private readonly _graph$: BehaviorSubject<Graph>;

    /* methods - constructor */

    public constructor() {
        this._graph$ = new BehaviorSubject<Graph>(new Graph());
    }

    /* methods - on destroy */

    ngOnDestroy(): void {
        this._graph$.complete();
    }

    /* methods - getters */

    public get graph$(): Observable<Graph> {
        return this._graph$.asObservable();
    }

    public get graph(): Graph {
        return this._graph$.getValue();
    }

    /* methods - other */

    public deleteGraph() : void {
        this._graph$.next(new Graph());
    }

    public display(inGraph: Graph) : void {
        this._graph$.next(inGraph);
    }

}
