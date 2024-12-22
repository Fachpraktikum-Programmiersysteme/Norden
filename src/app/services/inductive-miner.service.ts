import {Injectable} from "@angular/core";

import {DisplayService} from "./display.service";
import {SvgService} from "./svg.service";

import {Graph} from '../classes/graph-representation/graph';
import {Node} from "../classes/graph-representation/node";
import {Arc} from "../classes/graph-representation/arc";
import {DFG} from "../classes/graph-representation/dfg";

@Injectable({
    providedIn: 'root'
})
export class InductiveMinerService {
    
    /* methods : constructor */

    public constructor(
        private _displayService : DisplayService, 
        private _svgService : SvgService
    ) {};

    /* methods : other */

    public checkTermination(inGraph : Graph) : boolean {
        if (inGraph.dfgArray.length !== 0) {
            /* to be removed - start */
            console.log('miner termination status : "false", reason : "dfgArray.length = ' + inGraph.dfgArray.length + '"');
            /* to be removed - end */
            return false;
        } else if (inGraph.supportCount !== 0) {
            /* to be removed - start */
            console.log('miner termination status : "false", reason : "supportCount = ' + inGraph.supportCount + '"');
            /* to be removed - end */
            return false;
        } else if (inGraph.eventCount !== 0) {
            /* to be removed - start */
            console.log('miner termination status : "false", reason : "eventCount = ' + inGraph.eventCount + '"');
            /* to be removed - end */
            return false;
        } else if (inGraph.nodeCount !== (inGraph.placeCount + inGraph.transitionCount)) {
            /* to be removed - start */
            console.log('miner termination status : "false", reason : "nodeCount = ' + inGraph.nodeCount + ', placeCount = ' + inGraph.placeCount + ', transitionCount = ' + inGraph.transitionCount + '"');
            /* to be removed - end */
            return false;
        } else {
            /* to be removed - start */
            console.log('miner termination status : "true"');
            /* to be removed - end */
            return true;
        };
    };

    public checkCut(inOutGraph : Graph) : boolean {
        this.checkGraphStartEnd(inOutGraph);
        let cutFound : boolean = false;
        if (!cutFound) {
            cutFound = this.checkExclusiveCut(inOutGraph);
        };
        if (!cutFound) {
            cutFound = this.checkSequenceCut(inOutGraph);
        };
        if (!cutFound) {
            cutFound = this.checkParallelCut(inOutGraph);
        };
        if (!cutFound) {
            cutFound = this.checkLoopCut(inOutGraph);
        };
        if (cutFound) {
            this.unmarkMarked(inOutGraph);
        };
        this.checkBaseCase(inOutGraph);
        return cutFound;
    };

    /* to be removed - start */
    public testExclusiveCut(inOutGraph : Graph) : void  {
        this.checkExclusiveCut(inOutGraph);
    };
    /* to be removed - end */

    /* to be removed - start */
    public testUnmarkMarked(inOutGraph : Graph) : void  {
        this.unmarkMarked(inOutGraph);
    };
    /* to be removed - end */

    /* to be removed - start */
    public testBaseCase(inOutGraph : Graph) : void  {
        this.checkBaseCase(inOutGraph);
    };
    /* to be removed - end */

    private checkExclusiveCut(inOutGraph : Graph) : boolean {
        /* to be removed - start */
        console.error('im_service started check for exclusive cut');
        /* to be removed - end */
        if (inOutGraph.markedArcs.length !== 2) {
            /* to be removed - start */
            console.error('cut rejected on check 1');
            /* to be removed - end */
            return false;
        };
        let cutDFG : number | undefined = this.checkMarkedDFG(inOutGraph);
        if (cutDFG === undefined) {
            /* to be removed - start */
            console.error('cut rejected on check 2');
            /* to be removed - end */
            return false;
        };
        const dfgPos : number | undefined = this.checkDfgPosition(inOutGraph, cutDFG);
        if (dfgPos === undefined) {
            /* to be removed - start */
            console.error('cut rejected on check 3');
            /* to be removed - end */
            return false;
        };
        const dfg : DFG = inOutGraph.dfgArray[dfgPos];
        const cutArcs : [Arc, Arc] | undefined = this.checkCutArcsEC(inOutGraph, dfg);
        if (cutArcs === undefined) {
            /* to be removed - start */
            console.error('cut rejected on check 4');
            /* to be removed - end */
            return false;
        };
        const tempPlay : Node = new Node(0, 'support', 'placeholder', cutArcs[0].targetX, cutArcs[0].targetY);
        const tempStop : Node = new Node(0, 'support', 'placeholder', cutArcs[1].sourceX, cutArcs[1].sourceY);
        let splitM : [Node, Node, Node[], Arc[]];
        let splitU : [Node, Node, Node[], Arc[]];
        if (dfg.startNode.marked) {
            if (dfg.endNode.marked) {
                splitM = [dfg.startNode, dfg.endNode, [], []];
                splitU = [tempPlay, tempStop, [], []];
            } else {
                /* to be removed - start */
                console.error('cut rejected on check 5');
                /* to be removed - end */
                return false;
            };
        } else {
            if (dfg.endNode.marked) {
                /* to be removed - start */
                console.error('cut rejected on check 6');
                /* to be removed - end */
                return false;
            } else {
                splitU = [dfg.startNode, dfg.endNode, [], []];
                splitM = [tempPlay, tempStop, [], []];
            };
        };
        for (const arc of dfg.arcs) {
            if (arc.marked) {
                if (arc.source.marked) {
                    if (arc.target.marked) {
                        /* to be removed - start */
                        console.error('cut rejected on check 7');
                        /* to be removed - end */
                        return false;
                    } else {
                        /* arc is cut --> skip arc */
                    };
                } else {
                    if (arc.target.marked) {
                        /* arc is cut --> skip arc */
                    } else {
                        /* to be removed - start */
                        console.error('cut rejected on check 8');
                        /* to be removed - end */
                        return false;
                    };
                };
            } else {
                if (arc.source.marked) {
                    if (arc.target.marked) {
                        splitM[3].push(arc);
                    } else {
                        /* to be removed - start */
                        console.error('cut rejected on check 9');
                        /* to be removed - end */
                        return false;
                    };
                } else {
                    if (arc.target.marked) {
                        /* to be removed - start */
                        console.error('cut rejected on check 10');
                        /* to be removed - end */
                        return false;
                    } else {
                        splitU[3].push(arc);
                    };
                };
            };
        };
        for (const node of dfg.nodes) {
            if (node.marked) {
                splitM[2].push(node);
            } else {
                splitU[2].push(node);
            };
        };
        if ((splitM[3].length) < (splitM[2].length - 1)) {
            /* to be removed - start */
            console.error('cut rejected on check 11');
            /* to be removed - end */
            return false;
        };
        if ((splitU[3].length) < (splitU[2].length - 1)) {
            /* to be removed - start */
            console.error('cut rejected on check 12');
            /* to be removed - end */
            return false;
        };
        if ((splitU[0] === dfg.startNode) && (splitU[1] === dfg.endNode)) {
            /* to be removed - start */
            console.error('found exclusive cut, will execute');
            /* to be removed - end */
            this.executeExclusiveCut(inOutGraph, cutArcs, dfg, splitU, splitM);
        } else if ((splitM[0] === dfg.startNode) && (splitM[1] === dfg.endNode)) {
            /* to be removed - start */
            console.error('found exclusive cut, will execute');
            /* to be removed - end */
            this.executeExclusiveCut(inOutGraph, cutArcs, dfg, splitM, splitU);
        } else {
            throw new Error('#srv.mnr.cec.000: ' + 'exclusive cut check failed - inconsitent split of dfg detected (neither sub-dfg contains both the start node and the end node of the dfg)');
        };
        this._displayService.updateData(inOutGraph);
        return true;
    };

