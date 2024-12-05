import {Injectable} from "@angular/core";

import {Graph} from '../classes/graph-representation/graph';
import {LinkedList} from "../classes/linked-list/linked-list";
import {LinkedListEntry} from "../classes/linked-list/linked-list-entry";

@Injectable({
    providedIn: 'root'
})
export class DataService {
    
    /* attributes */

    private _remainingGraphs : LinkedList<Graph>;

    /* methods : constructor */

   public  constructor() {
        this._remainingGraphs = new LinkedList<Graph>;
    };

    /* methods : getters */

    public get remainingGraphs() : LinkedList<Graph> {
        return this._remainingGraphs;
    }

    /* methods : other */

    public addGraph(inGraph : Graph) : void {
        this._remainingGraphs.appendData(inGraph);
    }

    public removeGraph(inEntry : LinkedListEntry<Graph>) : void {
        this._remainingGraphs.deleteEntry(inEntry);
    }

};