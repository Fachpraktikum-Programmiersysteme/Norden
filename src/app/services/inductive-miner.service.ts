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
            const checkSC : [boolean, undefined | []] = this.checkSequenceCut(inOutGraph);
            inputAccepted = checkSC[0];
            if (inputAccepted) {
                /* TODO - part to be modified - start */
                this._toastService.showToast('input accepted as SC, 3s until execution', 'success');
                await new Promise(resolve => setTimeout(resolve, 3000));
                /* TODO - part to be modified - end */
                if (checkSC[1] !== undefined) {
                    this.executeSequenceCut(inOutGraph);
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

    private autoCheckBaseCase(inOutGraph : Graph) : number {
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
            if (arc.marked) {
                if (arc.source.marked) {
                    if (arc.target.marked) {
                        /* to be removed - start */
                        console.log('cut rejected on check 7');
                        /* to be removed - end */
                        return [false, undefined];
                    } else {
                        /* arc is cut --> skip arc */
                    };
                } else {
                    if (arc.target.marked) {
                        /* arc is cut --> skip arc */
                    } else {
                        /* to be removed - start */
                        console.log('cut rejected on check 8');
                        /* to be removed - end */
                        return [false, undefined];
                    };
                };
            } else {
                if (arc.source.marked) {
                    if (arc.target.marked) {
                        splitM[1].push(arc);
                    } else {
                        /* to be removed - start */
                        console.log('cut rejected on check 9');
                        /* to be removed - end */
                        return [false, undefined];
                    };
                } else {
                    if (arc.target.marked) {
                        /* to be removed - start */
                        console.log('cut rejected on check 10');
                        /* to be removed - end */
                        return [false, undefined];
                    } else {
                        splitU[1].push(arc);
                    };
                };
            };
        };
        for (const node of dfg.nodes) {
            if (node !== dfg.startNode) {
                if (node !== dfg.endNode) {
                    if (node.marked) {
                        splitM[0].push(node);
                    } else {
                        splitU[0].push(node);
                    };
                } else {
                    /* skip node */
                };
            } else {
                /* skip node */
            };
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
        console.log('found exclusive cut');
        /* to be removed - end */
        return [true, [dfg, splitM, splitU, endpointsMarked, cutArcs[0], cutArcs[1]]];
    };

    private checkSequenceCut(
        inOutGraph : Graph
    ) : [
        boolean,
        undefined | []
    ] {
        return [false, undefined];
    };

    private checkParallelCut(
        inOutGraph : Graph
    ) : [
        boolean,
        undefined | [DFG, [Node[], Arc[]], [Node[], Arc[]], boolean, Arc, Arc]
    ] {
        /* to be removed - start */
        console.log('im_service started check of parallel cut');
        console.error(' im_service started check of parallel cut')
        /* to be removed - end */
        /*Prüfe, ob genau zwei Kanten im Graph markiert;*/
        /*Wenn nicht, Schnitt abgelehnt*/
        if (inOutGraph.markedArcs.length !== 2) {
            /* to be removed - start */
            console.log('cut rejected on check 1');
            /* to be removed - end */
            //return [false, undefined];
        }
        /*Prüfe, ob alle markierten kanten und knoten zu selben DFG gehören;*/
        /*Wenn nicht, Schnitt abgelehnt*/
        let cutDFG : number | undefined = this.checkMarkedDFG(inOutGraph);
        if (cutDFG === undefined) {
            /* to be removed - start */
            console.log('cut rejected on check 2');
            /* to be removed - end */
            return [false, undefined];
        }
        /*Position des identifizierten DFG finden*/
        /*Wenn Position nicht gefunden, Schnitt abgelehnt*/
        const dfgPos : number | undefined = this.checkDfgPosition(inOutGraph, cutDFG);
        if (dfgPos === undefined) {
            /* to be removed - start */
            console.log('cut rejected on check 3');
            /* to be removed - end */
            return [false, undefined];
        }
        /*Prüfe, ob beide markierten kanten Anfangs- Endpunkt des DFG verbinden;*/
        /*Wenn nicht, Schnitt abgelehnt*/
        const dfg : DFG = inOutGraph.dfgArray[dfgPos];
        const cutArcs : [Arc, Arc] | undefined = this.checkCutArcsEC(inOutGraph, dfg);
        if (cutArcs === undefined) {
            /* to be removed - start */
            console.log('cut rejected on check 4');
            /* to be removed - end */
            return [false, undefined];
        }
        /*Prüfe, ob markierte Knoten Start und Endpunkt darstellen;*/
        /*Wenn nicht, Schnitt abgelehnt*/
        let endpointsMarked : boolean;
        if (dfg.startNode.marked) {
            if (dfg.endNode.marked) {
                endpointsMarked = true;
            } else {
                /* to be removed - start */
                console.log('cut rejected on check 5');
                /* to be removed - end */
               return [false, undefined];
            }
        } else {
            if (dfg.endNode.marked) {
                /* to be removed - start */
                console.log('cut rejected on check 6');
                /* to be removed - end */
                return [false, undefined];
            } else {
                endpointsMarked = false;
            }
        }
        /*Aufteilung in markierte und nicht markierte Knoten+Kanten */
        /*1. Loop über Kanten 2. Loop über Knoten*/
        let splitM : [Node[], Arc[]] = [[], []];
        let splitU : [Node[], Arc[]] = [[], []];
        for (const arc of dfg.arcs) {
            if (arc.marked) {
                if (arc.source.marked) {
                    if (arc.target.marked) {
                        /* to be removed - start */
                        console.log('cut rejected on check 7');
                        /* to be removed - end */
                      //  return [false, undefined];
                    } else {
                        /* arc is cut --> skip arc */
                    };
                } else {
                    if (arc.target.marked) {
                        /* arc is cut --> skip arc */
                    } else {
                        /* to be removed - start */
                        console.log('cut rejected on check 8');
                        /* to be removed - end */
                     //   return [false, undefined];
                    };
                };
            } else {
                if (arc.source.marked) {
                    if (arc.target.marked) {
                        splitM[1].push(arc);
                    } else {
                        /* to be removed - start */
                        //console.log('cut rejected on check 9');
                        /* to be removed - end */
                      //  return [false, undefined];
                    };
                } else {
                    if (arc.target.marked) {
                        /* to be removed - start */
                        // BEI PC ist dies der Fall. Gerade eine Bedingung
                       // console.log('cut rejected on check 10');
                        /* to be removed - end */
                      //  return [false, undefined];
                    } else {
                        //Knoten die an Kanten hängen, nicht markiert
                        splitU[1].push(arc);
                    };
                };
            };
        };
        let markedConnectedToUnmarked: boolean = false
        let unmarkedConnectedToMarked: boolean = false
        for (const node of dfg.nodes) {
            if (node !== dfg.startNode) {
                if (node !== dfg.endNode) {
                    if (node.marked) {
                        splitM[0].push(node);
                        /*Check, ob mit jeder Akti in A2 über Kante verbunden*/
                        for (const arc of dfg.arcs){
                            if (!arc.target.marked){
                                markedConnectedToUnmarked = true
                                console.error( node.label + ' Verbunden mit nich markiert')
                                break
                            }else{
                                markedConnectedToUnmarked = false
                            }
                        }
                    } else {
                        splitU[0].push(node);
                        /*Check, ob mit jeder Akti in A1 über Kante verbunden*/
                        for (const arc of dfg.arcs){
                            if (arc.target.marked){
                                markedConnectedToUnmarked = true
                                console.error(node.label + ' Verbunden mit markiert')
                                break
                            }else{
                                markedConnectedToUnmarked = false
                            }
                        }
                    };
                } else {
                    /* skip node */
                };
            } else {
                /* skip node */
            };
        };
        // Prüfen, ob die Menge der markierten bzw nicht markierten Knoten zusammenhängend
        //markiert
        if (!this.areNodesConnected(inOutGraph, true)){
            console.error('cut rejected due to graph not beeing connected');
        }else{
            console.error('all marked nodes are connected')
        }

        //unmarkiert
        if (!this.areNodesConnected(inOutGraph, false)){
            console.error('cut rejected due to graph not beeing connected');
        }else{
            console.error('all unmarked nodes are connected')
        }

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
        console.log('found exclusive cut');
        /* to be removed - end */
       // return [false, undefined];
        return [true, [dfg, splitM, splitU, endpointsMarked, cutArcs[0], cutArcs[1]]];
    };

    /**
     * Check whether graph is beeing connected using deepsearch
     * @param inOutGraph
     * @param useMarkedNodes decide whether marked nodes are beeing analyzed or unmarked nodes
     * @private
     */
    private areNodesConnected(inOutGraph: Graph, useMarkedNodes: boolean):boolean{
        //check whether nodes to be checked are marked or unmarked
        const nodesToCheck = useMarkedNodes ? inOutGraph.markedNodes : inOutGraph.unmarkedNodes
        if (nodesToCheck.length === 0){
            return false
        }

        const visited = new Set<Node>()

        //start with random marked or unmarked node
        const stack = [nodesToCheck[0]]
        while (stack.length > 0){
            const currentNode = stack.pop()
            if(!currentNode) continue

            visited.add(currentNode)

            //expand stack whenever we find a connecting arc to marked or unmarked node
            //using outgoing arcs
            for (const arc of inOutGraph.arcs){
                if(arc.source === currentNode
                    && ((useMarkedNodes && arc.target.marked) || (!useMarkedNodes && !arc.target.marked))
                    && !visited.has(arc.target)){
                    stack.push(arc.target)
                }
            }
            //using incoming arcs
            for (const arc of inOutGraph.arcs){
                if (arc.target === currentNode
                    && ((useMarkedNodes && arc.source.marked) || (!useMarkedNodes && !arc.source.marked))
                    && !visited.has(arc.source)){
                    stack.push(arc.source)
                }
            }
        }
        //check whether all marked or unmarked nodes have been visited
        return nodesToCheck.every(node => visited.has(node))
    }

    private adjustArcsForConnectivity(inOutGraph: Graph):[Arc[],Arc[]]{
        //set of marked and unmarked nodes
        const markedNodes = new Set(inOutGraph.markedNodes)
        const unmarkedNodes = new Set(inOutGraph.unmarkedNodes)

        //filter arcs for marked nodes
        const markedArcs = inOutGraph.arcs.filter(arc =>
            markedNodes.has(arc.source) && markedNodes.has(arc.target))
        //filter arcs for unmarked nodes
        const unmarkedArcs = inOutGraph.arcs.filter(arc =>
            unmarkedNodes.has(arc.source) && unmarkedNodes.has(arc.target))
        for (const arc of inOutGraph.arcs){
            if(!markedArcs.includes(arc) && !unmarkedArcs.includes(arc)){
                //inOutGraph.deleteArc(arc)
            }
        }
        return [markedArcs, unmarkedArcs]
    }

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
            if (dfg.arcs.length !== 2) {
                /* to be removed - start */
                console.log('base case rejected on check 7');
                /* to be removed - end */
                return [false, undefined];
            };
            if (dfg.arcs[0].weight !== dfg.arcs[1].weight) {
                /* to be removed - start */
                console.log('base case rejected on check 8');
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
                throw new Error('#srv.mnr.cbc.006: ' + 'base case check failed - inconsitent dfg detected (middle node type is not \'event\')');
            };
            for (const arc of dfg.arcs) {
                if (arc.source === dfg.startNode) {
                    if (arc.target !== midNode) {
                        /* to be removed - start */
                        console.log('base case rejected on check 9');
                        /* to be removed - end */
                        return [false, undefined];
                    };
                } else if (arc.source === midNode) {
                    if (arc.target !== dfg.endNode) {
                        /* to be removed - start */
                        console.log('base case rejected on check 10');
                        /* to be removed - end */
                        return [false, undefined];
                    };
                } else {
                    /* to be removed - start */
                    console.log('base case rejected on check 11');
                    /* to be removed - end */
                    return [false, undefined];
                };
            };
            return [true, [dfg, midNode]];
        } else if (dfg.nodes.length === 2) {
            if (dfg.arcs.length !== 1) {
                /* to be removed - start */
                console.log('base case rejected on check 12');
                /* to be removed - end */
                return [false, undefined];
            };
            if (dfg.arcs[0].source !== dfg.startNode) {
                /* to be removed - start */
                console.log('base case rejected on check 13');
                /* to be removed - end */
                return [false, undefined];
            };
            if (dfg.arcs[0].target !== dfg.endNode) {
                /* to be removed - start */
                console.log('base case rejected on check 14');
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
        inSplitDFG : DFG,
        inMarkedSubgraph : [Node[], Arc[]],
        inUnmarkedSubgraph : [Node[], Arc[]],
        inEndPointsMarked : boolean,
        inCutStartArc : Arc,
        inCutEndArc : Arc
    ) : void {
        /* deciding which of the subgraphs to cut out as a new dfg, and which to keep as the rest of the old dfg */
        let cutSubgraph : [Node[], Arc[]];
        let restSubgraph : [Node[], Arc[]];
        if (inEndPointsMarked) {
            cutSubgraph = inUnmarkedSubgraph;
            restSubgraph = inMarkedSubgraph;
        } else {
            cutSubgraph = inMarkedSubgraph;
            restSubgraph = inUnmarkedSubgraph;
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
            if (arc.source === inSplitDFG.startNode) {
                uncutStartArcs.push(arc);
            } else if (arc.target === inSplitDFG.endNode) {
                uncutEndArcs.push(arc);
            } else {
                uncutMidArcs.push(arc);
            };
            if (arc.source === inSplitDFG.startNode) {
                uncutStartNodesX = uncutStartNodesX + arc.target.x;
                uncutStartNodesY = uncutStartNodesY + arc.target.y;
                uncutStartArcsWeight = uncutStartArcsWeight + arc.weight;
                uncutStartNodesCount++;
            };
            if (arc.target === inSplitDFG.endNode) {
                uncutEndNodesX = uncutEndNodesX + arc.source.x;
                uncutEndNodesY = uncutEndNodesY + arc.source.y;
                uncutEndArcsWeight = uncutEndArcsWeight + arc.weight;
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
            const globalPlayNodes : [Node, Node, Node] = this.transformStart(inOutGraph, inSplitDFG.startNode, startArcWeight);
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
            if (inEndPointsMarked) {
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
                if (arc.target === inSplitDFG.startNode) {
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
            restSubgraphPlay = inSplitDFG.startNode;
            cutSubgraphPlay = cutPlayAdded[2];
            restSubgraphPlay.coordinates = [restPlayX, restPlayY]
            if (!(inEndPointsMarked)) {
                inOutGraph.setElementMarkedFlag(cutSubgraphPlay, true);
            };
            inOutGraph.setElementChangedFlag(restSubgraphPlay, true);
            inOutGraph.setElementNewFlag(cutSubgraphPlay, true);
            incomingArc.weight = (incomingArc.weight - inCutStartArc.weight);
            if (incomingArc.weight < 1) {
                throw new Error('#srv.mnr.eec.007: ' + 'exclusive cut execution failed - the weight of only arc leading into the split dfg is not higher than the weight of the first cut arc within the split dfg');
            };
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
            const globalStopNodes : [Node, Node, Node] = this.transformEnd(inOutGraph, inSplitDFG.endNode, endArcWeight);
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
            if (inEndPointsMarked) {
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
                if (arc.source === inSplitDFG.endNode) {
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
            restSubgraphStop = inSplitDFG.endNode;
            cutSubgraphStop = cutStopAdded[2];
            restSubgraphStop.coordinates = [restStopX, restStopY]
            if (!(inEndPointsMarked)) {
                inOutGraph.setElementMarkedFlag(cutSubgraphStop, true);
            };
            inOutGraph.setElementChangedFlag(restSubgraphStop, true);
            inOutGraph.setElementNewFlag(cutSubgraphStop, true);
            outgoingArc.weight = (outgoingArc.weight - inCutEndArc.weight);
            if (outgoingArc.weight < 1) {
                throw new Error('#srv.mnr.eec.016: ' + 'exclusive cut execution failed - the weight of only arc coming from the split dfg is not higher than the weight of the last cut arc within the split dfg');
            };
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
        if (inEndPointsMarked) {
            for (const trace of inSplitDFG.log) {
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
            for (const trace of inSplitDFG.log) {
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
        if (inEndPointsMarked) {
            inSplitDFG.update(cutSubgraphPlay, cutSubgraphStop, cutSubgraph[0], cutSubgraph[1], cutSubLog);
            inOutGraph.appendDFG(restSubgraphPlay, restSubgraphStop, restSubgraph[0], restSubgraph[1], restSubLog);
        } else {
            inSplitDFG.update(restSubgraphPlay, restSubgraphStop, restSubgraph[0], restSubgraph[1], restSubLog);
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
        inOutGraph : Graph
    ) : void {

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
        
    };


    private executeLoopCut(
        inOutGraph : Graph
    ) : void {

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
    ) : Arc {
        const arcAdded : [boolean, number, Arc] = inOutGraph.addArc(inNewArcSourceNode, inNewArcTargetNode, inReplacedArc.weight);
        if (!(arcAdded[0])) {
            throw new Error('#srv.mnr.rpa.000: ' + 'replacing cut arc failed - new arc from source node to target node could not be added due to conflict with an existing arc');
        };
        const newArc : Arc = arcAdded[2];
        if (!(inOutGraph.deleteArc(inReplacedArc))) {
            throw new Error('#srv.mnr.rpa.001: ' + 'replacing cut arc failed - deletion of replaced arc failed');
        };
        if (inReplacedArc.marked) {
            inOutGraph.setElementMarkedFlag(newArc, true);
        };
        return newArc;
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
            inOutGraph.setElementMarkedFlag(newArcOne, true);
            inOutGraph.setElementMarkedFlag(newArcTwo, true);
            // inOutGraph.setElementMarkedFlag(newArcPlace, true);
        };
        return newArcPlace;
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
            inOutGraph.setElementMarkedFlag(startPlaceOne, true);
            inOutGraph.setElementMarkedFlag(startTransition, true);
            inOutGraph.setElementMarkedFlag(startPlaceTwo, true);
            // inOutGraph.setElementMarkedFlag(startArcOne, true);
            // inOutGraph.setElementMarkedFlag(startArcTwo, true);
        };
        inOutGraph.setElementNewFlag(startPlaceOne, true);
        inOutGraph.setElementChangedFlag(startTransition, true);
        inOutGraph.setElementNewFlag(startPlaceTwo, true);
        inOutGraph.setElementNewFlag(startArcOne, true);
        inOutGraph.setElementNewFlag(startArcTwo, true);
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
            inOutGraph.setElementMarkedFlag(midTransition, true);
        };
        inOutGraph.setElementChangedFlag(midTransition, true);
        return midTransition;
    };

    private transformEnd(
        inOutGraph : Graph,
        inEndNode : Node,
        inArcWeight : number
    ) : [Node, Node, Node] {
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
            inOutGraph.setElementMarkedFlag(endTransition, true);
            inOutGraph.setElementMarkedFlag(endPlaceTwo, true);
            // inOutGraph.setElementMarkedFlag(endArcOne, true);
            // inOutGraph.setElementMarkedFlag(endArcTwo, true);
        };
        inOutGraph.setElementNewFlag(endPlaceOne, true);
        inOutGraph.setElementChangedFlag(endTransition, true);
        inOutGraph.setElementNewFlag(endPlaceTwo, true);
        inOutGraph.setElementNewFlag(endArcOne, true);
        inOutGraph.setElementNewFlag(endArcTwo, true);
        return [endPlaceOne, endTransition, endPlaceTwo]
    };

    private transformStartEnd(
        inOutGraph : Graph,
        inStartNode : Node,
        inEndNode : Node,
        inArc : Arc
    ) : [Node, Node, Node, Node, Node] {
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
            inOutGraph.setElementMarkedFlag(startTransition, true);
            // inOutGraph.setElementMarkedFlag(startArc, true);
        };
        if (inEndNode.marked) {
            inOutGraph.setElementMarkedFlag(endTransition, true);
            inOutGraph.setElementMarkedFlag(endPlace, true);
            // inOutGraph.setElementMarkedFlag(endArc, true);
        };
        if (inArc.marked) {
            inOutGraph.setElementMarkedFlag(midArcOne, true);
            inOutGraph.setElementMarkedFlag(midArcTwo, true);
            // inOutGraph.setElementMarkedFlag(midPlace, true);
        };
        inOutGraph.setElementNewFlag(startPlace, true);
        inOutGraph.setElementChangedFlag(startTransition, true);
        inOutGraph.setElementNewFlag(midPlace, true);
        inOutGraph.setElementChangedFlag(endTransition, true);
        inOutGraph.setElementNewFlag(endPlace, true);
        inOutGraph.setElementNewFlag(startArc, true);
        inOutGraph.setElementChangedFlag(midArcOne, true);
        inOutGraph.setElementChangedFlag(midArcTwo, true);
        inOutGraph.setElementNewFlag(endArc, true);
        return [startPlace, startTransition, midPlace, endTransition, endPlace];
    };

};