    private checkSequenceCut(inOutGraph : Graph) : boolean {
        if (inOutGraph.markedArcs.length < 1) {
            /* to be removed - start */
            console.error('cut rejected on check 1');
            /* to be removed - end */
            return false;
        };
        let cutDFG : number | undefined = this.checkMarkedDFG(inOutGraph);
        if (cutDFG === undefined) {
            /* to be removed - start */
            console.error('cut rejected on check 2');
            /* to be removed - end */
            return false;
        };
        const dfgPos : number | undefined = this.checkDfgPosition(inOutGraph, cutDFG);
        if (dfgPos === undefined) {
            /* to be removed - start */
            console.error('cut rejected on check 3');
            /* to be removed - end */
            return false;
        };
        const dfg : DFG = inOutGraph.dfgArray[dfgPos];
        const cutsCheck : [Arc[], boolean] | undefined = this.checkCutArcsSC(inOutGraph, dfg);
        if (cutsCheck === undefined) {
            /* to be removed - start */
            console.error('cut rejected on check 4');
            /* to be removed - end */
            return false;
        };
        const cutArcs : Arc[] = cutsCheck[0];
        const cutsStartOnMarked : boolean = cutsCheck[1];

        return false;
    };

    private checkParallelCut(inOutGraph : Graph) : boolean {
        return false;
    };

    private checkLoopCut(inOutGraph : Graph) : boolean {
        return false;
    };

    private checkBaseCase(inOutGraph : Graph) : number {
        /* to be removed - start */
        console.error('im_service started check for base cases');
        /* to be removed - end */
        const caseArray : [DFG, Node | undefined][] = [];
        let casesFound : number = 0;
        for (const dfg of inOutGraph.dfgArray) {
            if (dfg.nodes.length < 4) {
                /* to be removed - start */
                console.error('found base case candidate');
                /* to be removed - end */
                if (dfg.nodes.length === 3) {
                    if (dfg.arcs.length !== 2) {
                        throw new Error('#srv.mnr.cbc.000: ' + 'base case check failed - inconsitent dfg detected (three nodes, but more or less than two arcs)');
                    };
                    if (dfg.arcs[0].weight !== dfg.arcs[1].weight) {
                        throw new Error('#srv.mnr.cbc.001: ' + 'base case check failed - inconsitent dfg detected (three nodes, but the two arcs have different weights)');
                    };
                    if (dfg.startNode.type !== 'support') {
                        throw new Error('#srv.mnr.cbc.002: ' + 'base case check failed - inconsitent dfg detected (start node type is not \'support\')');
                    };
                    if (dfg.startNode.label !== 'play') {
                        throw new Error('#srv.mnr.cbc.003: ' + 'base case check failed - inconsitent dfg detected (start node label is not \'play\')');
                    };
                    if (dfg.endNode.type !== 'support') {
                        throw new Error('#srv.mnr.cbc.004: ' + 'base case check failed - inconsitent dfg detected (end node type is not \'support\')');
                    };
                    if (dfg.endNode.label !== 'stop') {
                        throw new Error('#srv.mnr.cbc.005: ' + 'base case check failed - inconsitent dfg detected (end node label is not \'stop\')');
                    };
                    let midNode : Node | undefined;
                    let midCount : number = 0;
                    for (const node of dfg.nodes) {
                        if ((node !== dfg.startNode) && (node !== dfg.endNode)) {
                            midNode = node;
                            midCount++;
                        };
                    };
                    if (midCount !== 1) {
                        throw new Error('#srv.mnr.cbc.006: ' + 'base case check failed - inconsitent dfg detected (three nodes, but more than one node that is neither start nor end)');
                    };
                    if (midNode === undefined) {
                        throw new Error('#srv.mnr.cbc.007: ' + 'base case check failed - impossible error)');
                    };
                    if (midNode.type !== 'event') {
                        throw new Error('#srv.mnr.cbc.008: ' + 'base case check failed - inconsitent dfg detected (middle node type is not \'event\')');
                    };
                    for (const arc of dfg.arcs) {
                        if (arc.source === dfg.startNode) {
                            if (arc.target !== midNode) {
                                throw new Error('#srv.mnr.cbc.009: ' + 'base case check failed - inconsitent dfg detected (three nodes, but contains arc from the start node to a target node that is not the middle node)');
                            };
                        } else if (arc.source === midNode) {
                            if (arc.target !== dfg.endNode) {
                                throw new Error('#srv.mnr.cbc.010: ' + 'base case check failed - inconsitent dfg detected (three nodes, but contains arc from the middle node to a target node that is not the end node)');
                            };
                        } else {
                            throw new Error('#srv.mnr.cbc.011: ' + 'base case check failed - inconsitent dfg detected (three nodes, but contains arc with source node that is neither the start node nor the middle node)');
                        };
                    };
                    caseArray.push([dfg, midNode]);
                    casesFound++;
                } else if (dfg.nodes.length === 2) {
                    if (dfg.arcs.length !== 1) {
                        throw new Error('#srv.mnr.cbc.012: ' + 'base case check failed - inconsitent dfg detected (two nodes, but more or less than one arc)');
                    };
                    if (dfg.arcs[0].source !== dfg.startNode) {
                        throw new Error('#srv.mnr.cbc.013: ' + 'base case check failed - inconsitent dfg detected (two nodes, but the source node of the only arc is not the start node)');
                    };
                    if (dfg.arcs[0].target !== dfg.endNode) {
                        throw new Error('#srv.mnr.cbc.014: ' + 'base case check failed - inconsitent dfg detected (two nodes, but the target node of the only arc is not the end node)');
                    };
                    caseArray.push([dfg, undefined]);
                    casesFound++;
                } else {
                    throw new Error('#srv.mnr.cbc.015: ' + 'base case check failed - inconsitent dfg detected (less than two nodes) detected');
                };
            };
        };
        let casesExecuted : number = 0;
        for (const foundCase of caseArray) {
            if (foundCase[1] !== undefined) {
                this.executeBaseCase(inOutGraph, foundCase[0], foundCase[1]);
            } else {
                this.executeBaseCase(inOutGraph, foundCase[0]);
            };
            casesExecuted++;
        };
        if (casesExecuted !== casesFound) {
            throw new Error('#srv.mnr.cbc.016: ' + 'base case check failed - found ' + casesFound + ' cases, but executed ' + casesExecuted);
        };
        return casesFound;
    };

