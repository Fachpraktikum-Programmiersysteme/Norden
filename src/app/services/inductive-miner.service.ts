import {Injectable} from "@angular/core";

import {DisplayService} from "./display.service";

import {Graph} from '../classes/graph-representation/graph';

@Injectable({
    providedIn: 'root'
})
export class InductiveMinerService {
    
    /* attributes */



    /* methods : constructor */

    public constructor(private _displayService: DisplayService) {};

    /* methods : getters */



    /* methods : other */

    public checkCut(inGraph : Graph) : boolean {
        let cutFound : boolean = false;
        if (!cutFound) {
            cutFound = this.checkExclusiveCut(inGraph);
        };
        if (!cutFound) {
            cutFound = this.checkSequenceCut(inGraph);
        };
        if (!cutFound) {
            cutFound = this.checkParallelCut(inGraph);
        };
        if (!cutFound) {
            cutFound = this.checkLoopCut(inGraph);
        };
        this.checkBaseCase(inGraph);
        return cutFound;
    };

    private checkExclusiveCut(inGraph : Graph) : boolean {

        let cutDFG : number | undefined;

        if (inGraph.markedNodes.length > 0) {
            cutDFG = inGraph.markedNodes[0].dfg;
        } else {
            cutDFG = inGraph.markedArcs[0].dfg;
        };

        if (cutDFG === undefined) {
            return false
        };

        if (!(this.checkMarkedNodesDFG(inGraph, cutDFG))) {
            return false;
        };
        if (!(this.checkMarkedArcsDFG(inGraph, cutDFG))) {
            return false;
        };

        let dfgPos : number = 0;
        let dfgFound : boolean = false;
        for (const dfg of inGraph.dfgArray) {
            if (dfg.id === cutDFG) {
                dfgFound = true;
                break;
            };
            dfgPos++;
        };
        if (!dfgFound) {
            return false
        };

        for (const arc of inGraph.dfgArray[dfgPos].arcs) {
            
        };

        this._displayService.updateData(inGraph);

        return true;

    };

    private checkMarkedNodesDFG(inGraph : Graph, inDFG : number) : boolean {
        for (const node of inGraph.markedNodes) {
            if (node.dfg !== inDFG) {
                return false;
            };
        };
        return true;
    };

    private checkMarkedArcsDFG(inGraph : Graph, inDFG : number) : boolean {
        for (const arc of inGraph.markedArcs) {
            if (arc.dfg !== inDFG) {
                return false;
            };
        };
        return true;
    };

    private checkSequenceCut(inGraph : Graph) : boolean {
        return false;
    };
    private checkParallelCut(inGraph : Graph) : boolean {
        return false;
    };
    private checkLoopCut(inGraph : Graph) : boolean {
        return false;
    };

    private checkBaseCase(inGraph : Graph) : void {

    };

};