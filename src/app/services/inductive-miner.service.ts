import {Injectable} from "@angular/core";

import {ToastService} from './toast.service';
import {DisplayService} from "./display.service";

import {GraphGraphicsConfig} from "../classes/display/graph-graphics.config";
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
        private _toastService : ToastService,
        private _displayService : DisplayService,
        private _graphicsConfig : GraphGraphicsConfig,
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

    // TODO - after implementation and test of all components, modify toasts and remove timeouts
    //
    public async checkInput(inOutGraph : Graph) {
        this.checkGraphStartEnd(inOutGraph);
        inOutGraph.resetAllChanged();
        inOutGraph.resetAllNew();
        this._displayService.refreshData();
        /* TODO - part to be modified - start */
        this._toastService.showToast('changed flags reset, 2s until check for Exclusive Cut', 'info');
        await new Promise(resolve => setTimeout(resolve, 2000));
        /* TODO - part to be modified - end */
        this._displayService.refreshData();
        let inputAccepted : boolean = false;
        if (!inputAccepted) {
            const checkEC : [boolean, undefined | [DFG, [Node[], Arc[]], [Node[], Arc[]], boolean, Arc, Arc]] = this.checkExclusiveCut(inOutGraph);
            inputAccepted = checkEC[0];
            if (inputAccepted) {
                /* TODO - part to be modified - start */
                this._toastService.showToast('input accepted as EC, 3s until execution', 'success');
                await new Promise(resolve => setTimeout(resolve, 3000));
                /* TODO - part to be modified - end */
                if (checkEC[1] !== undefined) {
                    this.executeExclusiveCut(inOutGraph, checkEC[1][0], checkEC[1][1], checkEC[1][2], checkEC[1][3], checkEC[1][4], checkEC[1][5]);
                    this._displayService.refreshData();
                    /* TODO - part to be modified - start */
                    this._toastService.showToast('EC executed, 4s until reset of marked flags', 'info');
                    await new Promise(resolve => setTimeout(resolve, 4000));
                    /* TODO - part to be modified - end */
                    inOutGraph.resetAllMarked();
                } else {
                    throw new Error('#srv.mnr.ccI.000: ' + 'input check failed - check identified exclusive cut, but did not return associated values');
                };
            } else {
                /* TODO - part to be modified - start */
                this._toastService.showToast('input rejected as EC, 2s until check for SC', 'error');
                await new Promise(resolve => setTimeout(resolve, 2000));
                /* TODO - part to be modified - end */
            };
        };
        if (!inputAccepted) {
            const checkSC : [boolean, undefined | [DFG, Arc[], [Node[], Arc[]], [Node[], Arc[]], boolean]] = this.checkSequenceCut(inOutGraph);
            inputAccepted = checkSC[0];
            if (inputAccepted) {
                /* TODO - part to be modified - start */
                this._toastService.showToast('input accepted as SC, 3s until execution', 'success');
                await new Promise(resolve => setTimeout(resolve, 3000));
                /* TODO - part to be modified - end */
                if (checkSC[1] !== undefined) {
                    this.executeSequenceCut(inOutGraph, checkSC[1][0], checkSC[1][1], checkSC[1][2], checkSC[1][3], checkSC[1][4]);
                    this._displayService.refreshData();
                    /* TODO - part to be modified - start */
                    this._toastService.showToast('SC executed, 4s until reset of marked flags', 'info');
                    await new Promise(resolve => setTimeout(resolve, 4000));
                    /* TODO - part to be modified - end */
                    inOutGraph.resetAllMarked();
                } else {
                    throw new Error('#srv.mnr.ccI.001: ' + 'input check failed - check identified sequence cut, but did not return associated values');
                };
            } else {
                /* TODO - part to be modified - start */
                this._toastService.showToast('input rejected as SC, 2s until check for PC', 'error');
                await new Promise(resolve => setTimeout(resolve, 2000));
                /* TODO - part to be modified - end */
            };
        };
        if (!inputAccepted) {
            //const checkPC : [boolean, undefined | []] = this.checkParallelCut(inOutGraph);
            const checkPC : [boolean, undefined | [DFG, [Node[], Arc[]], [Node[], Arc[]], boolean, Arc, Arc]] = this.checkParallelCut(inOutGraph);
            inputAccepted = checkPC[0];
            if (inputAccepted) {
                /* TODO - part to be modified - start */
                this._toastService.showToast('input accepted as PC, 3s until execution', 'success');
                await new Promise(resolve => setTimeout(resolve, 3000));
                /* TODO - part to be modified - end */
                if (checkPC[1] !== undefined) {
                    this.executeParallelCut(inOutGraph, checkPC[1][0], checkPC[1][1], checkPC[1][2], checkPC[1][3], checkPC[1][4], checkPC[1][5]);
                    this._displayService.refreshData();
                    /* TODO - part to be modified - start */
                    this._toastService.showToast('PC executed, 4s until reset of marked flags', 'info');
                    await new Promise(resolve => setTimeout(resolve, 4000));
                    /* TODO - part to be modified - end */
                    inOutGraph.resetAllMarked();
                } else {
                    throw new Error('#srv.mnr.ccI.002: ' + 'input check failed - check identified parallel cut, but did not return associated values');
                };
            } else {
                /* TODO - part to be modified - start */
                this._toastService.showToast('input rejected as PC, 2s until check for LC', 'error');
                await new Promise(resolve => setTimeout(resolve, 2000));
                /* TODO - part to be modified - end */
            };
        };
        if (!inputAccepted) {
            const checkLC : [boolean, undefined | []] = this.checkLoopCut(inOutGraph);
            inputAccepted = checkLC[0];
            if (inputAccepted) {
                /* TODO - part to be modified - start */
                this._toastService.showToast('input accepted as LC, 3s until execution', 'success');
                await new Promise(resolve => setTimeout(resolve, 3000));
                /* TODO - part to be modified - end */
                if (checkLC[1] !== undefined) {
                    this.executeLoopCut(inOutGraph);
                    this._displayService.refreshData();
                    /* TODO - part to be modified - start */
                    this._toastService.showToast('LC executed, 4s until reset of marked flags', 'info');
                    await new Promise(resolve => setTimeout(resolve, 4000));
                    /* TODO - part to be modified - end */
                    inOutGraph.resetAllMarked();
                } else {
                    throw new Error('#srv.mnr.ccI.003: ' + 'input check failed - check identified loop cut, but did not return associated values');
                };
            } else {
                /* TODO - part to be modified - start */
                this._toastService.showToast('input rejected as LC, 2s until check for BC', 'error');
                await new Promise(resolve => setTimeout(resolve, 2000));
                /* TODO - part to be modified - end */
            };
        };
        if (!inputAccepted) {
            const checkBC : [boolean, undefined | [DFG, Node | undefined]] = this.checkBaseCase(inOutGraph);
            inputAccepted = checkBC[0];
            if (inputAccepted) {
                /* TODO - part to be modified - start */
                this._toastService.showToast('input accepted as BC, 3s until execution', 'success');
                await new Promise(resolve => setTimeout(resolve, 3000));
                /* TODO - part to be modified - end */
                if (checkBC[1] !== undefined) {
                    if (checkBC[1][1] !== undefined) {
                        this.executeBaseCase(inOutGraph, checkBC[1][0], checkBC[1][1]);
                    } else {
                        this.executeBaseCase(inOutGraph, checkBC[1][0]);
                    };
                    this._displayService.refreshData();
                    /* TODO - part to be modified - start */
                    this._toastService.showToast('BC executed, 4s until reset of marked flags', 'info');
                    await new Promise(resolve => setTimeout(resolve, 4000));
                    /* TODO - part to be modified - end */
                    inOutGraph.resetAllMarked();
                } else {
                    throw new Error('#srv.mnr.ccI.004: ' + 'input check failed - check identified base case, but did not return associated values');
                };
            } else {
                /* TODO - part to be modified - start */
                this._toastService.showToast('input rejected as BC, end of checks reached --> no matching pattern found', 'error');
                await new Promise(resolve => setTimeout(resolve, 1000));
                /* TODO - part to be modified - end */
            };
        };
        //
        /* TODO - alternative implementation for test purposes - start */
        //
        // inOutGraph.resetAllMarked();
        // this._displayService.refreshData();
        // this._toastService.showToast('marked flags reset, 2s until automated check for all BC', 'info');
        // await new Promise(resolve => setTimeout(resolve, 2000));
        // const cases : number = this.autoCheckBaseCase(inOutGraph);
        // this._toastService.showToast('end of checks reached, found ' + cases.toString() + ' BC', 'error');
        // await new Promise(resolve => setTimeout(resolve, 1000));
        //
        /* TODO - alternative implementation for test purposes - end */
        //
        this._displayService.refreshData();
        /* TODO - part to be modified - start */
        if (this.checkTermination(inOutGraph)) {
            this._toastService.showToast('the inductive miner has terminated', 'success');
        } else {
            this._toastService.showToast('termination condition of inductive miner is not met', 'error');
        };
        /* TODO - part to be modified - end */
    };

    /* to be removed - start */
    public testResetMarked(inOutGraph : Graph) : void  {
        inOutGraph.resetAllMarked();
        this._displayService.refreshData();
    };
    public testResetChanges(inOutGraph : Graph) : void  {
        inOutGraph.resetAllChanged();
        inOutGraph.resetAllNew();
        this._displayService.refreshData();
    };
    public testExclusiveCut(inOutGraph : Graph) : boolean  {
        const returnValue : [boolean, undefined | [DFG, [Node[], Arc[]], [Node[], Arc[]], boolean, Arc, Arc]] = this.checkExclusiveCut(inOutGraph);
        this._displayService.refreshData();
        return returnValue[0];
    };
    public testBaseCase(inOutGraph : Graph) : boolean  {
        const checkBC : [boolean, undefined | [DFG, Node | undefined]] = this.checkBaseCase(inOutGraph);
        if (checkBC[0]) {
            if (checkBC[1] !== undefined) {
                if (checkBC[1][1] !== undefined) {
                    this.executeBaseCase(inOutGraph, checkBC[1][0], checkBC[1][1]);
                } else {
                    this.executeBaseCase(inOutGraph, checkBC[1][0]);
                };
            } else {
                throw new Error('#srv.mnr.tbc.000: ' + 'test base case check failed - check identified base case, but did not return associated values');
            };
        };
        this._displayService.refreshData();
        return checkBC[0];
    };
    public testAutoBaseCase(inOutGraph : Graph) : number  {
        const returnValue : number = this.autoCheckBaseCase(inOutGraph);
        this._displayService.refreshData();
        return returnValue;
    };
    /* to be removed - end */

    private autoCheckBaseCase(
        inOutGraph : Graph
    ) : number {
        /* to be removed - start */
        console.log('im_service started automated check for base cases');
        /* to be removed - end */
        inOutGraph.resetAllChanged();
        inOutGraph.resetAllNew();
        const casesArray : [DFG, Node | undefined][] = [];
        let casesFound : number = 0;
        for (const dfg of inOutGraph.dfgArray) {
            if (dfg.nodes.length < 4) {
                inOutGraph.resetAllMarked();
                for (const node of dfg.nodes) {
                    inOutGraph.setElementMarkedFlag(node, true);
                };
                const checkBC : [boolean, undefined | [DFG, Node | undefined]] = this.checkBaseCase(inOutGraph);
                if (checkBC[0]) {
                    if (checkBC[1] !== undefined) {
                        casesArray.push(checkBC[1])
                        casesFound++;
                    } else {
                        throw new Error('#srv.mnr.abc.000: ' + 'automated base case check failed - check identified base case, but did not return associated values');
                    };
                };
            };
        };
        inOutGraph.resetAllMarked();
        let casesExecuted : number = 0;
        for (const foundCase of casesArray) {
            if (foundCase[1] !== undefined) {
                this.executeBaseCase(inOutGraph, foundCase[0], foundCase[1]);
            } else {
                this.executeBaseCase(inOutGraph, foundCase[0]);
            };
            casesExecuted++;
        };
        if (casesExecuted !== casesFound) {
            throw new Error('#srv.mnr.abc.001: ' + 'automated base case check failed - found ' + casesFound + ' cases, but executed ' + casesExecuted);
        };
        return casesFound;
    };

    private checkExclusiveCut(
        inOutGraph : Graph
    ) : [
        boolean,
        undefined | [DFG, [Node[], Arc[]], [Node[], Arc[]], boolean, Arc, Arc]
    ] {
        /* to be removed - start */
        console.log('im_service started check of exclusive cut');
        /* to be removed - end */
        if (inOutGraph.markedArcs.length !== 2) {
            /* to be removed - start */
            console.log('exclusive cut rejected on check 1');
            /* to be removed - end */
            return [false, undefined];
        };
        if (inOutGraph.markedNodes.length < 1) {
            /* to be removed - start */
            console.log('exclusive cut rejected on check 2');
            /* to be removed - end */
            return [false, undefined];
        };
        let cutDFG : number | undefined = this.checkMarkedDFG(inOutGraph);
        if (cutDFG === undefined) {
            /* to be removed - start */
            console.log('exclusive cut rejected on check 3');
            /* to be removed - end */
            return [false, undefined];
        };
        const dfgPos : number | undefined = this.checkDfgPosition(inOutGraph, cutDFG);
        if (dfgPos === undefined) {
            /* to be removed - start */
            console.log('exclusive cut rejected on check 4');
            /* to be removed - end */
            return [false, undefined];
        };
        const dfg : DFG = inOutGraph.dfgArray[dfgPos];
        const endpointsMarked : boolean | undefined = this.checkEndpointsEC(dfg);
        if (endpointsMarked === undefined) {
            /* to be removed - start */
            console.log('exclusive cut rejected on check 5');
            /* to be removed - end */
            return [false, undefined];
        };
        const cutArcs : [Arc, Arc] | undefined = this.checkCutArcsEC(inOutGraph, dfg);
        if (cutArcs === undefined) {
            /* to be removed - start */
            console.log('exclusive cut rejected on check 6');
            /* to be removed - end */
            return [false, undefined];
        };
        const splitM : [Node[], Arc[]] = [[], []];
        const splitU : [Node[], Arc[]] = [[], []];
        const arcSplit : [Arc[], Arc[]] | undefined = this.splitArcsEC(dfg);
        if (arcSplit === undefined) {
            /* to be removed - start */
            console.log('exclusive cut rejected on check 7');
            /* to be removed - end */
            return [false, undefined];
        };
        splitM[1] = arcSplit[0];
        splitU[1] = arcSplit[1];
        const nodeSplit : [Node[], Node[]] | undefined = this.splitNodesEC(dfg);
        if (nodeSplit === undefined) {
            /* to be removed - start */
            console.log('exclusive cut rejected on check 8');
            /* to be removed - end */
            return [false, undefined];
        };
        splitM[0] = nodeSplit[0];
        splitU[0] = nodeSplit[1];
        if ((splitM[1].length) < (splitM[0].length - 1)) {
            /* to be removed - start */
            console.log('exclusive cut rejected on check 9');
            /* to be removed - end */
            return [false, undefined];
        };
        if ((splitU[1].length) < (splitU[0].length - 1)) {
            /* to be removed - start */
            console.log('exclusive cut rejected on check 10');
            /* to be removed - end */
            return [false, undefined];
        };
        /* to be removed - start */
        console.log('found exclusive cut');
        /* to be removed - end */
        return [true, [dfg, splitM, splitU, endpointsMarked, cutArcs[0], cutArcs[1]]];
    };

    private checkSequenceCut(
        inOutGraph : Graph
    ) : [
        boolean, 
        undefined | [DFG, Arc[], [Node[], Arc[]], [Node[], Arc[]], boolean]
    ] {
        if (inOutGraph.markedArcs.length < 1) {
            /* to be removed - start */
            console.log('sequence cut rejected on check 1');
            /* to be removed - end */
            return [false, undefined];
        };
        if (inOutGraph.markedNodes.length < 2) {
            /* to be removed - start */
            console.log('sequence cut rejected on check 2');
            /* to be removed - end */
            return [false, undefined];
        };
        let cutDFG : number | undefined = this.checkMarkedDFG(inOutGraph);
        if (cutDFG === undefined) {
            /* to be removed - start */
            console.log('sequence cut rejected on check 3');
            /* to be removed - end */
            return [false, undefined];
        };
        const dfgPos : number | undefined = this.checkDfgPosition(inOutGraph, cutDFG);
        if (dfgPos === undefined) {
            /* to be removed - start */
            console.log('sequence cut rejected on check 4');
            /* to be removed - end */
            return [false, undefined];
        };
        const dfg : DFG = inOutGraph.dfgArray[dfgPos];
        const cutsStartOnMarked : boolean = inOutGraph.markedArcs[0].source.marked;
        const endpointsCheck : boolean | undefined = this.checkEndpointsSC(dfg, cutsStartOnMarked);
        if (endpointsCheck === undefined) {
            /* to be removed - start */
            console.log('sequence cut rejected on check 5');
            /* to be removed - end */
            return [false, undefined];
        };
        const splitT : [Node[], Arc[]] = [[], []];
        const splitB : [Node[], Arc[]] = [[], []];
        const arcSplit : [Arc[], Arc[], Arc[]] | undefined = this.splitArcsSC(dfg, cutsStartOnMarked);
        if (arcSplit === undefined) {
            /* to be removed - start */
            console.log('sequence cut rejected on check 6');
            /* to be removed - end */
            return [false, undefined];
        };
        const cutArcs = arcSplit[0];
        splitT[1] = arcSplit[1];
        splitB[1] = arcSplit[2];
        const nodeSplit : [Node[], Node[]] | undefined = this.splitNodesSC(dfg, cutsStartOnMarked);
        if (nodeSplit === undefined) {
            /* to be removed - start */
            console.log('sequence cut rejected on check 7');
            /* to be removed - end */
            return [false, undefined];
        };
        splitT[0] = nodeSplit[0];
        splitB[0] = nodeSplit[1];
        return [true, [dfg, cutArcs, splitT, splitB, cutsStartOnMarked]];
    };

    private checkParallelCut(
        inOutGraph : Graph
    ) : [
        boolean,
        undefined | [DFG, [Node[], Arc[]], [Node[], Arc[]], boolean, Arc, Arc]
    ] {
        /* to be removed - start */
        console.log('im_service started check of parallel cut');
        /* to be removed - end */
        if (inOutGraph.markedArcs.length !== 2) {
            /* to be removed - start */
            console.log('cut rejected on check 1');
            /* to be removed - end */
            return [false, undefined];
        };
        let cutDFG : number | undefined = this.checkMarkedDFG(inOutGraph);
        if (cutDFG === undefined) {
            /* to be removed - start */
            console.log('cut rejected on check 2');
            /* to be removed - end */
            return [false, undefined];
        };
        const dfgPos : number | undefined = this.checkDfgPosition(inOutGraph, cutDFG);
        if (dfgPos === undefined) {
            /* to be removed - start */
            console.log('cut rejected on check 3');
            /* to be removed - end */
            return [false, undefined];
        };
        const dfg : DFG = inOutGraph.dfgArray[dfgPos];
        const cutArcs : [Arc, Arc] | undefined = this.checkCutArcsEC(inOutGraph, dfg);
        if (cutArcs === undefined) {
            /* to be removed - start */
            console.log('cut rejected on check 4');
            /* to be removed - end */
            return [false, undefined];
        };
        let endpointsMarked : boolean;
        if (dfg.startNode.marked) {
            if (dfg.endNode.marked) {
                endpointsMarked = true;
            } else {
                /* to be removed - start */
                console.log('cut rejected on check 5');
                /* to be removed - end */
               return [false, undefined];
            };
        } else {
            if (dfg.endNode.marked) {
                /* to be removed - start */
                console.log('cut rejected on check 6');
                /* to be removed - end */
                return [false, undefined];
            } else {
                endpointsMarked = false;
            };
        };
        let splitM : [Node[], Arc[]] = [[], []];
        let splitU : [Node[], Arc[]] = [[], []];
        for (const arc of dfg.arcs) {
            if (!arc.marked) {
                if (arc.source.marked) {
                    if (arc.target.marked) {
                        splitM[1].push(arc);
                    };
                } else {
                    if (!arc.target.marked) {
                        splitU[1].push(arc);
                    };
                };
            };
        };
        for (const node of dfg.nodes) {
            if (node !== dfg.startNode
                && node !== dfg.endNode) {
                if (node.marked) {
                    splitM[0].push(node)
                } else {
                    splitU[0].push(node)
                };
            };
        };
        /* checking whether every marked node is connected to every unmarked node */
        for (const markedNode of splitM[0]) {
            for (const unmarkedNode of splitU[0]) {
                const connected = dfg.arcs.some(
                    arc => (arc.source === markedNode && arc.target === unmarkedNode) ||
                                (arc.source === unmarkedNode && arc.target === markedNode)
                );
                if (!connected) {
                    /* to be removed - start */
                    console.log ('cut rejected because not all marked nodes are connted to unmarked nodes')
                    return [false, undefined]
                    /* to be removed - end */
                };
            };
        };
        /* checking whether every unmarked node is connected to every marked node */
        for (const markedNode of splitU[0]) {
            for (const unmarkedNode of splitM[0]) {
                const connected = dfg.arcs.some(
                    arc => (arc.source === unmarkedNode && arc.target === markedNode) ||
                        (arc.source === markedNode && arc.target === unmarkedNode)
                );
                if (!connected) {
                    /* to be removed - start */
                    console.log ('cut rejected because not all unmarked nodes are connted to marked nodes')
                    return [false, undefined]
                    /* to be removed - end */
                };
            };
        };
        /* checking whether marked or unmarked nodes are connected */
        /* checking marked nodes */
        if (!this.areNodesConnected(inOutGraph, true)){
            /* to be removed - start */
            console.log('cut rejected due to graph not being connected');
            /* to be removed - end */
            return [false, undefined];

        }
        /* checking unmarked nodes */
        if (!this.areNodesConnected(inOutGraph, false)){
            /* to be removed - start */
            console.log('cut rejected due to graph not being connected');
            /* to be removed - end */
            return [false, undefined];
        };
        if ((splitM[1].length) < (splitM[0].length - 1)) {
            /* to be removed - start */
            console.log('cut rejected on check 11');
            /* to be removed - end */
            return [false, undefined];
        };
        if ((splitU[1].length) < (splitU[0].length - 1)) {
            /* to be removed - start */
            console.log('cut rejected on check 12');
            /* to be removed - end */
            return [false, undefined];
        };
        /* to be removed - start */
        console.log('found parallel cut');
        /* to be removed - end */
        /* TODO - Aufruf adjustArcsForConnectivity um Kanten zu filtern die sich nur in A1 bzw A2 bewegen? */
        return [true, [dfg, splitM, splitU, endpointsMarked, cutArcs[0], cutArcs[1]]];
    };

    private checkLoopCut(inOutGraph : Graph) : [
        boolean,
        undefined | []
    ] {
        return [false, undefined];
    };

    private checkBaseCase(
        inOutGraph : Graph
    ) : [
        boolean,
        undefined | [DFG, Node | undefined]
    ] {
        /* to be removed - start */
        console.log('im_service started check of base case');
        /* to be removed - end */
        if (inOutGraph.markedArcs.length !== 0) {
            /* to be removed - start */
            console.log('base case rejected on check 1');
            /* to be removed - end */
            return [false, undefined];
        };
        if (inOutGraph.markedNodes.length < 2) {
            /* to be removed - start */
            console.log('base case rejected on check 2');
            /* to be removed - end */
            return [false, undefined];
        };
        if (inOutGraph.markedNodes.length > 3) {
            /* to be removed - start */
            console.log('base case rejected on check 3');
            /* to be removed - end */
            return [false, undefined];
        };
        let cutDFG : number | undefined = this.checkMarkedDFG(inOutGraph);
        if (cutDFG === undefined) {
            /* to be removed - start */
            console.log('base case rejected on check 4');
            /* to be removed - end */
            return [false, undefined];
        };
        const dfgPos : number | undefined = this.checkDfgPosition(inOutGraph, cutDFG);
        if (dfgPos === undefined) {
            /* to be removed - start */
            console.log('base case rejected on check 5');
            /* to be removed - end */
            return [false, undefined];
        };
        const dfg : DFG = inOutGraph.dfgArray[dfgPos];
        if (dfg.nodes.length > 4) {
            /* to be removed - start */
            console.log('base case rejected on check 6');
            /* to be removed - end */
            return [false, undefined];
        };
        if (dfg.startNode.type !== 'support') {
            throw new Error('#srv.mnr.cbc.000: ' + 'base case check failed - inconsitent dfg detected (start node type is not \'support\')');
        };
        if (dfg.startNode.label !== 'play') {
            throw new Error('#srv.mnr.cbc.001: ' + 'base case check failed - inconsitent dfg detected (start node label is not \'play\')');
        };
        if (dfg.endNode.type !== 'support') {
            throw new Error('#srv.mnr.cbc.002: ' + 'base case check failed - inconsitent dfg detected (end node type is not \'support\')');
        };
        if (dfg.endNode.label !== 'stop') {
            throw new Error('#srv.mnr.cbc.003: ' + 'base case check failed - inconsitent dfg detected (end node label is not \'stop\')');
        };
        if (dfg.nodes.length === 3) {
            if (inOutGraph.markedNodes.length !== 3) {
                /* to be removed - start */
                console.log('base case rejected on check 7');
                /* to be removed - end */
                return [false, undefined];
            };
            if (dfg.arcs.length !== 2) {
                /* to be removed - start */
                console.log('base case rejected on check 8');
                /* to be removed - end */
                return [false, undefined];
            };
            if (dfg.arcs[0].weight !== dfg.arcs[1].weight) {
                /* to be removed - start */
                console.log('base case rejected on check 9');
                /* to be removed - end */
                return [false, undefined];
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
                throw new Error('#srv.mnr.cbc.004: ' + 'base case check failed - inconsitent dfg detected (three nodes, but more than one node that is neither start nor end)');
            };
            if (midNode === undefined) {
                throw new Error('#srv.mnr.cbc.005: ' + 'base case check failed - impossible error)');
            };
            if (midNode.type !== 'event') {
                if ((midNode.type !== 'support') || (midNode.label !=='tau')) {
                    throw new Error('#srv.mnr.cbc.006: ' + 'base case check failed - inconsitent dfg detected (middle node type is neither event nor tau)');
                };
            };
            for (const arc of dfg.arcs) {
                if (arc.source === dfg.startNode) {
                    if (arc.target !== midNode) {
                        /* to be removed - start */
                        console.log('base case rejected on check 10');
                        /* to be removed - end */
                        return [false, undefined];
                    };
                } else if (arc.source === midNode) {
                    if (arc.target !== dfg.endNode) {
                        /* to be removed - start */
                        console.log('base case rejected on check 11');
                        /* to be removed - end */
                        return [false, undefined];
                    };
                } else {
                    /* to be removed - start */
                    console.log('base case rejected on check 12');
                    /* to be removed - end */
                    return [false, undefined];
                };
            };
            return [true, [dfg, midNode]];
        } else if (dfg.nodes.length === 2) {
            if (inOutGraph.markedNodes.length !== 2) {
                /* to be removed - start */
                console.log('base case rejected on check 13');
                /* to be removed - end */
                return [false, undefined];
            };
            if (dfg.arcs.length !== 1) {
                /* to be removed - start */
                console.log('base case rejected on check 14');
                /* to be removed - end */
                return [false, undefined];
            };
            if (dfg.arcs[0].source !== dfg.startNode) {
                /* to be removed - start */
                console.log('base case rejected on check 15');
                /* to be removed - end */
                return [false, undefined];
            };
            if (dfg.arcs[0].target !== dfg.endNode) {
                /* to be removed - start */
                console.log('base case rejected on check 16');
                /* to be removed - end */
                return [false, undefined];
            };
            return [true, [dfg, undefined]];
        } else {
            throw new Error('#srv.mnr.cbc.015: ' + 'base case check failed - inconsitent dfg detected (less than two nodes) detected');
        };
    };

    private executeExclusiveCut(
        inOutGraph : Graph, 
        inSplitDfg : DFG, 
        inMarkedSubgraph : [Node[], Arc[]], 
        inUnmarkedSubgraph : [Node[], Arc[]], 
        inEndpointsMarked : boolean, 
        inCutStartArc : Arc, 
        inCutEndArc : Arc
    ) : void {
        /* deciding which of the subgraphs to cut out as a new dfg, and which to keep as the rest of the old dfg */
        const restSubgraph : [Node[], Arc[]] = [[], []];
        const cutSubgraph : [Node[], Arc[]] = [[], []];
        if (inEndpointsMarked) {
            restSubgraph[0] = inMarkedSubgraph[0];
            restSubgraph[1] = inMarkedSubgraph[1];
            cutSubgraph[0] = inUnmarkedSubgraph[0];
            cutSubgraph[1] = inUnmarkedSubgraph[1];
        } else {
            restSubgraph[0] = inUnmarkedSubgraph[0];
            restSubgraph[1] = inUnmarkedSubgraph[1];
            cutSubgraph[0] = inMarkedSubgraph[0];
            cutSubgraph[1] = inMarkedSubgraph[1];
        };
        /* checking if the cut DFG starts at the global start of the graph or ends at the global end */
        const startOfGraph : boolean = this.checkGraphStart(inOutGraph, inCutStartArc.source);
        const endOfGraph : boolean = this.checkGraphEnd(inOutGraph, inCutEndArc.target);
        /* generating new start and end nodes and matching arcs */
        const globalPlayNodeArray : Node[] = [];
        const globalStopNodeArray : Node[] = [];
        let restSubgraphPlay : Node;
        let restSubgraphStop : Node;
        let cutSubgraphPlay : Node;
        let cutSubgraphStop : Node;
        let uncutStartArcs : Arc[] = [];
        let uncutStartArcsWeight : number = 0;
        let uncutEndArcs : Arc[] = [];
        let uncutEndArcsWeight : number = 0;
        let uncutMidArcs : Arc[] = [];
        let uncutStartNodesCount : number = 0;
        let uncutStartNodesX : number = 0;
        let uncutStartNodesY : number = 0;
        let uncutEndNodesCount : number = 0;
        let uncutEndNodesX : number = 0;
        let uncutEndNodesY : number = 0;
        for (const arc of restSubgraph[1]) {
            if (arc.source === inSplitDfg.startNode) {
                uncutStartArcs.push(arc);
            } else if (arc.target === inSplitDfg.endNode) {
                uncutEndArcs.push(arc);
            } else {
                uncutMidArcs.push(arc);
            };
            if (arc.source === inSplitDfg.startNode) {
                uncutStartNodesX = (uncutStartNodesX + arc.target.x);
                uncutStartNodesY = (uncutStartNodesY + arc.target.y);
                uncutStartArcsWeight = (uncutStartArcsWeight + arc.weight);
                uncutStartNodesCount++;
            };
            if (arc.target === inSplitDfg.endNode) {
                uncutEndNodesX = (uncutEndNodesX + arc.source.x);
                uncutEndNodesY = (uncutEndNodesY + arc.source.y);
                uncutEndArcsWeight = (uncutEndArcsWeight + arc.weight);
                uncutEndNodesCount++;
            };
        };
        restSubgraph[1] = [];
        for (const arc of uncutMidArcs) {
            restSubgraph[1].push(arc);
        };
        const nextUncutNodeFromStartX : number = Math.floor(uncutStartNodesX / uncutStartNodesCount);
        const nextUncutNodeFromStartY : number = Math.floor(uncutStartNodesY / uncutStartNodesCount);
        const nextUncutNodeFromEndX : number = Math.floor(uncutEndNodesX / uncutEndNodesCount);
        const nextUncutNodeFromEndY : number = Math.floor(uncutEndNodesY / uncutEndNodesCount);
        if (startOfGraph) {
            const startArcWeight : number = (inCutStartArc.weight + uncutStartArcsWeight);
            const globalPlayNodes : [Node, Node, Node] = this.transformStart(inOutGraph, inSplitDfg.startNode, startArcWeight);
            globalPlayNodeArray.push(globalPlayNodes[0], globalPlayNodes[1], globalPlayNodes[2]);
            const globalPlayPlaceTwo : Node = globalPlayNodes[2];
            const cutPlayX : number = Math.floor((globalPlayPlaceTwo.x / 2) + (inCutStartArc.target.x / 2));
            const cutPlayY : number = Math.floor((globalPlayPlaceTwo.y / 2) + (inCutStartArc.target.y / 2));
            const restPlayX : number = Math.floor((globalPlayPlaceTwo.x / 2) + (nextUncutNodeFromStartX / 2));
            const restPlayY : number = Math.floor((globalPlayPlaceTwo.y / 2) + (nextUncutNodeFromStartY / 2));
            const cutPlayAdded : [boolean, number, Node] = inOutGraph.addNode('support', 'play', cutPlayX, cutPlayY);
            if (!(cutPlayAdded[0])) {
                throw new Error('#srv.mnr.eec.000: ' + 'exclusive cut execution failed - new start node for cut part of split dfg could not be added due to conflict with existing node)');
            };
            const restPlayAdded : [boolean, number, Node] = inOutGraph.addNode('support', 'play', restPlayX, restPlayY);
            if (!(restPlayAdded[0])) {
                throw new Error('#srv.mnr.eec.001: ' + 'exclusive cut execution failed - new start node for rest part of split dfg could not be added due to conflict with existing node)');
            };
            restSubgraphPlay = restPlayAdded[2];
            cutSubgraphPlay = cutPlayAdded[2];
            if (inEndpointsMarked) {
                inOutGraph.setElementMarkedFlag(restSubgraphPlay, true);
            } else {
                inOutGraph.setElementMarkedFlag(cutSubgraphPlay, true);
            };
            inOutGraph.setElementNewFlag(restSubgraphPlay, true);
            inOutGraph.setElementNewFlag(cutSubgraphPlay, true);
            const arcToRestAdded = inOutGraph.addArc(globalPlayPlaceTwo, restSubgraphPlay, uncutStartArcsWeight);
            if (!(arcToRestAdded[0])) {
                throw new Error('#srv.mnr.eec.002: ' + 'exclusive cut execution failed - addition of arc from second play place to first new start node failed due to conflict with an existing arc');
            };
            const arcToCutAdded = inOutGraph.addArc(globalPlayPlaceTwo, cutSubgraphPlay, inCutStartArc.weight);
            if (!(arcToCutAdded[0])) {
                throw new Error('#srv.mnr.eec.003: ' + 'exclusive cut execution failed - addition of arc from second play place to second new start node failed due to conflict with an existing arc');
            };
            inOutGraph.setElementMarkedFlag(arcToCutAdded[2], inCutStartArc.marked);
            inOutGraph.setElementChangedFlag(arcToRestAdded[2], true);
            inOutGraph.setElementChangedFlag(arcToCutAdded[2], true);
            for (const arc of uncutStartArcs) {
                restSubgraph[1].push(this.replaceArc(inOutGraph, arc, restSubgraphPlay, arc.target));
            };
            cutSubgraph[1].push(this.replaceArc(inOutGraph, inCutStartArc, cutSubgraphPlay, inCutStartArc.target));
        } else {
            const incomingArcs : Arc[] = [];
            for (const arc of inOutGraph.arcs) {
                if (arc.target === inSplitDfg.startNode) {
                    incomingArcs.push(arc);
                };
            };
            if (incomingArcs.length < 1) {
                throw new Error('#srv.mnr.eec.004: ' + 'exclusive cut execution failed - no arc leading to the old start node of the split dfg was found within the graph');
            } else if (incomingArcs.length > 1) {
                throw new Error('#srv.mnr.eec.005: ' + 'exclusive cut execution failed - more than one arc leading to the old start node of the split dfg was found within the graph');
            };
            const incomingArc : Arc = incomingArcs[0];
            const cutPlayX : number = Math.floor((incomingArc.source.x / 2) + (inCutStartArc.target.x / 2));
            const cutPlayY : number = Math.floor((incomingArc.source.y / 2) + (inCutStartArc.target.y / 2));
            const restPlayX : number = Math.floor((incomingArc.source.x / 2) + (nextUncutNodeFromStartX / 2));
            const restPlayY : number = Math.floor((incomingArc.source.y / 2) + (nextUncutNodeFromStartY / 2));
            const cutPlayAdded : [boolean, number, Node] = inOutGraph.addNode('support', 'play', cutPlayX, cutPlayY);
            if (!(cutPlayAdded[0])) {
                throw new Error('#srv.mnr.eec.006: ' + 'exclusive cut execution failed - new start node for cut part of split dfg could not be added due to conflict with existing node)');
            };
            restSubgraphPlay = inSplitDfg.startNode;
            cutSubgraphPlay = cutPlayAdded[2];
            restSubgraphPlay.coordinates = [restPlayX, restPlayY]
            if (!(inEndpointsMarked)) {
                inOutGraph.setElementMarkedFlag(cutSubgraphPlay, true);
            };
            inOutGraph.setElementChangedFlag(restSubgraphPlay, true);
            inOutGraph.setElementNewFlag(cutSubgraphPlay, true);
            const newWeight : number = (incomingArc.weight - inCutStartArc.weight);
            if (newWeight < 1) {
                throw new Error('#srv.mnr.eec.007: ' + 'exclusive cut execution failed - the weight of only arc leading into the split dfg is not higher than the weight of the first cut arc within the split dfg');
            };
            inOutGraph.updateArcWeight(incomingArc, newWeight);
            const arcToCutAdded = inOutGraph.addArc(incomingArc.source, cutSubgraphPlay, inCutStartArc.weight);
            if (!(arcToCutAdded[0])) {
                throw new Error('#srv.mnr.eec.008: ' + 'exclusive cut execution failed - addition of arc from outer source node to new start node failed due to conflict with an existing arc');
            };
            inOutGraph.setElementChangedFlag(incomingArc, true);
            inOutGraph.setElementChangedFlag(arcToCutAdded[2], true);
            for (const arc of uncutStartArcs) {
                restSubgraph[1].push(arc);
            };
            cutSubgraph[1].push(this.replaceArc(inOutGraph, inCutStartArc, cutSubgraphPlay, inCutStartArc.target));
        };
        if (endOfGraph) {
            const endArcWeight : number = (inCutEndArc.weight + uncutEndArcsWeight);
            const globalStopNodes : [Node, Node, Node] = this.transformEnd(inOutGraph, inSplitDfg.endNode, endArcWeight);
            globalStopNodeArray.push(globalStopNodes[0], globalStopNodes[1], globalStopNodes[2]);
            const globalStopPlaceOne : Node = globalStopNodes[0];
            const cutStopX : number = Math.floor((inCutEndArc.source.x / 2) + (globalStopPlaceOne.x / 2));
            const cutStopY : number = Math.floor((inCutEndArc.source.y / 2) + (globalStopPlaceOne.y / 2));
            const restStopX : number = Math.floor((nextUncutNodeFromEndX / 2) + (globalStopPlaceOne.x / 2));
            const restStopY : number = Math.floor((nextUncutNodeFromEndY / 2) + (globalStopPlaceOne.y / 2));
            const cutStopAdded : [boolean, number, Node] = inOutGraph.addNode('support', 'stop', cutStopX, cutStopY);
            if (!(cutStopAdded[0])) {
                throw new Error('#srv.mnr.eec.009: ' + 'exclusive cut execution failed - new end node for cut part of split dfg could not be added due to conflict with existing node)');
            };
            const restStopAdded : [boolean, number, Node] = inOutGraph.addNode('support', 'stop', restStopX, restStopY);
            if (!(restStopAdded[0])) {
                throw new Error('#srv.mnr.eec.010: ' + 'exclusive cut execution failed - new end node for rest part of split dfg could not be added due to conflict with existing node)');
            };
            restSubgraphStop = restStopAdded[2];
            cutSubgraphStop = cutStopAdded[2];
            if (inEndpointsMarked) {
                inOutGraph.setElementMarkedFlag(restSubgraphStop, true);
            } else {
                inOutGraph.setElementMarkedFlag(cutSubgraphStop, true);
            };
            inOutGraph.setElementNewFlag(restSubgraphStop, true);
            inOutGraph.setElementNewFlag(cutSubgraphStop, true);
            const arcFromRestAdded = inOutGraph.addArc(restSubgraphStop, globalStopPlaceOne, uncutEndArcsWeight);
            if (!(arcFromRestAdded[0])) {
                throw new Error('#srv.mnr.eec.011: ' + 'exclusive cut execution failed - addition of arc from first new end node to first stop place failed due to conflict with an existing arc');
            };
            const arcFromCutAdded = inOutGraph.addArc(cutSubgraphStop, globalStopPlaceOne, inCutEndArc.weight);
            if (!(arcFromCutAdded[0])) {
                throw new Error('#srv.mnr.eec.012: ' + 'exclusive cut execution failed - addition of arc from second new end node to first stop place failed due to conflict with an existing arc');
            };
            inOutGraph.setElementMarkedFlag(arcFromCutAdded[2], inCutEndArc.marked);
            inOutGraph.setElementChangedFlag(arcFromRestAdded[2], true);
            inOutGraph.setElementChangedFlag(arcFromCutAdded[2], true);
            for (const arc of uncutEndArcs) {
                restSubgraph[1].push(this.replaceArc(inOutGraph, arc, arc.source, restSubgraphStop));
            };
            cutSubgraph[1].push(this.replaceArc(inOutGraph, inCutEndArc, inCutEndArc.source, cutSubgraphStop));
        } else {
            const outgoingArcs : Arc[] = [];
            for (const arc of inOutGraph.arcs) {
                if (arc.source === inSplitDfg.endNode) {
                    outgoingArcs.push(arc);
                };
            };
            if (outgoingArcs.length < 1) {
                throw new Error('#srv.mnr.eec.013: ' + 'exclusive cut execution failed - no arc coming from the old end node of the split dfg was found within the graph');
            } else if (outgoingArcs.length > 1) {
                throw new Error('#srv.mnr.eec.014: ' + 'exclusive cut execution failed - more than one arc coming from the old end node of the split dfg was found within the graph');
            };
            const outgoingArc : Arc = outgoingArcs[0];
            const cutStopX : number = Math.floor((inCutEndArc.source.x / 2) + (outgoingArc.target.x / 2));
            const cutStopY : number = Math.floor((inCutEndArc.source.y / 2) + (outgoingArc.target.y / 2));
            const restStopX : number = Math.floor((nextUncutNodeFromEndX / 2) + (outgoingArc.target.x / 2));
            const restStopY : number = Math.floor((nextUncutNodeFromEndY / 2) + (outgoingArc.target.y / 2));
            const cutStopAdded : [boolean, number, Node] = inOutGraph.addNode('support', 'stop', cutStopX, cutStopY);
            if (!(cutStopAdded[0])) {
                throw new Error('#srv.mnr.eec.015: ' + 'exclusive cut execution failed - new end node for cut part of split dfg could not be added due to conflict with existing node)');
            };
            restSubgraphStop = inSplitDfg.endNode;
            cutSubgraphStop = cutStopAdded[2];
            restSubgraphStop.coordinates = [restStopX, restStopY]
            if (!(inEndpointsMarked)) {
                inOutGraph.setElementMarkedFlag(cutSubgraphStop, true);
            };
            inOutGraph.setElementChangedFlag(restSubgraphStop, true);
            inOutGraph.setElementNewFlag(cutSubgraphStop, true);
            const newWeight : number = (outgoingArc.weight - inCutEndArc.weight);
            if (newWeight < 1) {
                throw new Error('#srv.mnr.eec.016: ' + 'exclusive cut execution failed - the weight of only arc coming from the split dfg is not higher than the weight of the last cut arc within the split dfg');
            };
            inOutGraph.updateArcWeight(outgoingArc, newWeight);
            const arcFromCutAdded = inOutGraph.addArc(cutSubgraphStop, outgoingArc.target, inCutEndArc.weight);
            if (!(arcFromCutAdded[0])) {
                throw new Error('#srv.mnr.eec.017: ' + 'exclusive cut execution failed - addition of arc from new end node to outer target node failed due to conflict with an existing arc');
            };
            inOutGraph.setElementChangedFlag(outgoingArc, true);
            inOutGraph.setElementChangedFlag(arcFromCutAdded[2], true);
            for (const arc of uncutEndArcs) {
                restSubgraph[1].push(arc);
            };
            cutSubgraph[1].push(this.replaceArc(inOutGraph, inCutEndArc, inCutEndArc.source, cutSubgraphStop));
        };
        /* splitting the dfg event log between the cut part and the rest part */
        const cutSubLog : Node[][] = [];
        const restSubLog : Node[][] = [];
        if (inEndpointsMarked) {
            for (const trace of inSplitDfg.log) {
                const cutTrace : Node[] = [cutSubgraphPlay];
                const restTrace : Node[] = [restSubgraphPlay];
                for (let eventIdx = 1; eventIdx < (trace.length - 1); eventIdx++) {
                    if (trace[eventIdx].marked) {
                        restTrace.push(trace[eventIdx]);
                    } else {
                        cutTrace.push(trace[eventIdx]);
                    };
                };
                cutTrace.push(cutSubgraphStop);
                restTrace.push(restSubgraphStop);
                if (cutTrace.length > 2) {
                    cutSubLog.push(cutTrace);
                };
                if (restTrace.length > 2) {
                    restSubLog.push(restTrace);
                };
            };
        } else {
            for (const trace of inSplitDfg.log) {
                const cutTrace : Node[] = [cutSubgraphPlay];
                const restTrace : Node[] = [restSubgraphPlay];
                for (let eventIdx = 1; eventIdx < (trace.length - 1); eventIdx++) {
                    if (trace[eventIdx].marked) {
                        cutTrace.push(trace[eventIdx]);
                    } else {
                        restTrace.push(trace[eventIdx]);
                    };
                };
                cutTrace.push(cutSubgraphStop);
                restTrace.push(restSubgraphStop);
                if (cutTrace.length > 2) {
                    cutSubLog.push(cutTrace);
                };
                if (restTrace.length > 2) {
                    restSubLog.push(restTrace);
                };
            };
        };
        /* updating the graph event log */
        if (startOfGraph) {
            if (globalPlayNodeArray.length !== 3) {
                throw new Error('#srv.mnr.eec.018: ' + 'exclusive cut execution failed - newly transformed global play nodes were not assigned properly');
            };
            if (endOfGraph) {
                if (globalStopNodeArray.length !== 3) {
                    throw new Error('#srv.mnr.eec.019: ' + 'exclusive cut execution failed - newly transformed global stop nodes were not assigned properly');
                };
                for (const trace of inOutGraph.logArray) {
                    for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                        if (trace[evIdx] === inCutStartArc.source) {
                            if (trace[evIdx + 1] === inCutStartArc.target) {
                                trace.splice(evIdx, 1, globalPlayNodeArray[0], globalPlayNodeArray[1], globalPlayNodeArray[2], cutSubgraphPlay);
                                evIdx = (evIdx + 3);
                            } else {
                                trace.splice(evIdx, 1, globalPlayNodeArray[0], globalPlayNodeArray[1], globalPlayNodeArray[2], restSubgraphPlay);
                                evIdx = (evIdx + 3);
                            };
                        };
                        if (trace[evIdx] === inCutEndArc.target) {
                            if (trace[evIdx - 1] === inCutEndArc.source) {
                                trace.splice(evIdx, 1, cutSubgraphStop, globalStopNodeArray[0], globalStopNodeArray[1], globalStopNodeArray[2]);
                                evIdx = (evIdx + 3);
                            } else {
                                trace.splice(evIdx, 1, restSubgraphStop, globalStopNodeArray[0], globalStopNodeArray[1], globalStopNodeArray[2]);
                                evIdx = (evIdx + 3);
                            };
                        };
                    };
                };
            } else {
                for (const trace of inOutGraph.logArray) {
                    for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                        if (trace[evIdx] === inCutStartArc.source) {
                            if (trace[evIdx + 1] === inCutStartArc.target) {
                                trace.splice(evIdx, 1, globalPlayNodeArray[0], globalPlayNodeArray[1], globalPlayNodeArray[2], cutSubgraphPlay);
                                evIdx = (evIdx + 3);
                            } else {
                                trace.splice(evIdx, 1, globalPlayNodeArray[0], globalPlayNodeArray[1], globalPlayNodeArray[2], restSubgraphPlay);
                                evIdx = (evIdx + 3);
                            };
                        };
                        if (trace[evIdx] === inCutEndArc.target) {
                            if (trace[evIdx - 1] === inCutEndArc.source) {
                                trace.splice(evIdx, 1, cutSubgraphStop);
                            } else {
                                trace.splice(evIdx, 1, restSubgraphStop);
                            };
                        };
                    };
                };
            };
        } else {
            if (endOfGraph) {
                if (globalStopNodeArray.length !== 3) {
                    throw new Error('#srv.mnr.eec.020: ' + 'exclusive cut execution failed - newly transformed global stop nodes were not assigned properly');
                };
                for (const trace of inOutGraph.logArray) {
                    for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                        if (trace[evIdx] === inCutStartArc.source) {
                            if (trace[evIdx + 1] === inCutStartArc.target) {
                                trace.splice(evIdx, 1, cutSubgraphPlay);
                            } else {
                                trace.splice(evIdx, 1, restSubgraphPlay);
                            };
                        };
                        if (trace[evIdx] === inCutEndArc.target) {
                            if (trace[evIdx - 1] === inCutEndArc.source) {
                                trace.splice(evIdx, 1, cutSubgraphStop, globalStopNodeArray[0], globalStopNodeArray[1], globalStopNodeArray[2]);
                                evIdx = (evIdx + 3);
                            } else {
                                trace.splice(evIdx, 1, restSubgraphStop, globalStopNodeArray[0], globalStopNodeArray[1], globalStopNodeArray[2]);
                                evIdx = (evIdx + 3);
                            };
                        };
                    };
                };
            } else {
                for (const trace of inOutGraph.logArray) {
                    for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                        if (trace[evIdx] === inCutStartArc.source) {
                            if (trace[evIdx + 1] === inCutStartArc.target) {
                                trace.splice(evIdx, 1, cutSubgraphPlay);
                            } else {
                                trace.splice(evIdx, 1, restSubgraphPlay);
                            };
                        };
                        if (trace[evIdx] === inCutEndArc.target) {
                            if (trace[evIdx - 1] === inCutEndArc.source) {
                                trace.splice(evIdx, 1, cutSubgraphStop);
                            } else {
                                trace.splice(evIdx, 1, restSubgraphStop);
                            };
                        };
                    };
                };
            };
        };
        /* updating dfgs */
        restSubgraph[0].push(restSubgraphPlay);
        restSubgraph[0].push(restSubgraphStop);
        cutSubgraph[0].push(cutSubgraphPlay);
        cutSubgraph[0].push(cutSubgraphStop);
        if (inEndpointsMarked) {
            inSplitDfg.update(cutSubgraphPlay, cutSubgraphStop, cutSubgraph[0], cutSubgraph[1], cutSubLog);
            inOutGraph.appendDFG(restSubgraphPlay, restSubgraphStop, restSubgraph[0], restSubgraph[1], restSubLog);
        } else {
            inSplitDfg.update(restSubgraphPlay, restSubgraphStop, restSubgraph[0], restSubgraph[1], restSubLog);
            inOutGraph.appendDFG(cutSubgraphPlay, cutSubgraphStop, cutSubgraph[0], cutSubgraph[1], cutSubLog);
        };
        /* deleting replaced endpoints and updating references */
        if (startOfGraph) {
            const transformedGlobalPlay : Node | undefined = inOutGraph.startNode;
            if (transformedGlobalPlay !== undefined) {
                inOutGraph.startNode = globalPlayNodeArray[0];
                if (!(inOutGraph.deleteNode(transformedGlobalPlay))) {
                    throw new Error('#srv.mnr.eec.021: ' + 'exclusive cut execution failed - old global play node was not deleted properly');
                };
            } else {
                throw new Error('#srv.mnr.eec.022: ' + 'exclusive cut execution failed - the global start node within the graph is undefined');
            };
        };
        if (endOfGraph) {
            const transformedGlobalStop : Node | undefined = inOutGraph.endNode;
            if (transformedGlobalStop !== undefined) {
                inOutGraph.endNode = globalStopNodeArray[2];
                if (!(inOutGraph.deleteNode(transformedGlobalStop))) {
                    throw new Error('#srv.mnr.eec.023: ' + 'exclusive cut execution failed - old global stop node was not deleted properly');
                };
            } else {
                throw new Error('#srv.mnr.eec.024: ' + 'exclusive cut execution failed - the global end node within the graph is undefined');
            };
        };
    };

    private executeSequenceCut(
        inOutGraph : Graph, 
        inSplitDfg : DFG, 
        inCutArcs : Arc[], 
        inTopSubgraph : [Node[], Arc[]], 
        inBotSubgraph : [Node[], Arc[]], 
        inTopMarked : boolean
    ) : void {
        /* generating new start and end nodes and matching arcs */
        let topSubgraphPlay : Node;
        let topSubgraphStop : Node;
        let botSubgraphPlay : Node;
        let botSubgraphStop : Node;
        let cutArcsWeight : number = 0;
        let cutArcsStartX : number = 0;
        let cutArcsStartY : number = 0;
        let cutArcsEndX : number = 0;
        let cutArcsEndY : number = 0;
        let cutArcsNum : number = inCutArcs.length;
        for (const arc of inCutArcs) {
            cutArcsWeight = (cutArcsWeight + arc.weight);
            cutArcsStartX = (cutArcsStartX + arc.source.x);
            cutArcsStartY = (cutArcsStartY + arc.source.y);
            cutArcsEndX = (cutArcsEndX + arc.target.x);
            cutArcsEndY = (cutArcsEndY + arc.target.y);
        };
        const cutArcsStartMidX : number = Math.floor(cutArcsStartX / cutArcsNum)
        const cutArcsStartMidY : number = Math.floor(cutArcsStartY / cutArcsNum);
        const cutArcsEndMidX : number = Math.floor(cutArcsEndX / cutArcsNum);
        const cutArcsEndMidY : number = Math.floor(cutArcsEndY / cutArcsNum);
        const newStopX : number = Math.floor((3 * (cutArcsStartMidX / 4)) + (cutArcsEndMidX / 4));
        const newStopY : number = Math.floor((3 * (cutArcsStartMidY / 4)) + (cutArcsEndMidY / 4));
        const newPlayX : number = Math.floor((cutArcsStartMidX / 4) + (3 * (cutArcsEndMidX / 4)));
        const newPlayY : number = Math.floor((cutArcsStartMidY / 4) + (3 * (cutArcsEndMidY / 4)));
        const newPlaceX : number = Math.floor((cutArcsStartMidX / 2) + (cutArcsEndMidX / 2));
        const newPlaceY : number = Math.floor((cutArcsStartMidY / 2) + (cutArcsEndMidY / 2));
        const newStopAdded : [boolean, number, Node] = inOutGraph.addNode('support', 'stop', newStopX, newStopY);
        if (!(newStopAdded[0])) {
            throw new Error('#srv.mnr.esc.000: ' + 'sequence cut execution failed - new end node for top part of split dfg could not be added due to conflict with existing node)');
        };
        const newStop : Node = newStopAdded[2];
        inTopSubgraph[0].push(newStop);
        const newPlayAdded : [boolean, number, Node] = inOutGraph.addNode('support', 'play', newPlayX, newPlayY);
        if (!(newPlayAdded[0])) {
            throw new Error('#srv.mnr.esc.001: ' + 'sequence cut execution failed - new play node for bottom part of split dfg could not be added due to conflict with existing node)');
        };
        const newPlay : Node = newPlayAdded[2];
        inBotSubgraph[0].push(newPlay);
        const newPlaceAdded : [boolean, number, Node] = inOutGraph.addNode('place', '', newPlaceX, newPlaceY);
        if (!(newPlaceAdded[0])) {
            throw new Error('#srv.mnr.esc.002: ' + 'sequence cut execution failed - new place between parts of split dfg could not be added due to conflict with existing node)');
        };
        const newPlace : Node = newPlaceAdded[2];
        inOutGraph.setElementNewFlag(newStop, true);
        inOutGraph.setElementNewFlag(newPlay, true);
        inOutGraph.setElementNewFlag(newPlace, true);
        topSubgraphPlay = inSplitDfg.startNode;
        topSubgraphStop = newStop;
        botSubgraphPlay = newPlay;
        botSubgraphStop = inSplitDfg.endNode;
        const innerArcOneAdded : [boolean, number, Arc] = inOutGraph.addArc(newStop, newPlace, cutArcsWeight);
        if (!(innerArcOneAdded[0])) {
            throw new Error('#srv.mnr.esc.003: ' + 'sequence cut execution failed - arc from new stop node to new middle place could not be added due to conflict with an existing arc');
        };
        const innerArcOne : Arc = innerArcOneAdded[2];
        const innerArcTwoAdded : [boolean, number, Arc] = inOutGraph.addArc(newPlace, newPlay, cutArcsWeight);
        if (!(innerArcTwoAdded[0])) {
            throw new Error('#srv.mnr.esc.004: ' + 'sequence cut execution failed - arc from new middle place to new end node could not be added due to conflict with an existing arc');
        };
        const innerArcTwo : Arc = innerArcTwoAdded[2];
        inOutGraph.setElementMarkedFlag(innerArcOne, true);
        inOutGraph.setElementMarkedFlag(innerArcTwo, true);
        inOutGraph.setElementChangedFlag(innerArcOne, true);
        inOutGraph.setElementChangedFlag(innerArcTwo, true);
        let topTauCase : boolean = false;
        let botTauCase : boolean = false;
        let topTauArc : Arc | undefined = undefined;
        let botTauArc : Arc | undefined = undefined;
        let topTauTarget : Node | undefined = undefined;
        let botTauSource : Node | undefined = undefined;
        let topTauBranch : [Arc, Node, Arc] | undefined = undefined;
        let botTauBranch : [Arc, Node, Arc] | undefined = undefined;
        for (const arc of inCutArcs) {
            const outerArcsAdded : [boolean, Arc, boolean, Arc] = this.replaceAndAddArc(inOutGraph, arc, arc.source, newStop, newPlay, arc.target);
            if (outerArcsAdded[0]) {
                if (outerArcsAdded[1].source === inSplitDfg.startNode) {
                    topTauTarget = arc.target;
                    topTauCase = true;
                    topTauArc = outerArcsAdded[1];
                } else {
                    inTopSubgraph[1].push(outerArcsAdded[1]);
                };
            };
            if (outerArcsAdded[2]) {
                if (outerArcsAdded[3].target === inSplitDfg.endNode) {
                    botTauSource = arc.source;
                    botTauCase = true;
                    botTauArc = outerArcsAdded[3];
                } else {
                    inBotSubgraph[1].push(outerArcsAdded[3]);
                };
            };
        };
        if (topTauCase && botTauCase) {
            throw new Error('#srv.mnr.esc.005: ' + 'sequence cut execution failed - top and bottom split both contain tau case');
        };
        if (topTauCase) {
            if (topTauArc !== undefined) {
                topTauBranch = this.replaceArcInsertNode(inOutGraph, topTauArc, topTauArc.source, topTauArc.target, 'support', 'tau');
                inTopSubgraph[1].push(topTauBranch[0]);
                inTopSubgraph[0].push(topTauBranch[1]);
                inTopSubgraph[1].push(topTauBranch[2]);
            } else {
                throw new Error('#srv.mnr.esc.006: ' + 'sequence cut execution failed - top split contains tau case, but tau arc returns undefined');
            };
        };
        if (botTauCase) {
            if (botTauArc !== undefined) {
                botTauBranch = this.replaceArcInsertNode(inOutGraph, botTauArc, botTauArc.source, botTauArc.target, 'support', 'tau');
                inBotSubgraph[1].push(botTauBranch[0]);
                inBotSubgraph[0].push(botTauBranch[1]);
                inBotSubgraph[1].push(botTauBranch[2]);
            } else {
                throw new Error('#srv.mnr.esc.007: ' + 'sequence cut execution failed - bottom split contains tau case, but tau arc returns undefined');
            };
        };
        /* splitting the dfg event log between the cut part and the rest part */
        const topSubLog : Node[][] = [];
        const botSubLog : Node[][] = [];
        if (inTopMarked) {
            let topTauCount : number = 0;
            let botTauCount : number = 0;
            for (const trace of inSplitDfg.log) {
                const topTrace : Node[] = [];
                const botTrace : Node[] = [];
                botTrace.push(newPlay);
                for (let eventIdx = 0; eventIdx < trace.length; eventIdx++) {
                    if (trace[eventIdx].marked) {
                        topTrace.push(trace[eventIdx]);
                    } else {
                        botTrace.push(trace[eventIdx]);
                    };
                };
                topTrace.push(newStop);
                if (topTrace.length > 2) {
                    topSubLog.push(topTrace);
                } else if (topTrace.length === 2) {
                    topTauCount++;
                    if (topTauCase) {
                        if (topTauBranch !== undefined) {
                            topTrace.splice(1, 0, topTauBranch[1]);
                            topSubLog.push(topTrace);
                        } else {
                            throw new Error('#srv.mnr.esc.008: ' + 'sequence cut execution failed - top tau case was detected, but top tau branch returns undefined');
                        };
                    } else {
                        throw new Error('#srv.mnr.esc.009: ' + 'sequence cut execution failed - splitting trace from old dfg lead to a subtrace for the top subgraph containing 2 nodes, but no top tau case was detected');
                    };
                } else {
                    throw new Error('#srv.mnr.esc.010: ' + 'sequence cut execution failed - splitting trace from old dfg lead to a subtrace for the top subgraph containing less than 2 nodes');
                };
                if (botTrace.length > 2) {
                    botSubLog.push(botTrace);
                } else if (botTrace.length === 2) {
                    botTauCount++;
                    if (botTauCase) {
                        if (botTauBranch !== undefined) {
                            botTrace.splice(1, 0, botTauBranch[1]);
                            botSubLog.push(botTrace);
                        } else {
                            throw new Error('#srv.mnr.esc.011: ' + 'sequence cut execution failed - bottom tau case was detected, but bottom tau branch returns undefined');
                        };
                    } else {
                        throw new Error('#srv.mnr.esc.012: ' + 'sequence cut execution failed - splitting trace from old dfg lead to a subtrace for the bottom subgraph containing 2 nodes, but no bottom tau case was detected');
                    };
                } else {
                    throw new Error('#srv.mnr.esc.013: ' + 'sequence cut execution failed - splitting trace from old dfg lead to a subtrace for the bottom subgraph containing less than 2 nodes');
                };
            };
            if (topTauCase) {
                if (topTauArc !== undefined) {
                    if (topTauCount !== topTauArc.weight) {
                        throw new Error('#srv.mnr.esc.014: ' + 'sequence cut execution failed - splitting the log of the old dfg ' + topTauCount + ' tau cases were found within the top split, while the detected top tau arc had a weight of ' + topTauArc.weight);
                    };
                };
            };
            if (botTauCase) {
                if (botTauArc !== undefined) {
                    if (botTauCount !== botTauArc.weight) {
                        throw new Error('#srv.mnr.esc.015: ' + 'sequence cut execution failed - splitting the log of the old dfg ' + botTauCount + ' tau cases were found within the bottom split, while the detected bottom tau arc had a weight of ' + botTauArc.weight);
                    };
                };
            };
        } else {
            let topTauCount : number = 0;
            let botTauCount : number = 0;
            for (const trace of inSplitDfg.log) {
                const topTrace : Node[] = [];
                const botTrace : Node[] = [];
                botTrace.push(newPlay);
                for (let eventIdx = 0; eventIdx < trace.length; eventIdx++) {
                    if (trace[eventIdx].marked) {
                        botTrace.push(trace[eventIdx]);
                    } else {
                        topTrace.push(trace[eventIdx]);
                    };
                };
                topTrace.push(newStop);
                if (topTrace.length > 2) {
                    topSubLog.push(topTrace);
                } else if (topTrace.length === 2) {
                    topTauCount++;
                    if (topTauCase) {
                        if (topTauBranch !== undefined) {
                            topTrace.splice(1, 0, topTauBranch[1]);
                            topSubLog.push(topTrace);
                        } else {
                            throw new Error('#srv.mnr.esc.016: ' + 'sequence cut execution failed - top tau case was detected, but top tau branch returns undefined');
                        };
                    } else {
                        throw new Error('#srv.mnr.esc.017: ' + 'sequence cut execution failed - splitting trace from old dfg lead to a subtrace for the top subgraph containing 2 nodes, but no top tau case was detected');
                    };
                } else {
                    throw new Error('#srv.mnr.esc.018: ' + 'sequence cut execution failed - splitting trace from old dfg lead to a subtrace for the top subgraph containing less than 2 nodes');
                };
                if (botTrace.length > 2) {
                    botSubLog.push(botTrace);
                } else if (botTrace.length === 2) {
                    botTauCount++;
                    if (botTauCase) {
                        if (botTauBranch !== undefined) {
                            botTrace.splice(1, 0, botTauBranch[1]);
                            botSubLog.push(botTrace);
                        } else {
                            throw new Error('#srv.mnr.esc.019: ' + 'sequence cut execution failed - bottom tau case was detected, but bottom tau branch returns undefined');
                        };
                    } else {
                        throw new Error('#srv.mnr.esc.020: ' + 'sequence cut execution failed - splitting trace from old dfg lead to a subtrace for the bottom subgraph containing 2 nodes, but no bottom tau case was detected');
                    };
                } else {
                    throw new Error('#srv.mnr.esc.021: ' + 'sequence cut execution failed - splitting trace from old dfg lead to a subtrace for the bottom subgraph containing less than 2 nodes');
                };
            };
            if (topTauCase) {
                if (topTauArc !== undefined) {
                    if (topTauCount !== topTauArc.weight) {
                        throw new Error('#srv.mnr.esc.022: ' + 'sequence cut execution failed - splitting the log of the old dfg ' + topTauCount + ' tau cases were found within the top split, while the detected top tau arc had a weight of ' + topTauArc.weight);
                    };
                };
            };
            if (botTauCase) {
                if (botTauArc !== undefined) {
                    if (botTauCount !== botTauArc.weight) {
                        throw new Error('#srv.mnr.esc.023: ' + 'sequence cut execution failed - splitting the log of the old dfg ' + botTauCount + ' tau cases were found within the bottom split, while the detected bottom tau arc had a weight of ' + botTauArc.weight);
                    };
                };
            };
        };
        /* updating the graph event log */
        for (const trace of inOutGraph.logArray) {
            for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                for (const arc of inCutArcs) {
                    if (trace[evIdx] === arc.source) {
                        if (trace[evIdx + 1] === arc.target) {
                            trace.splice((evIdx + 1), 0, newStop, newPlace, newPlay);
                            if (topTauCase) {
                                if (topTauBranch !== undefined) {
                                    if ((arc.source === inSplitDfg.startNode) && (arc.target === topTauTarget)) {
                                        trace.splice((evIdx + 1), 0, topTauBranch[1]);
                                        evIdx = (evIdx + 1);
                                    };
                                } else {
                                    throw new Error('#srv.mnr.esc.024: ' + 'sequence cut execution failed - top tau case was detected, but top tau branch returns undefined');
                                };
                            } else if (botTauCase) {
                                if (botTauBranch !== undefined) {
                                    if ((arc.source === botTauSource) && (arc.target === inSplitDfg.endNode)) {
                                        trace.splice((evIdx + 4), 0, botTauBranch[1]);
                                        evIdx = (evIdx + 1);
                                    };
                                }else {
                                    throw new Error('#srv.mnr.esc.025: ' + 'sequence cut execution failed - bottom tau case was detected, but bottom tau branch returns undefined');
                                };
                            };
                            evIdx = (evIdx + 3);
                        };
                    };
                };
            };
        };
        /* deciding which of the subgraphs to cut out as a new dfg, and which to keep as the rest of the old dfg, then updating dfgs accordingly */
        if (inTopMarked) {
            inSplitDfg.update(botSubgraphPlay, botSubgraphStop, inBotSubgraph[0], inBotSubgraph[1], botSubLog);
            inOutGraph.appendDFG(topSubgraphPlay, topSubgraphStop, inTopSubgraph[0], inTopSubgraph[1], topSubLog);
        } else {
            inSplitDfg.update(topSubgraphPlay, topSubgraphStop, inTopSubgraph[0], inTopSubgraph[1], topSubLog);
            inOutGraph.appendDFG(botSubgraphPlay, botSubgraphStop, inBotSubgraph[0], inBotSubgraph[1], botSubLog);
        };
    };

    private executeParallelCut(
        inOutGraph : Graph,
        inSplitDFG : DFG,
        inMarkedSubgraph : [Node[], Arc[]],
        inUnmarkedSubgraph : [Node[], Arc[]],
        inEndPointsMarked : boolean,
        inCutStartArc : Arc,
        inCutEndArc : Arc
    ) : void {
        /* deciding which of the subgraphs to cut out as a new dfg, and which to keep as the rest of the old dfg */
        /* checking if the cut DFG starts at the global start of the graph or ends at the global end */
        /* generating new start and end nodes and matching arcs */
        /* splitting the dfg event log between the cut part and the rest part */
        /* updating the graph event log */
        /* updating dfgs */
        /* deleting replaced endpoints and updating references */
    };

    private executeLoopCut(
        inOutGraph : Graph
    ) : void {
        /* deciding which of the subgraphs to cut out as a new dfg, and which to keep as the rest of the old dfg */
        /* checking if the cut DFG starts at the global start of the graph or ends at the global end */
        /* generating new start and end nodes and matching arcs */
        /* splitting the dfg event log between the cut part and the rest part */
        /* updating the graph event log */
        /* updating dfgs */
        /* deleting replaced endpoints and updating references */
    };

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
                        const middleNode : Node = this.replaceArcInsertNode(inOutGraph, inDfg.arcs[0], startNodes[2], endNodes[0], 'transition', '')[1];
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

    private checkReachableNodes(
        inDfg : DFG, 
        inSourceNode : Node
    ) : {
        [nodeID : number] : boolean
    } {
        const nodesToCheck : Node[] = [inSourceNode];
        let reached : number = 0;
        let reachable : {
            [nodeID : number] : boolean
        } = {
            [inSourceNode.id] : false
        };
        while (nodesToCheck.length > 0) {
            const checkedNode : Node | undefined = nodesToCheck.pop();
            if (checkedNode !== undefined) {
                for (const arc of inDfg.arcs) {
                    if (arc.source === checkedNode) {
                        if (reachable[arc.target.id] === undefined) {
                            nodesToCheck.push(arc.target);
                            reachable[arc.target.id] = true;
                            reached++;
                        } else if (reachable[arc.target.id] === false) {
                            reachable[arc.target.id] === true;
                            reached++;
                        };
                    };
                };
            } else {
                throw new Error('#srv.mnr.cfp.000: ' + 'path check failed - impossible error');
            };
        };
        return reachable;
    };

    /**
     * Check whether graph is beeing connected using deepsearch
     * @param inOutGraph
     * @param useMarkedNodes decide whether marked nodes are beeing analyzed or unmarked nodes
     * @private
     */
    private areNodesConnected(
        inOutGraph: Graph, 
        useMarkedNodes: boolean
    ) : boolean {
        /* check whether nodes to be checked are marked or unmarked */
        const nodesToCheck = useMarkedNodes ? inOutGraph.markedNodes : inOutGraph.unmarkedNodes
        if (nodesToCheck.length === 0){
            return false
        }
        const visited = new Set<Node>()
        /* start with random marked or unmarked node */
        const stack = [nodesToCheck[0]]
        while (stack.length > 0){
            const currentNode = stack.pop()
            if(!currentNode) continue
            visited.add(currentNode)
            /* expand stack whenever we find a connecting arc to marked or unmarked node */
            /* using outgoing arcs */
            for (const arc of inOutGraph.arcs){
                if(arc.source === currentNode
                    && ((useMarkedNodes && arc.target.marked) || (!useMarkedNodes && !arc.target.marked))
                    && !visited.has(arc.target)){
                    stack.push(arc.target)
                }
            }
            /* using incoming arcs */
            for (const arc of inOutGraph.arcs){
                if (arc.target === currentNode
                    && ((useMarkedNodes && arc.source.marked) || (!useMarkedNodes && !arc.source.marked))
                    && !visited.has(arc.source)){
                    stack.push(arc.source)
                }
            }
        }
        /* check whether all marked or unmarked nodes have been visited */
        return nodesToCheck.every(node => visited.has(node))
    };

    /**
     * Method filters arcs that are only used between marked nodes and
     * arc that are only used beetwen unmarked nodes
     * @param inOutGraph
     * @private
     */
    private adjustArcsForConnectivity(
        inOutGraph: Graph
    ) : [
        Arc[], 
        Arc[]
    ] {
        /* set of marked and unmarked nodes */
        const markedNodes = new Set(inOutGraph.markedNodes)
        const unmarkedNodes = new Set(inOutGraph.unmarkedNodes)
        /* filter arcs for marked nodes */
        const markedArcs = inOutGraph.arcs.filter(arc =>
            markedNodes.has(arc.source) && markedNodes.has(arc.target))
        /* filter arcs for unmarked nodes */
        const unmarkedArcs = inOutGraph.arcs.filter(arc =>
            unmarkedNodes.has(arc.source) && unmarkedNodes.has(arc.target))
        for (const arc of inOutGraph.arcs){
            if(!markedArcs.includes(arc) && !unmarkedArcs.includes(arc)){
                // inOutGraph.deleteArc(arc)
            }
        }
        return [markedArcs, unmarkedArcs]
    };

    private checkEndpointsEC(
        inDfg : DFG
    ) : boolean | undefined {
        if (inDfg.startNode.marked) {
            if (inDfg.endNode.marked) {
                return true;
            } else {
                return undefined;
            };
        } else {
            if (inDfg.endNode.marked) {
                return undefined;
            } else {
                return false;
            };
        };
    };

    private checkEndpointsSC(
        inDfg : DFG, 
        inCutsStartOnMarked : boolean
    ) : boolean | undefined {
        if (inCutsStartOnMarked) {
            if (!(inDfg.startNode.marked)) {
                return undefined;
            };
            if (inDfg.endNode.marked) {
                return undefined;
            };
        } else {
            if (inDfg.startNode.marked) {
                return undefined;
            };
            if (!(inDfg.endNode.marked)) {
                return undefined;
            };
        };
        return true;
    };

    private checkCutArcsEC(
        inGraph : Graph, 
        inDfg : DFG
    ) : [
        Arc, 
        Arc
    ] | undefined {
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

    private splitArcsEC(
        inDfg : DFG
    ) : [
        Arc[], 
        Arc[]
    ] | undefined {
        const arcSplitMarked : Arc[] = [];
        const arcSplitUnmarked : Arc[] = [];
        for (const arc of inDfg.arcs) {
            if (arc.marked) {
                if (arc.source.marked) {
                    if (arc.target.marked) {
                        return undefined;
                    } else {
                        /* arc is cut --> skip arc */
                    };
                } else {
                    if (arc.target.marked) {
                        /* arc is cut --> skip arc */
                    } else {
                        return undefined;
                    };
                };
            } else {
                if (arc.source.marked) {
                    if (arc.target.marked) {
                        arcSplitMarked.push(arc);
                    } else {
                        return undefined;
                    };
                } else {
                    if (arc.target.marked) {
                        return undefined;
                    } else {
                        arcSplitUnmarked.push(arc);
                    };
                };
            };
        };
        return [arcSplitMarked, arcSplitUnmarked];
    };

    private splitArcsSC(
        inDfg : DFG, 
        inCutsStartOnMarked : boolean
    ) : [
        Arc[], 
        Arc[], 
        Arc[]
    ] | undefined {
        const cutArcs : Arc[] = [];
        const arcsBetweenMarked : Arc[] = [];
        const arcsBetweenUnmarked : Arc[] = [];
        if (inCutsStartOnMarked) {
            for (const arc of inDfg.arcs) {
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
                        if (arc.target.marked) {
                            arcsBetweenMarked.push(arc);
                        } else {
                            return undefined;
                        };
                    } else {
                        if (arc.target.marked) {
                            return undefined;
                        }else {
                            arcsBetweenUnmarked.push(arc);
                        };
                    };
                };
            };
            return [cutArcs, arcsBetweenMarked, arcsBetweenUnmarked];
        } else {
            for (const arc of inDfg.arcs) {
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
                        if (arc.target.marked) {
                            arcsBetweenMarked.push(arc);
                        } else {
                            return undefined;
                        };
                    } else {
                        if (arc.target.marked) {
                            return undefined;
                        }else {
                            arcsBetweenUnmarked.push(arc);
                        };
                    };
                };
            };
            return [cutArcs, arcsBetweenUnmarked, arcsBetweenMarked];
        };
    };

    private splitNodesEC(
        inDfg : DFG
    ) : [
        Node[], 
        Node[]
    ] | undefined {
        const nodeSplitMarked : Node[] = [];
        const nodeSplitUnmarked : Node[] = [];
        for (const node of inDfg.nodes) {
            if (node !== inDfg.startNode) {
                if (node !== inDfg.endNode) {
                    if (node.marked) {
                        nodeSplitMarked.push(node);
                    } else {
                        nodeSplitUnmarked.push(node);
                    };
                } else {
                    /* skip node */
                };
            } else {
                /* skip node */
            };
        };
        if (nodeSplitMarked.length < 1) {
            return undefined;
        };
        if (nodeSplitUnmarked.length < 1) {
            return undefined;
        };
        return [nodeSplitMarked, nodeSplitUnmarked];
    };

    private splitNodesSC(
        inDfg : DFG, 
        inTopMarked : boolean
    ) : [
        Node[], 
        Node[]
    ] | undefined {
        const nodeSplitTop : Node[] = [];
        const nodeSplitBottom : Node[] = [];
        if (inTopMarked) {
            for (const node of inDfg.nodes) {
                if (node.marked) {
                    nodeSplitTop.push(node);
                } else {
                    nodeSplitBottom.push(node);
                };
            };
        } else {
            for (const node of inDfg.nodes) {
                if (node.marked) {
                    nodeSplitBottom.push(node);
                } else {
                    nodeSplitTop.push(node);
                };
            };
        };
        if (nodeSplitTop.length < 2) {
            return undefined;
        };
        if (nodeSplitBottom.length < 2) {
            return undefined;
        };
        for (const topNode of nodeSplitTop) {
            const reachable : {[nodeID : number] : boolean} = this.checkReachableNodes(inDfg, topNode);
            for (const botNode of nodeSplitBottom) {
                if (reachable[botNode.id] !== true) {
                    return undefined;
                };
            };
        };
        for (const botNode of nodeSplitBottom) {
            const reachable : {[nodeID : number] : boolean} = this.checkReachableNodes(inDfg, botNode);
            for (const topNode of nodeSplitTop) {
                if (reachable[topNode.id] === true) {
                    return undefined;
                };
            };
        };
        return [nodeSplitTop, nodeSplitBottom];
    };

    private replaceArc(
        inOutGraph : Graph, 
        inReplacedArc : Arc, 
        inNewArcSourceNode : Node, 
        inNewArcTargetNode : Node
    ) : Arc {
        const arcAdded : [boolean, number, Arc] = inOutGraph.addArc(inNewArcSourceNode, inNewArcTargetNode, inReplacedArc.weight);
        if (!(arcAdded[0])) {
            throw new Error('#srv.mnr.rpa.000: ' + 'replacing cut arc failed - new arc could not be added due to conflict with an existing arc');
        };
        const newArc : Arc = arcAdded[2];
        if (!(inOutGraph.deleteArc(inReplacedArc))) {
            throw new Error('#srv.mnr.rpa.001: ' + 'replacing cut arc failed - deletion of replaced arc failed');
        };
        if (inReplacedArc.marked) {
            inOutGraph.setElementMarkedFlag(newArc, true);
        };
        inOutGraph.setElementChangedFlag(newArc, true);
        return newArc;
    };

    private replaceAndAddArc(
        inOutGraph : Graph, 
        inReplacedArc : Arc, 
        inNewArcOneSourceNode : Node, 
        inNewArcOneTargetNode : Node, 
        inNewArcTwoSourceNode : Node, 
        inNewArcTwoTargetNode : Node
    ) : [
        boolean, 
        Arc, 
        boolean, 
        Arc
    ] {
        const arcOneAdded : [boolean, number, Arc] = inOutGraph.addArc(inNewArcOneSourceNode, inNewArcOneTargetNode, inReplacedArc.weight);
        const newArcOne : Arc = arcOneAdded[2];
        const arcTwoAdded : [boolean, number, Arc] = inOutGraph.addArc(inNewArcTwoSourceNode, inNewArcTwoTargetNode, inReplacedArc.weight);
        const newArcTwo : Arc = arcTwoAdded[2];
        if (!(inOutGraph.deleteArc(inReplacedArc))) {
            throw new Error('#srv.mnr.raa.002: ' + 'replacing cut arc failed - deletion of replaced arc failed');
        };
        if (inReplacedArc.marked) {
            inOutGraph.setElementMarkedFlag(newArcOne, true);
            inOutGraph.setElementMarkedFlag(newArcTwo, true);
        };
        inOutGraph.setElementChangedFlag(newArcOne, true);
        inOutGraph.setElementChangedFlag(newArcTwo, true);
        return [arcOneAdded[0], newArcOne, arcTwoAdded[0], newArcTwo];
    };

    private replaceArcInsertNode(
        inOutGraph : Graph, 
        inReplacedArc : Arc, 
        inNewBranchSourceNode : Node, 
        inNewBranchTargetNode : Node, 
        inNewNodeType : 'support' | 'place' | 'transition', 
        inNewNodeLabel : string
    ) : [
        Arc, 
        Node, 
        Arc
    ] {
        const placeX : number = (inNewBranchSourceNode.x + Math.ceil((inNewBranchTargetNode.x - inNewBranchSourceNode.x) / 2));
        const placeY : number = (inNewBranchSourceNode.y + Math.ceil((inNewBranchTargetNode.y - inNewBranchSourceNode.y) / 2));
        const placeAdded : [boolean, number, Node] = inOutGraph.addNode(inNewNodeType, inNewNodeLabel, placeX, placeY);
        if (!(placeAdded[0])) {
            throw new Error('#srv.mnr.rai.000: ' + 'replacing cut arc failed - new node could not be added due to conflict with an existing node');
        };
        const newArcPlace : Node = placeAdded[2];
        const arcOneAdded : [boolean, number, Arc] = inOutGraph.addArc(inNewBranchSourceNode, newArcPlace, inReplacedArc.weight);
        if (!(arcOneAdded[0])) {
            throw new Error('#srv.mnr.rai.001: ' + 'replacing cut arc failed - arc from branch source node to new node could not be added due to conflict with an existing arc');
        };
        const newArcOne : Arc = arcOneAdded[2];
        const arcTwoAdded : [boolean, number, Arc] = inOutGraph.addArc(newArcPlace, inNewBranchTargetNode, inReplacedArc.weight);
        if (!(arcTwoAdded[0])) {
            throw new Error('#srv.mnr.rai.002: ' + 'replacing cut arc failed - arc from new node to branch target node could not be added due to conflict with an existing arc');
        };
        const newArcTwo : Arc = arcTwoAdded[2];
        if (!(inOutGraph.deleteArc(inReplacedArc))) {
            throw new Error('#srv.mnr.rai.003: ' + 'replacing cut arc failed - deletion of replaced arc failed');
        };
        if (inReplacedArc.marked) {
            inOutGraph.setElementMarkedFlag(newArcOne, true);
            // inOutGraph.setElementMarkedFlag(newArcPlace, true);
            inOutGraph.setElementMarkedFlag(newArcTwo, true);
        };
        inOutGraph.setElementNewFlag(newArcOne, true);
        inOutGraph.setElementNewFlag(newArcPlace, true);
        inOutGraph.setElementNewFlag(newArcTwo, true);
        return [newArcOne, newArcPlace, newArcTwo];
    };

    private transformStart(
        inOutGraph : Graph, 
        inStartNode : Node, 
        inArcWeight : number
    ) : [
        Node, 
        Node, 
        Node
    ] {
        const startPlaceOneAdded : [boolean, number, Node] = inOutGraph.addNode('place', '', inStartNode.x, (inStartNode.y - Math.ceil(this._graphicsConfig.defaultNodeRadius / 2)));
        if (!(startPlaceOneAdded[0])) {
            throw new Error('#srv.mnr.tsn.000: ' + 'start node transformation failed - first start place could not be added due to conflict with existing node)');
        };
        const startPlaceOne : Node = startPlaceOneAdded[2];
        const startTransitionAdded : [boolean, number, Node] = inOutGraph.addNode('transition', inStartNode.label, inStartNode.x, inStartNode.y);
        if (!(startTransitionAdded[0])) {
            throw new Error('#srv.mnr.tsn.001: ' + 'start node transformation failed - start transition could not be added due to conflict with existing node)');
        };
        const startTransition : Node = startTransitionAdded[2];
        const startPlaceTwoAdded : [boolean, number, Node] = inOutGraph.addNode('place', '', inStartNode.x, (inStartNode.y + Math.ceil(this._graphicsConfig.defaultNodeRadius / 2)));
        if (!(startPlaceTwoAdded[0])) {
            throw new Error('#srv.mnr.tsn.002: ' + 'start node transformation failed - second start place could not be added due to conflict with existing node)');
        };
        const startPlaceTwo : Node = startPlaceTwoAdded[2];
        const startArcOneAdded : [boolean, number, Arc] = inOutGraph.addArc(startPlaceOne, startTransition, inArcWeight);
        if (!(startArcOneAdded[0])) {
            throw new Error('#srv.mnr.tsn.003: ' + 'start node transformation failed - arc from first start place to start transition could not be added due to conflict with an existing arc');
        };
        const startArcOne : Arc = startArcOneAdded[2];
        const startArcTwoAdded : [boolean, number, Arc] = inOutGraph.addArc(startTransition, startPlaceTwo, inArcWeight);
        if (!(startArcTwoAdded[0])) {
            throw new Error('#srv.mnr.tsn.004: ' + 'start node transformation failed - arc from start transition to second start place could not be added due to conflict with an existing arc');
        };
        const startArcTwo : Arc = startArcTwoAdded[2];
        if (inStartNode.marked) {
            inOutGraph.setElementMarkedFlag(startPlaceOne, true);
            // inOutGraph.setElementMarkedFlag(startArcOne, true);
            inOutGraph.setElementMarkedFlag(startTransition, true);
            // inOutGraph.setElementMarkedFlag(startArcTwo, true);
            inOutGraph.setElementMarkedFlag(startPlaceTwo, true);
        };
        inOutGraph.setElementNewFlag(startPlaceOne, true);
        inOutGraph.setElementNewFlag(startArcOne, true);
        inOutGraph.setElementChangedFlag(startTransition, true);
        inOutGraph.setElementNewFlag(startArcTwo, true);
        inOutGraph.setElementNewFlag(startPlaceTwo, true);
        startTransition.special = true;
        return [startPlaceOne, startTransition, startPlaceTwo]
    };

    private transformMid(
        inOutGraph : Graph, 
        inMidNode : Node
    ) : Node {
        if ((inMidNode.type === 'support') && (inMidNode.label === 'tau')) {
            const midTransitionAdded : [boolean, number, Node] = inOutGraph.addNode('transition', '', inMidNode.x, inMidNode.y);
            if (!(midTransitionAdded[0])) {
                throw new Error('#srv.mnr.tmn.001: ' + 'mid node transformation failed - mid transition could not be added due to conflict with existing node)');
            };
            const midTransition : Node = midTransitionAdded[2];
            if (inMidNode.marked) {
                inOutGraph.setElementMarkedFlag(midTransition, true);
            };
            inOutGraph.setElementChangedFlag(midTransition, true);
            midTransition.special = true;
            return midTransition;
        } else {
            const midTransitionAdded : [boolean, number, Node] = inOutGraph.addNode('transition', inMidNode.label, inMidNode.x, inMidNode.y);
            if (!(midTransitionAdded[0])) {
                throw new Error('#srv.mnr.tmn.001: ' + 'mid node transformation failed - mid transition could not be added due to conflict with existing node)');
            };
            const midTransition : Node = midTransitionAdded[2];
            if (inMidNode.marked) {
                inOutGraph.setElementMarkedFlag(midTransition, true);
            };
            inOutGraph.setElementChangedFlag(midTransition, true);
            return midTransition;
        };
    };

    private transformEnd(
        inOutGraph : Graph, 
        inEndNode : Node, 
        inArcWeight : number
    ) : [
        Node, 
        Node, 
        Node
    ] {
        const endPlaceOneAdded : [boolean, number, Node] = inOutGraph.addNode('place', '', inEndNode.x, (inEndNode.y - Math.ceil(this._graphicsConfig.defaultNodeRadius / 2)));
        if (!(endPlaceOneAdded[0])) {
            throw new Error('#srv.mnr.ten.000: ' + 'end node transformation failed - first end place could not be added due to conflict with existing node)');
        };
        const endPlaceOne : Node = endPlaceOneAdded[2];
        const endTransitionAdded : [boolean, number, Node] = inOutGraph.addNode('transition', inEndNode.label, inEndNode.x, inEndNode.y);
        if (!(endTransitionAdded[0])) {
            throw new Error('#srv.mnr.ten.001: ' + 'end node transformation failed - end transition could not be added due to conflict with existing node)');
        };
        const endTransition : Node = endTransitionAdded[2];
        const endPlaceTwoAdded : [boolean, number, Node] = inOutGraph.addNode('place', '', inEndNode.x, (inEndNode.y + Math.ceil(this._graphicsConfig.defaultNodeRadius / 2)));
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
            inOutGraph.setElementMarkedFlag(endPlaceOne, true);
            // inOutGraph.setElementMarkedFlag(endArcOne, true);
            inOutGraph.setElementMarkedFlag(endTransition, true);
            // inOutGraph.setElementMarkedFlag(endArcTwo, true);
            inOutGraph.setElementMarkedFlag(endPlaceTwo, true);
        };
        inOutGraph.setElementNewFlag(endPlaceOne, true);
        inOutGraph.setElementNewFlag(endArcOne, true);
        inOutGraph.setElementChangedFlag(endTransition, true);
        inOutGraph.setElementNewFlag(endArcTwo, true);
        inOutGraph.setElementNewFlag(endPlaceTwo, true);
        endTransition.special = true;
        return [endPlaceOne, endTransition, endPlaceTwo]
    };

    private transformStartEnd(
        inOutGraph : Graph, 
        inStartNode : Node, 
        inEndNode : Node, 
        inArc : Arc
    ) : [
        Node, 
        Node, 
        Node, 
        Node, 
        Node
    ] {
        const startY : number = (inStartNode.y - Math.ceil(this._graphicsConfig.defaultNodeRadius / 2));
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
        const endY : number = (inEndNode.y + Math.ceil(this._graphicsConfig.defaultNodeRadius / 2));
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
            inOutGraph.setElementMarkedFlag(startPlace, true);
            // inOutGraph.setElementMarkedFlag(startArc, true);
            inOutGraph.setElementMarkedFlag(startTransition, true);
        };
        if (inEndNode.marked) {
            inOutGraph.setElementMarkedFlag(endTransition, true);
            // inOutGraph.setElementMarkedFlag(endArc, true);
            inOutGraph.setElementMarkedFlag(endPlace, true);
        };
        if (inArc.marked) {
            inOutGraph.setElementMarkedFlag(midArcOne, true);
            // inOutGraph.setElementMarkedFlag(midPlace, true);
            inOutGraph.setElementMarkedFlag(midArcTwo, true);
        };
        inOutGraph.setElementNewFlag(startPlace, true);
        inOutGraph.setElementNewFlag(startArc, true);
        inOutGraph.setElementChangedFlag(startTransition, true);
        inOutGraph.setElementChangedFlag(midArcOne, true);
        inOutGraph.setElementNewFlag(midPlace, true);
        inOutGraph.setElementChangedFlag(midArcTwo, true);
        inOutGraph.setElementChangedFlag(endTransition, true);
        inOutGraph.setElementNewFlag(endArc, true);
        inOutGraph.setElementNewFlag(endPlace, true);
        startTransition.special = true;
        endTransition.special = true;
        return [startPlace, startTransition, midPlace, endTransition, endPlace];
    };

};