    private executeExclusiveCut(
        inOutGraph : Graph, 
        inCutArcs : [Arc, Arc], 
        inSplitDFG : DFG, 
        inOldDFG : [Node, Node, Node[], Arc[]], 
        inNewDFG : [Node, Node, Node[], Arc[]]
    ) : void {
        const playX : number = (inCutArcs[0].sourceX + Math.ceil((inCutArcs[0].targetX - inCutArcs[0].sourceX) * (2/3)));
        const playY : number = (inCutArcs[0].sourceY + Math.ceil((inCutArcs[0].targetY - inCutArcs[0].sourceY) * (2/3)));
        const stopX : number = (inCutArcs[1].sourceX + Math.ceil((inCutArcs[1].targetX - inCutArcs[1].sourceX) * (1/3)));
        const stopY : number = (inCutArcs[1].sourceY + Math.ceil((inCutArcs[1].targetY - inCutArcs[1].sourceY) * (1/3)));
        const playAdded : [boolean, number, Node] = inOutGraph.addNode('support', 'play', playX, playY);
        if (!(playAdded[0])) {
            throw new Error('#srv.mnr.eec.000: ' + 'exclusive cut execution failed - start node could not be added due to conflict with existing node)');
        };
        const stopAdded : [boolean, number, Node] = inOutGraph.addNode('support', 'stop', stopX, stopY);
        if (!(stopAdded[0])) {
            throw new Error('#srv.mnr.eec.001: ' + 'exclusive cut execution failed - end node could not be added due to conflict with existing node)');
        };
        const arcOneAdded = inOutGraph.addArc(playAdded[2], inCutArcs[0].target, inCutArcs[0].weight);
        if (!(arcOneAdded[0])) {
            throw new Error('#srv.mnr.eec.002: ' + 'exclusive cut execution failed - addition of arc from new play node to old start node failed due to conflict with an existing arc');
        };
        const arcTwoAdded = inOutGraph.addArc(inCutArcs[1].source, stopAdded[2], inCutArcs[1].weight);
        if (!(arcTwoAdded[0])) {
            throw new Error('#srv.mnr.eec.003: ' + 'exclusive cut execution failed - addition of arc from old end node to new stop node failed due to conflict with an existing arc');
        };
        if (inCutArcs[0].marked) {
            arcOneAdded[2].marked = true;
            inOutGraph.markedArcs.push(arcOneAdded[2]);
            // playAdded[2].marked = true;
            // inOutGraph.markedNodes.push(playAdded[2]);
        };
        if (inCutArcs[1].marked) {
            arcTwoAdded[2].marked = true;
            inOutGraph.markedArcs.push(arcTwoAdded[2]);
            // stopAdded[2].marked = true;
            // inOutGraph.markedNodes.push(stopAdded[2]);
        };
        let newPlaceOne : Node | undefined;
        let newPlaceTwo : Node | undefined;
        if (this.checkGraphStart(inOutGraph, inCutArcs[0].source)) {
            this.replaceArc(inOutGraph, inCutArcs[0], inCutArcs[0].source, playAdded[2]);
        } else {
            newPlaceOne = this.replaceArcInsertNode(inOutGraph, inCutArcs[0], inCutArcs[0].source, playAdded[2], 'place', '');
        };
        if (this.checkGraphEnd(inOutGraph, inCutArcs[1].target)) {
            this.replaceArc(inOutGraph, inCutArcs[1], stopAdded[2], inCutArcs[1].target);
        } else {
            newPlaceTwo = this.replaceArcInsertNode(inOutGraph, inCutArcs[1], stopAdded[2], inCutArcs[1].target, 'place', '');
        };
        if (newPlaceOne !== undefined) {
            if (newPlaceTwo !== undefined) {
                for (const trace of inOutGraph.logArray) {
                    for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                        if (trace[evIdx] === inCutArcs[0].target) {
                            trace.splice(evIdx, 0, newPlaceOne, playAdded[2]);
                            evIdx = (evIdx + 2);
                        };
                        if (trace[evIdx] === inCutArcs[1].source) {
                            trace.splice((evIdx + 1), 0, stopAdded[2], newPlaceTwo);
                            evIdx = (evIdx + 2);
                        };
                    };
                };
            } else {
                for (const trace of inOutGraph.logArray) {
                    for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                        if (trace[evIdx] === inCutArcs[0].target) {
                            trace.splice(evIdx, 0, newPlaceOne, playAdded[2]);
                            evIdx = (evIdx + 2);
                        };
                        if (trace[evIdx] === inCutArcs[1].source) {
                            trace.splice((evIdx + 1), 0, stopAdded[2]);
                            evIdx = (evIdx + 1);
                        };
                    };
                };
            };
        } else {
            if (newPlaceTwo !== undefined) {
                for (const trace of inOutGraph.logArray) {
                    for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                        if (trace[evIdx] === inCutArcs[0].target) {
                            trace.splice(evIdx, 0, playAdded[2]);
                            evIdx = (evIdx + 1);
                        };
                        if (trace[evIdx] === inCutArcs[1].source) {
                            trace.splice((evIdx + 1), 0, stopAdded[2], newPlaceTwo);
                            evIdx = (evIdx + 2);
                        };
                    };
                };
            } else {
                for (const trace of inOutGraph.logArray) {
                    for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                        if (trace[evIdx] === inCutArcs[0].target) {
                            trace.splice(evIdx, 0, playAdded[2]);
                            evIdx = (evIdx + 1);
                        };
                        if (trace[evIdx] === inCutArcs[1].source) {
                            trace.splice((evIdx + 1), 0, stopAdded[2]);
                            evIdx = (evIdx + 1);
                        };
                    };
                };
            };
        };
        inNewDFG[0] = playAdded[2];
        inNewDFG[1] = stopAdded[2];
        inNewDFG[2].push(playAdded[2]);
        inNewDFG[2].push(stopAdded[2]);
        inNewDFG[3].push(arcOneAdded[2]);
        inNewDFG[3].push(arcTwoAdded[2]);
        inSplitDFG.update(inOldDFG[0], inOldDFG[1], inOldDFG[2], inOldDFG[3])
        inOutGraph.appendDFG(inNewDFG[0], inNewDFG[1], inNewDFG[2], inNewDFG[3])
    };

    private executeSequenceCut() : void {};

    private executeParallelCut() : void {};

    private executeLoopCut() : void {};

    private executeBaseCase(
        inOutGraph : Graph, 
        inDfg : DFG, 
        inMiddleNode? : Node
    ) : void {
        if (inDfg.nodes.length === 3) {
            let fstArc : Arc;
            let sndArc : Arc;
            if (inDfg.arcs[0].source === inDfg.startNode) {
                fstArc = inDfg.arcs[0];
                sndArc = inDfg.arcs[1];
            } else {
                fstArc = inDfg.arcs[1];
                sndArc = inDfg.arcs[0];
            };
            if (inMiddleNode === undefined) {
                throw new Error('#srv.mnr.ebc.000: ' + 'base case conversion failed - given dfg contains three nodes but no middle node was given');
            };
            const middleNode : Node = this.transformMid(inOutGraph, inMiddleNode);
            if (this.checkGraphStart(inOutGraph, inDfg.startNode)) {
                if (this.checkGraphEnd(inOutGraph, inDfg.endNode)) {
                    const startNodes : [Node, Node, Node] = this.transformStart(inOutGraph, inDfg.startNode, fstArc.weight);
                    const endNodes : [Node, Node, Node] = this.transformEnd(inOutGraph, inDfg.endNode, sndArc.weight);
                    this.replaceArc(inOutGraph, fstArc, startNodes[2], middleNode);
                    this.replaceArc(inOutGraph, sndArc, middleNode, endNodes[0]);
                    const replaceArcsArray : [Arc, Node, Node][] = [];
                    for (const arc of inOutGraph.arcs) {
                        if (arc.source === inDfg.startNode) {
                            replaceArcsArray.push([arc, startNodes[2], arc.target]);
                        } else if (arc.target === inDfg.endNode) {
                            replaceArcsArray.push([arc, arc.source, endNodes[0]]);
                        };
                    };
                    for (const entry of replaceArcsArray) {
                        this.replaceArc(inOutGraph, entry[0], entry[1], entry[2]);
                    };
                    for (const trace of inOutGraph.logArray) {
                        for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                            if (trace[evIdx] === inDfg.startNode) {
                                trace.splice(evIdx, 1, startNodes[0], startNodes[1], startNodes[2]);
                                evIdx = (evIdx + 2);
                            } else if (trace[evIdx] === inMiddleNode) {
                                trace.splice(evIdx, 1, middleNode);
                            } else if (trace[evIdx] === inDfg.endNode) {
                                trace.splice(evIdx, 1, endNodes[0], endNodes[1], endNodes[2]);
                                evIdx = (evIdx + 2);
                            };
                        };
                    };
                } else {
                    const startNodes : [Node, Node, Node] = this.transformStart(inOutGraph, inDfg.startNode, fstArc.weight);
                    this.replaceArc(inOutGraph, fstArc, startNodes[2], middleNode);
                    if (!(inOutGraph.deleteArc(sndArc))) {
                        throw new Error('#srv.mnr.ebc.011: ' + 'base case conversion failed - deletion of old arc from middle node (event) to end node (support) failed');
                    };
                    const replaceArcsArray : [Arc, Node, Node][] = [];
                    for (const arc of inOutGraph.arcs) {
                        if (arc.source === inDfg.startNode) {
                            replaceArcsArray.push([arc, startNodes[2], arc.target]);
                        } else if (arc.source === inDfg.endNode) {
                            replaceArcsArray.push([arc, middleNode, arc.target]);
                        };
                    };
                    for (const entry of replaceArcsArray) {
                        this.replaceArc(inOutGraph, entry[0], entry[1], entry[2]);
                    };
                    for (const trace of inOutGraph.logArray) {
                        for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                            if (trace[evIdx] === inDfg.startNode) {
                                trace.splice(evIdx, 1, startNodes[0], startNodes[1], startNodes[2]);
                                evIdx = (evIdx + 2);
                            } else if (trace[evIdx] === inMiddleNode) {
                                trace.splice(evIdx, 1, middleNode);
                            } else if (trace[evIdx] === inDfg.endNode) {
                                trace.splice(evIdx, 1);
                                evIdx = (evIdx - 1);
                            };
                        };
                    };
                };
            } else {
                if (this.checkGraphEnd(inOutGraph, inDfg.endNode)) {
                    const endNodes : [Node, Node, Node] = this.transformEnd(inOutGraph, inDfg.endNode, sndArc.weight);
                    this.replaceArc(inOutGraph, sndArc, middleNode, endNodes[0]);
                    if (!(inOutGraph.deleteArc(fstArc))) {
                        throw new Error('#srv.mnr.ebc.017: ' + 'base case conversion failed - deletion of old arc from start node (support) to middle node (event) failed');
                    };
                    const replaceArcsArray : [Arc, Node, Node][] = [];
                    for (const arc of inOutGraph.arcs) {
                        if (arc.target === inDfg.startNode) {
                            replaceArcsArray.push([arc, arc.source, middleNode]);
                        } else if (arc.target === inDfg.endNode) {
                            replaceArcsArray.push([arc, arc.source, endNodes[0]]);
                        };
                    };
                    for (const entry of replaceArcsArray) {
                        this.replaceArc(inOutGraph, entry[0], entry[1], entry[2]);
                    };
                    for (const trace of inOutGraph.logArray) {
                        for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                            if (trace[evIdx] === inDfg.startNode) {
                                trace.splice(evIdx, 1);
                                evIdx = (evIdx - 1);
                            } else if (trace[evIdx] === inMiddleNode) {
                                trace.splice(evIdx, 1, middleNode);
                            } else if (trace[evIdx] === inDfg.endNode) {
                                trace.splice(evIdx, 1, endNodes[0], endNodes[1], endNodes[2]);
                                evIdx = (evIdx + 2);
                            };
                        };
                    };
                } else {
                    if (!(inOutGraph.deleteArc(fstArc))) {
                        throw new Error('#srv.mnr.ebc.023: ' + 'base case conversion failed - deletion of old arc from start node (support) to middle node (event) failed');
                    };
                    if (!(inOutGraph.deleteArc(sndArc))) {
                        throw new Error('#srv.mnr.ebc.024: ' + 'base case conversion failed - deletion of old arc from middle node (event) to end node (support) failed');
                    };
                    const replaceArcsArray : [Arc, Node, Node][] = [];
                    for (const arc of inOutGraph.arcs) {
                        if (arc.target === inDfg.startNode) {
                            replaceArcsArray.push([arc, arc.source, middleNode]);
                        } else if (arc.source === inDfg.endNode) {
                            replaceArcsArray.push([arc, middleNode, arc.target]);
                        };
                    };
                    for (const entry of replaceArcsArray) {
                        this.replaceArc(inOutGraph, entry[0], entry[1], entry[2]);
                    };
                    for (const trace of inOutGraph.logArray) {
                        for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                            if (trace[evIdx] === inDfg.startNode) {
                                trace.splice(evIdx, 1);
                                evIdx = (evIdx - 1);
                            } else if (trace[evIdx] === inMiddleNode) {
                                trace.splice(evIdx, 1, middleNode);
                            } else if (trace[evIdx] === inDfg.endNode) {
                                trace.splice(evIdx, 1);
                                evIdx = (evIdx - 1);
                            };
                        };
                    };
                };
            };
            for (const node of inDfg.nodes) {
                if (!(inOutGraph.deleteNode(node))) {
                    throw new Error('#srv.mnr.ebc.029: ' + 'base case conversion failed - deletion of an old node failed');
                };
            };
            if (!(inOutGraph.deleteDFG(inDfg))) {
                throw new Error('#srv.mnr.ebc.030: ' + 'base case conversion failed - deletion of the dfg failed');
            };           
        } else {
            if (inMiddleNode !== undefined) {
                throw new Error('#srv.mnr.ebc.031: ' + 'base case conversion failed - given dfg contains only two nodes but a middle node was given');
            };
            if (this.checkGraphStart(inOutGraph, inDfg.startNode)) {
                if (this.checkGraphEnd(inOutGraph, inDfg.endNode)) {
                    if ((inOutGraph.nodes.length === 2) && (inOutGraph.arcs.length === 1)) {
                        const nodes : [Node, Node, Node, Node, Node] = this.transformStartEnd(inOutGraph, inDfg.startNode, inDfg.endNode, inDfg.arcs[0]);
                        for (const trace of inOutGraph.logArray) {
                            for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                                if (trace[evIdx] === inDfg.startNode) {
                                    trace.splice(evIdx, 1, nodes[0], nodes[1]);
                                    evIdx = (evIdx + 1);
                                } else if (trace[evIdx] === inDfg.endNode) {
                                    if ((trace[(evIdx - 1)]) !== (nodes[1])) {
                                        trace.splice(evIdx, 1, nodes[3], nodes[4]);
                                        evIdx = (evIdx + 1);
                                    } else {
                                        trace.splice(evIdx, 1, nodes[2], nodes[3], nodes[4]);
                                        evIdx = (evIdx + 2);
                                    };
                                };
                            };
                        };
                    } else {
                        const startNodes : [Node, Node, Node] = this.transformStart(inOutGraph, inDfg.startNode, inDfg.arcs[0].weight);
                        const endNodes : [Node, Node, Node] = this.transformEnd(inOutGraph, inDfg.endNode, inDfg.arcs[0].weight);
                        const middleNode : Node = this.replaceArcInsertNode(inOutGraph, inDfg.arcs[0], startNodes[2], endNodes[0], 'transition', '');
                        const replaceArcsArray : [Arc, Node, Node][] = [];
                        for (const arc of inOutGraph.arcs) {
                            if (arc.source === inDfg.startNode) {
                                replaceArcsArray.push([arc, middleNode, arc.target]);
                            } else if (arc.target === inDfg.endNode) {
                                replaceArcsArray.push([arc, arc.source, middleNode]);
                            };
                        };
                        for (const entry of replaceArcsArray) {
                            this.replaceArc(inOutGraph, entry[0], entry[1], entry[2]);
                        };
                        for (const trace of inOutGraph.logArray) {
                            for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                                if (trace[evIdx] === inDfg.startNode) {
                                    trace.splice(evIdx, 1, startNodes[0], startNodes[1], startNodes[2]);
                                    evIdx = (evIdx + 2);
                                } else if (trace[evIdx] === inDfg.endNode) {
                                    if ((trace[(evIdx - 1)]) !== (startNodes[2])) {
                                        trace.splice(evIdx, 1, endNodes[0], endNodes[1], endNodes[2]);
                                        evIdx = (evIdx + 2);
                                    } else {
                                        trace.splice(evIdx, 1, middleNode, endNodes[0], endNodes[1], endNodes[2]);
                                        evIdx = (evIdx + 3);
                                    };
                                };
                            };
                        };
                    };
                } else {
                    const startNodes : [Node, Node, Node] = this.transformStart(inOutGraph, inDfg.startNode, inDfg.arcs[0].weight);
                    if (!(inOutGraph.deleteArc(inDfg.arcs[0]))) {
                        throw new Error('#srv.mnr.ebc.036: ' + 'base case conversion failed - deletion of old arc from start node (support) to end node (support) failed');
                    };
                    const replaceArcsArray : [Arc, Node, Node][] = [];
                    for (const arc of inOutGraph.arcs) {
                        if (arc.source === inDfg.endNode) {
                            replaceArcsArray.push([arc, startNodes[2], arc.target]);
                        };
                    };
                    for (const entry of replaceArcsArray) {
                        this.replaceArc(inOutGraph, entry[0], entry[1], entry[2]);
                    };
                    for (const trace of inOutGraph.logArray) {
                        for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                            if (trace[evIdx] === inDfg.startNode) {
                                trace.splice(evIdx, 1, startNodes[0], startNodes[1], startNodes[2]);
                                evIdx = (evIdx + 2);
                            } else if (trace[evIdx] === inDfg.endNode) {
                                trace.splice(evIdx, 1);
                                evIdx = (evIdx - 1);
                            };
                        };
                    };
                };
            } else {
                if (this.checkGraphEnd(inOutGraph, inDfg.endNode)) {
                    const endNodes : [Node, Node, Node] = this.transformEnd(inOutGraph, inDfg.endNode, inDfg.arcs[0].weight);
                    if (!(inOutGraph.deleteArc(inDfg.arcs[0]))) {
                        throw new Error('#srv.mnr.ebc.040: ' + 'base case conversion failed - deletion of old arc from start node (support) to end node (support) failed');
                    };
                    const replaceArcsArray : [Arc, Node, Node][] = [];
                    for (const arc of inOutGraph.arcs) {
                        if (arc.target === inDfg.startNode) {
                            replaceArcsArray.push([arc, arc.source, endNodes[0]]);
                        };
                    };
                    for (const entry of replaceArcsArray) {
                        this.replaceArc(inOutGraph, entry[0], entry[1], entry[2]);
                    };
                    for (const trace of inOutGraph.logArray) {
                        for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                            if (trace[evIdx] === inDfg.startNode) {
                                trace.splice(evIdx, 1);
                                evIdx = (evIdx - 1);
                            } else if (trace[evIdx] === inDfg.endNode) {
                                trace.splice(evIdx, 1, endNodes[0], endNodes[1], endNodes[2]);
                                evIdx = (evIdx + 2);
                            };
                        };
                    };
                } else {
                    throw new Error('#srv.mnr.ebc.043: ' + 'base case conversion failed - given dfg contains only two nodes but is neither at the start nor at the end of the graph');
                };
            };
            for (const node of inDfg.nodes) {
                if (!(inOutGraph.deleteNode(node))) {
                    throw new Error('#srv.mnr.ebc.044: ' + 'base case conversion failed - deletion of an old node failed');
                };
            };
            if (!(inOutGraph.deleteDFG(inDfg))) {
                throw new Error('#srv.mnr.ebc.045: ' + 'base case conversion failed - deletion of the dfg failed');
            };
        };
    };

    private replaceArc(
        inOutGraph : Graph, 
        inReplacedArc : Arc, 
        inNewArcSourceNode : Node, 
        inNewArcTargetNode : Node
    ) : void {
        const arcAdded : [boolean, number, Arc] = inOutGraph.addArc(inNewArcSourceNode, inNewArcTargetNode, inReplacedArc.weight);
        if (!(arcAdded[0])) {
            throw new Error('#srv.mnr.rpa.000: ' + 'replacing cut arc failed - new arc from source node to target node could not be added due to conflict with an existing arc');
        };
        const newArc : Arc = arcAdded[2];
        if (!(inOutGraph.deleteArc(inReplacedArc))) {
            throw new Error('#srv.mnr.rpa.001: ' + 'replacing cut arc failed - deletion of replaced arc failed');
        };
        if (inReplacedArc.marked) {
            newArc.marked = true;
            inOutGraph.markedArcs.push(newArc);
        };
    };

    private replaceArcInsertNode(
        inOutGraph : Graph, 
        inReplacedArc : Arc, 
        inNewArcSourceNode : Node, 
        inNewArcTargetNode : Node, 
        inNewNodeType : 'place' | 'transition', 
        inNewNodeLabel : string
    ) : Node {
        const placeX : number = (inNewArcSourceNode.x + Math.ceil((inNewArcTargetNode.x - inNewArcSourceNode.x) / 2));
        const placeY : number = (inNewArcSourceNode.y + Math.ceil((inNewArcTargetNode.y - inNewArcSourceNode.y) / 2));
        const placeAdded : [boolean, number, Node] = inOutGraph.addNode(inNewNodeType, inNewNodeLabel, placeX, placeY);
        if (!(placeAdded[0])) {
            throw new Error('#srv.mnr.rip.000: ' + 'replacing cut arc failed - place could not be added due to conflict with an existing place');
        };
        const newArcPlace : Node = placeAdded[2];
        const arcOneAdded : [boolean, number, Arc] = inOutGraph.addArc(inNewArcSourceNode, newArcPlace, inReplacedArc.weight);
        if (!(arcOneAdded[0])) {
            throw new Error('#srv.mnr.rip.001: ' + 'replacing cut arc failed - arc from source node to new place could not be added due to conflict with an existing arc');
        };
        const newArcOne : Arc = arcOneAdded[2];
        const arcTwoAdded : [boolean, number, Arc] = inOutGraph.addArc(newArcPlace, inNewArcTargetNode, inReplacedArc.weight);
        if (!(arcTwoAdded[0])) {
            throw new Error('#srv.mnr.rip.002: ' + 'replacing cut arc failed - arc from new place to target node could not be added due to conflict with an existing arc');
        };
        const newArcTwo : Arc = arcTwoAdded[2];
        if (!(inOutGraph.deleteArc(inReplacedArc))) {
            throw new Error('#srv.mnr.rip.003: ' + 'replacing cut arc failed - deletion of replaced arc failed');
        };
        if (inReplacedArc.marked) {
            newArcOne.marked = true;
            inOutGraph.markedArcs.push(newArcOne);
            newArcTwo.marked = true;
            inOutGraph.markedArcs.push(newArcTwo);
            // newArcPlace.marked = true;
            // inOutGraph.markedNodes.push(newArcPlace);
        };
        return newArcPlace;
    };

    private unmarkMarked(
        inOutGraph : Graph
    ) {
        /* to be removed - start */
        console.error('im_service started check for marked elements to unmark');
        /* to be removed - end */
        for (const node of inOutGraph.markedNodes) {
            if (node.marked) {
                node.marked = false;
            } else {
                throw new Error('#srv.mnr.umm.000: ' + 'unmarking marked elements failed - the marked nodes array contains an unmarked node (' + node + ')');
            };
        };
        inOutGraph.markedNodes = [];
        for (const arc of inOutGraph.markedArcs) {
            if (arc.marked) {
                arc.marked = false;
            } else {
                throw new Error('#srv.mnr.umm.001: ' + 'unmarking marked elements failed - the marked arcs array contains an unmarked arc (' + arc + ')');
            };
        };
        inOutGraph.markedArcs = [];
        for (const node of inOutGraph.nodes) {
            if (node !== undefined) {
                if (node.marked) {
                    throw new Error('#srv.mnr.umm.002: ' + 'unmarking marked elements failed - found a marked node that is not part of the marked nodes array (' + node + ')');
                };
            };
        };
        for (const arc of inOutGraph.arcs) {
            if (arc.marked) {
                throw new Error('#srv.mnr.umm.003: ' + 'unmarking marked elements failed - found a marked arc that is not part of the marked arcs array (' + arc + ')');
            };
        };
    };

    private checkGraphStartEnd(
        inGraph : Graph
    ) : void {
        if (inGraph.startNode === undefined) {
            throw new Error('#srv.mnr.cse.000: ' + 'graph check failed - start node of graph is undefined');
        };
        if (inGraph.endNode === undefined) {
            throw new Error('#srv.mnr.cse.000: ' + 'graph check failed - end node of graph is undefined');
        };
    };

    private checkGraphStart(
        inGraph : Graph, 
        inNode : Node
    ) : boolean {
        if (inGraph.startNode !== undefined) {
            if (inNode !== inGraph.startNode) {
                return false;
            } else {
                return true;
            };
        } else {
            throw new Error('#srv.mnr.ccs.000: ' + 'cut check failed - start node of graph is undefined');
        };
    };

    private checkGraphEnd(
        inGraph : Graph, 
        inNode : Node
    ) : boolean {
        if (inGraph.endNode !== undefined) {
            if (inNode !== inGraph.endNode) {
                return false;
            } else {
                return true;
            };
        } else {
            throw new Error('#srv.mnr.cce.000: ' + 'cut check failed - end node of graph is undefined');
        };
    };

    private checkMarkedDFG(
        inGraph : Graph
    ) : number | undefined {
        if (inGraph.markedNodes.length < 1) {
            return undefined;
        };
        let cutDFG : number | undefined = inGraph.markedNodes[0].dfg;
        if (cutDFG === undefined) {
            return undefined;
        };
        if (!(this.checkMarkedNodesDFG(inGraph, cutDFG))) {
            return undefined;
        };
        if (!(this.checkMarkedArcsDFG(inGraph, cutDFG))) {
            return undefined;
        };
        return cutDFG;
    };

    private checkMarkedNodesDFG(
        inGraph : Graph, 
        inDFG : number
    ) : boolean {
        for (const node of inGraph.markedNodes) {
            if (node.dfg !== inDFG) {
                return false;
            };
        };
        return true;
    };

    private checkMarkedArcsDFG(
        inGraph : Graph, 
        inDFG : number
    ) : boolean {
        for (const arc of inGraph.markedArcs) {
            if (arc.dfg !== inDFG) {
                return false;
            };
        };
        return true;
    };

    private checkDfgPosition(
        inGraph : Graph, 
        inDfgId : number
    ) : number | undefined {
        let dfgPos : number = 0;
        for (const dfg of inGraph.dfgArray) {
            if (dfg.id === inDfgId) {
                return dfgPos;
            };
            dfgPos++;
        };
        return undefined;
    };

    private checkCutArcsEC(
        inGraph : Graph, 
        inDfg : DFG
    ) : [Arc, Arc] | undefined {
        const arcZero : Arc = inGraph.markedArcs[0];
        const arcOne : Arc = inGraph.markedArcs[1];
        if (arcZero.source !== inDfg.startNode) {
            if (arcZero.target !== inDfg.endNode) {
                return undefined;
            } else {
                if (arcOne.source !== inDfg.startNode) {
                    return undefined;
                } else {
                    return [arcOne, arcZero]
                };
            };
        } else {
            if (arcOne.target !== inDfg.endNode) {
                return undefined;
            } else {
                return [arcZero, arcOne]
            };
        };
    };

    private checkCutArcsSC(
        inGraph : Graph, 
        inDfg : DFG
    ) : [Arc[], boolean] | undefined {
        const cutArcs : Arc[] = [];
        const cutsStartOnMarked : boolean = inGraph.markedArcs[0].source.marked;
        for (const arc of inDfg.arcs) {
            if (cutsStartOnMarked) {
                if (arc.marked) {
                    if (arc.target.marked) {
                        return undefined;
                    };
                    if (!(arc.source.marked)) {
                        return undefined;
                    };
                    cutArcs.push(arc);
                } else {
                    if (arc.source.marked) {
                        if (!(arc.target.marked)) {
                            return undefined;
                        };
                    } else {
                        if (arc.source.marked) {
                            return undefined;
                        };
                    };
                };
            } else {
                if (arc.marked) {
                    if (arc.source.marked) {
                        return undefined;
                    };
                    if (!(arc.target.marked)) {
                        return undefined;
                    };
                    cutArcs.push(arc);
                } else {
                    if (arc.source.marked) {
                        if (!(arc.target.marked)) {
                            return undefined;
                        };
                    } else {
                        if (arc.source.marked) {
                            return undefined;
                        };
                    };
                };
            };
        };
        return [cutArcs, cutsStartOnMarked]
    };

    private transformStart(
        inOutGraph : Graph, 
        inStartNode : Node, 
        inArcWeight : number
    ) : [Node, Node, Node] {
        const startPlaceOneAdded : [boolean, number, Node] = inOutGraph.addNode('place', '', inStartNode.x, (inStartNode.y - Math.ceil(this._svgService.nodeRadius / 2)));
        if (!(startPlaceOneAdded[0])) {
            throw new Error('#srv.mnr.tsn.000: ' + 'start node transformation failed - first start place could not be added due to conflict with existing node)');
        };
        const startPlaceOne : Node = startPlaceOneAdded[2];
        const startTransitionAdded : [boolean, number, Node] = inOutGraph.addNode('transition', inStartNode.label, inStartNode.x, inStartNode.y);
        if (!(startTransitionAdded[0])) {
            throw new Error('#srv.mnr.tsn.001: ' + 'start node transformation failed - start transition could not be added due to conflict with existing node)');
        };
        const startTransition : Node = startTransitionAdded[2];
        const startPlaceTwoAdded : [boolean, number, Node] = inOutGraph.addNode('place', '', inStartNode.x, (inStartNode.y - Math.ceil(this._svgService.nodeRadius / 2)));
        if (!(startPlaceTwoAdded[0])) {
            throw new Error('#srv.mnr.tsn.002: ' + 'start node transformation failed - second start place could not be added due to conflict with existing node)');
        };
        const startPlaceTwo : Node = startPlaceTwoAdded[2];
        const arcOneAdded : [boolean, number, Arc] = inOutGraph.addArc(startPlaceOne, startTransition, inArcWeight);
        if (!(arcOneAdded[0])) {
            throw new Error('#srv.mnr.tsn.003: ' + 'start node transformation failed - arc from first start place to start transition could not be added due to conflict with an existing arc');
        };
        const startArcOne : Arc = arcOneAdded[2];
        const arcTwoAdded : [boolean, number, Arc] = inOutGraph.addArc(startTransition, startPlaceTwo, inArcWeight);
        if (!(arcTwoAdded[0])) {
            throw new Error('#srv.mnr.tsn.004: ' + 'start node transformation failed - arc from start transition to second start place could not be added due to conflict with an existing arc');
        };
        const startArcTwo : Arc = arcTwoAdded[2];
        if (inStartNode.marked) {
            startPlaceOne.marked = true;
            inOutGraph.markedNodes.push(startPlaceOne);
            startTransition.marked = true;
            inOutGraph.markedNodes.push(startTransition);
            startPlaceTwo.marked = true;
            inOutGraph.markedNodes.push(startPlaceTwo);
            // startArcOne.marked = true;
            // inOutGraph.markedArcs.push(startArcOne);
            // startArcTwo.marked = true;
            // inOutGraph.markedArcs.push(startArcTwo);
        };
        return [startPlaceOne, startTransition, startPlaceTwo]
    };

    private transformMid(
        inOutGraph : Graph, 
        inMidNode : Node
    ) : Node {
        const midTransitionAdded : [boolean, number, Node] = inOutGraph.addNode('transition', inMidNode.label, inMidNode.x, inMidNode.y);
        if (!(midTransitionAdded[0])) {
            throw new Error('#srv.mnr.tmn.001: ' + 'mid node transformation failed - mid transition could not be added due to conflict with existing node)');
        };
        const midTransition : Node = midTransitionAdded[2];
        if (inMidNode.marked) {
            midTransition.marked = true;
            inOutGraph.markedNodes.push(midTransition);
        };
        return midTransition;
    };

    private transformEnd(
        inOutGraph : Graph, 
        inEndNode : Node, 
        inArcWeight : number
    ) : [Node, Node, Node] {
        const endPlaceOneAdded : [boolean, number, Node] = inOutGraph.addNode('place', '', inEndNode.x, (inEndNode.y + Math.ceil(this._svgService.nodeRadius / 2)));
        if (!(endPlaceOneAdded[0])) {
            throw new Error('#srv.mnr.ten.000: ' + 'end node transformation failed - first end place could not be added due to conflict with existing node)');
        };
        const endPlaceOne : Node = endPlaceOneAdded[2];
        const endTransitionAdded : [boolean, number, Node] = inOutGraph.addNode('transition', inEndNode.label, inEndNode.x, inEndNode.y);
        if (!(endTransitionAdded[0])) {
            throw new Error('#srv.mnr.ten.001: ' + 'end node transformation failed - end transition could not be added due to conflict with existing node)');
        };
        const endTransition : Node = endTransitionAdded[2];
        const endPlaceTwoAdded : [boolean, number, Node] = inOutGraph.addNode('place', '', inEndNode.x, (inEndNode.y + Math.ceil(this._svgService.nodeRadius / 2)));
        if (!(endPlaceTwoAdded[0])) {
            throw new Error('#srv.mnr.ten.002: ' + 'end node transformation failed - second end place could not be added due to conflict with existing node)');
        };
        const endPlaceTwo : Node = endPlaceTwoAdded[2];
        const endArcOneAdded : [boolean, number, Arc] = inOutGraph.addArc(endPlaceOne, endTransition, inArcWeight);
        if (!(endArcOneAdded[0])) {
            throw new Error('#srv.mnr.ten.003: ' + 'end node transformation failed - arc from first end place to end transition could not be added due to conflict with an existing arc');
        };
        const endArcOne : Arc = endArcOneAdded[2];
        const endArcTwoAdded : [boolean, number, Arc] = inOutGraph.addArc(endTransition, endPlaceTwo, inArcWeight);
        if (!(endArcTwoAdded[0])) {
            throw new Error('#srv.mnr.ten.004: ' + 'end node transformation failed - arc from end transition to second end place could not be added due to conflict with an existing arc');
        };
        const endArcTwo : Arc = endArcTwoAdded[2];
        if (inEndNode.marked) {
            endPlaceOne.marked = true;
            inOutGraph.markedNodes.push(endPlaceOne);
            endTransition.marked = true;
            inOutGraph.markedNodes.push(endTransition);
            endPlaceTwo.marked = true;
            inOutGraph.markedNodes.push(endPlaceTwo);
            // endArcOne.marked = true;
            // inOutGraph.markedArcs.push(endArcOne);
            // endArcTwo.marked = true;
            // inOutGraph.markedArcs.push(endArcTwo);
        };
        return [endPlaceOne, endTransition, endPlaceTwo]
    };

    private transformStartEnd(
        inOutGraph : Graph, 
        inStartNode : Node, 
        inEndNode : Node, 
        inArc : Arc
    ) : [Node, Node, Node, Node, Node] {
        const startY : number = (inStartNode.y - Math.ceil(this._svgService.nodeRadius / 2));
        const startPlaceAdded : [boolean, number, Node] = inOutGraph.addNode('place', '', inStartNode.x, startY);
        if (!(startPlaceAdded[0])) {
            throw new Error('#srv.mnr.tse.000: ' + 'start-end transformation failed - start place could not be added due to conflict with existing node)');
        };
        const startPlace : Node = startPlaceAdded[2];
        const startTransitionAdded : [boolean, number, Node] = inOutGraph.addNode('transition', inStartNode.label, inStartNode.x, inStartNode.y);
        if (!(startTransitionAdded[0])) {
            throw new Error('#srv.mnr.tse.001: ' + 'start-end transformation failed - start transition could not be added due to conflict with existing node)');
        };
        const startTransition : Node = startTransitionAdded[2];
        const midX : number = (inArc.sourceX + Math.ceil((inArc.targetX - inArc.sourceX) / 2));
        const midY : number = (inArc.sourceY + Math.ceil((inArc.targetY - inArc.sourceY) / 2));
        const midPlaceAdded : [boolean, number, Node] = inOutGraph.addNode('place', '', midX, midY);
        if (!(midPlaceAdded[0])) {
            throw new Error('#srv.mnr.tse.002: ' + 'start-end transformation failed - mid place could not be added due to conflict with existing node)');
        };
        const midPlace : Node = midPlaceAdded[2];
        const endTransitionAdded : [boolean, number, Node] = inOutGraph.addNode('transition', inEndNode.label, inEndNode.x, inEndNode.y);
        if (!(endTransitionAdded[0])) {
            throw new Error('#srv.mnr.tse.003: ' + 'start-end transformation failed - end transition could not be added due to conflict with existing node)');
        };
        const endTransition : Node = endTransitionAdded[2];
        const endY : number = (inEndNode.y + Math.ceil(this._svgService.nodeRadius / 2));
        const endPlaceAdded : [boolean, number, Node] = inOutGraph.addNode('place', '', inEndNode.x, endY);
        if (!(endPlaceAdded[0])) {
            throw new Error('#srv.mnr.tse.004: ' + 'start-end transformation failed - end place could not be added due to conflict with existing node)');
        };
        const endPlace : Node = endPlaceAdded[2];
        const startArcAdded : [boolean, number, Arc] = inOutGraph.addArc(startPlace, startTransition, inArc.weight);
        if (!(startArcAdded[0])) {
            throw new Error('#srv.mnr.tse.005: ' + 'start-end transformation failed - arc from start place to start transition could not be added due to conflict with an existing arc');
        };
        const startArc : Arc = startArcAdded[2];
        const midArcOneAdded : [boolean, number, Arc] = inOutGraph.addArc(startTransition, midPlace, inArc.weight);
        if (!(midArcOneAdded[0])) {
            throw new Error('#srv.mnr.tse.006: ' + 'start-end transformation failed - arc from start transition to mid place could not be added due to conflict with an existing arc');
        };
        const midArcOne : Arc = midArcOneAdded[2];
        const midArcTwoAdded : [boolean, number, Arc] = inOutGraph.addArc(midPlace, endTransition, inArc.weight);
        if (!(midArcTwoAdded[0])) {
            throw new Error('#srv.mnr.tse.007: ' + 'start-end transformation failed - arc from mid place to end transition could not be added due to conflict with an existing arc');
        };
        const midArcTwo : Arc = midArcTwoAdded[2];
        const endArcAdded : [boolean, number, Arc] = inOutGraph.addArc(endTransition, endPlace, inArc.weight);
        if (!(endArcAdded[0])) {
            throw new Error('#srv.mnr.tse.008: ' + 'start-end transformation failed - arc from end transition to end place could not be added due to conflict with an existing arc');
        };
        const endArc : Arc = endArcAdded[2];
        if (!(inOutGraph.deleteArc(inArc))) {
            throw new Error('#srv.mnr.tse.009: ' + 'start-end transformation failed - deletion of old arc from start node (support) to end node (support) failed');
        };
        if (inStartNode.marked) {
            startPlace.marked = true;
            inOutGraph.markedNodes.push(startPlace);
            startTransition.marked = true;
            inOutGraph.markedNodes.push(startTransition);
            // startArc.marked = true;
            // inOutGraph.markedArcs.push(startArc);
        };
        if (inEndNode.marked) {
            endTransition.marked = true;
            inOutGraph.markedNodes.push(endTransition);
            endPlace.marked = true;
            inOutGraph.markedNodes.push(endPlace);
            // endArc.marked = true;
            // inOutGraph.markedArcs.push(endArc);
        };
        if (inArc.marked) {
            midArcOne.marked = true;
            inOutGraph.markedArcs.push(midArcOne);
            midArcTwo.marked = true;
            inOutGraph.markedArcs.push(midArcTwo);
            // midPlace.marked = true;
            // inOutGraph.markedNodes.push(midPlace);
        };
        return [startPlace, startTransition, midPlace, endTransition, endPlace];
    };

};