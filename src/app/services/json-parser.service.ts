import {Injectable} from '@angular/core';

import {Coords} from "../classes/file-management/coordinates";
import {JsonGraph} from '../classes/file-management/json-graph';

import {Graph} from '../classes/graph-representation/graph';
import {Node} from '../classes/graph-representation/node';
import {Arc} from '../classes/graph-representation/arc';

@Injectable({
    providedIn: 'root'
})
export class JsonParserService {

    /* attributes */

    private graph : Graph = new Graph;

    private nodeIds : {
        [jsonNodeId: string]: number
    } = {};

    private arcIds : {
        [jsonArcId: string]: number
    } = {};

    /* TODO - if the service works as intended, remove the following comments */
    // 
    // private dfgIds : {
    //     [jsonDfgId: string]: number
    // } = {};

    private unlabeledEvents : number = 0;
    private unlabeledTransitions : number = 0;

    /* methods : constructor */

    public constructor() {};

    /* methods : other */

    public parse(inJsonString : string): Graph {

        try {

            const jsonGraph = JSON.parse(inJsonString) as JsonGraph;

            this.initialize()

            /* TODO - if the service works as intended, remove the following comment */
            // this.parseDfgIds(jsonGraph);

            this.parseSupports(jsonGraph);
            this.parseEvents(jsonGraph);
            this.parsePlaces(jsonGraph);
            this.parseTransitions(jsonGraph);

            this.parseStartEnd(jsonGraph);

            this.parseArcs(jsonGraph);

            this.parseMarked(jsonGraph);

            this.parseDFGs(jsonGraph);

            this.parseLog(jsonGraph)

            return this.graph;

        } catch (error) {

            console.error('parsing of .json file failed : ', error);

        };

        return new Graph;

    };

    private initialize() : void {
        this.graph = new Graph;
        this.nodeIds = {};
        this.arcIds = {};
        /* TODO - if the service works as intended, remove the following comment */
        // this.dfgIds = {};
        this.unlabeledEvents = 0;
        this.unlabeledTransitions = 0;
    };

    private isCoords(inValue : Coords | Coords[]) : inValue is Coords {
        return true;
    };

    /* TODO - if the service works as intended, remove the following comments */
    // 
    // private parseDfgIds(inJsonGraph : JsonGraph) : void {
    //     if (inJsonGraph.dfgs !== undefined) {
    //         let dfgCount = 0;
    //         for (const dfg in inJsonGraph.dfgs[2]) {
    //             this.dfgIds[dfg] = dfgCount;
    //             dfgCount++;
    //         };
    //     };
    // };

    private parseSupports(inJsonGraph : JsonGraph) {
        if (inJsonGraph.supports !== undefined) {
            for (const support of inJsonGraph.supports) {
                const supportLabel = this.parseSupportLabel(inJsonGraph, support);
                const supportCoords : Coords | undefined = this.parseNodeCoords(inJsonGraph, support);
                /* TODO - if the service works as intended, remove the following comment */
                // const supportDFG : number | undefined = this.parseNodeDFG(inJsonGraph, support);
                const supportAdded : [boolean, number, Node] = this.graph.addNode('support', supportLabel, supportCoords?.x, supportCoords?.y);
                if (supportAdded[0]) {
                    this.nodeIds[support] = supportAdded[1];
                } else {
                    throw new Error('#srv.jps.pss.000: ' + 'parsing support node failed - node could not be added due to conflict with existing node');
                };
            };
        };
    };

    private parseEvents(inJsonGraph : JsonGraph) {
        if (inJsonGraph.events !== undefined) {
            for (const event of inJsonGraph.events) {
                const eventLabel = this.parseEventLabel(inJsonGraph, event);
                const eventCoords : Coords | undefined = this.parseNodeCoords(inJsonGraph, event);
                /* TODO - if the service works as intended, remove the following comment */
                // const eventDFG : number | undefined = this.parseNodeDFG(inJsonGraph, event);
                const eventAdded : [boolean, number, Node] = this.graph.addNode('event', eventLabel, eventCoords?.x, eventCoords?.y);
                this.nodeIds[event] = eventAdded[1];
                if (eventAdded[0]) {
                    this.nodeIds[event] = eventAdded[1];
                } else {
                    throw new Error('#srv.jps.pse.000: ' + 'parsing event node failed - node could not be added due to conflict with existing node');
                };
            };
        };
    };

    private parsePlaces(inJsonGraph : JsonGraph) {
        if (inJsonGraph.places !== undefined) {
            for (const place of inJsonGraph.places) {
                const placeLabel = this.parsePlaceLabel(inJsonGraph, place);
                const placeCoords : Coords | undefined = this.parseNodeCoords(inJsonGraph, place);
                /* TODO - if the service works as intended, remove the following comment */
                // const placeDFG : number | undefined = this.parseNodeDFG(inJsonGraph, place);
                const placeAdded : [boolean, number, Node] = this.graph.addNode('place', placeLabel, placeCoords?.x, placeCoords?.y);
                this.nodeIds[place] = placeAdded[1];
                if (placeAdded[0]) {
                    this.nodeIds[place] = placeAdded[1];
                } else {
                    throw new Error('#srv.jps.psp.000: ' + 'parsing place node failed - node could not be added due to conflict with existing node');
                };
            };
        };
    };

    private parseTransitions(inJsonGraph : JsonGraph) {
        if (inJsonGraph.transitions !== undefined) {
            for (const transition of inJsonGraph.transitions) {
                const transitionLabel = this.parseTransitionLabel(inJsonGraph, transition);
                const transitionCoords : Coords | undefined = this.parseNodeCoords(inJsonGraph, transition);
                /* TODO - if the service works as intended, remove the following comment */
                // const transitionDFG : number | undefined = this.parseNodeDFG(inJsonGraph, transition);
                const transitionAdded : [boolean, number, Node] = this.graph.addNode('transition', transitionLabel, transitionCoords?.x, transitionCoords?.y);
                this.nodeIds[transition] = transitionAdded[1];
                if (transitionAdded[0]) {
                    this.nodeIds[transition] = transitionAdded[1];
                } else {
                    throw new Error('#srv.jps.pst.000: ' + 'parsing transition node failed - node could not be added due to conflict with existing node');
                };
            };
        };
    };

    private parseSupportLabel(inJsonGraph : JsonGraph, inNodeId : string) : string {
        if (inJsonGraph.labels !== undefined) {
            if (inJsonGraph.labels[inNodeId] !== undefined) {
                return (inJsonGraph.labels[inNodeId]);
            } else {
                throw new Error('#srv.jps.psl.000: ' + 'parsing support label from .json file failed - label for support node (id "' + inNodeId + '" in .json) is undefined');
            };
        } else {
            throw new Error('#srv.jps.psl.001: ' + 'parsing support label from .json file failed - graph contains support nodes, but no labels');
        };
    };

    private parseEventLabel(inJsonGraph : JsonGraph, inNodeId : string) : string {
        if (inJsonGraph.labels !== undefined) {
            if (inJsonGraph.labels[inNodeId] !== undefined) {
                return (inJsonGraph.labels[inNodeId]);
            };
        };
        this.unlabeledEvents++
        return ('undefined_event_name__' + this.unlabeledEvents.toString());
    };

    private parsePlaceLabel(inJsonGraph : JsonGraph, inNodeId : string) : string {
        if (inJsonGraph.labels !== undefined) {
            if (inJsonGraph.labels[inNodeId] !== undefined) {
                return (inJsonGraph.labels[inNodeId]);
            };
        };
        return ('');
    };

    private parseTransitionLabel(inJsonGraph : JsonGraph, inNodeId : string) : string {
        if (inJsonGraph.labels !== undefined) {
            if (inJsonGraph.labels[inNodeId] !== undefined) {
                return (inJsonGraph.labels[inNodeId]);
            };
        };
        this.unlabeledTransitions++
        return ('undefined_transition_label__' + this.unlabeledTransitions.toString());
    };

    private parseNodeCoords(inJsonGraph : JsonGraph, inNodeId : string) : Coords | undefined {
        if (inJsonGraph.layout !== undefined) {
            if (inJsonGraph.layout[inNodeId] !== undefined) {
                if (this.isCoords(inJsonGraph.layout[inNodeId])) {
                    return (inJsonGraph.layout[inNodeId] as Coords);
                };
            };
        };
        return (undefined);
    };

    /* TODO - if the service works as intended, remove the following comments */
    // 
    // private parseNodeDFG(inJsonGraph : JsonGraph, inJsonNodeId : string) : number | undefined {
    //     if (inJsonGraph.dfgs !== undefined) {
    //         if (inJsonGraph.dfgs[0][inJsonNodeId] !== undefined) {
    //             return (this.dfgIds[inJsonGraph.dfgs[0][inJsonNodeId]]);
    //         } else {
    //             return (undefined);
    //         };
    //     } else {
    //         return (undefined);
    //     };
    // };

    private parseStartEnd(inJsonGraph : JsonGraph) : void {
        if (inJsonGraph.start !== undefined) {
            if (inJsonGraph.start !== '') {
                this.graph.startNode = this.graph.nodes[this.nodeIds[inJsonGraph.start]];
            };
        };
        if (inJsonGraph.end !== undefined) {
            if (inJsonGraph.end !== '') {
                this.graph.endNode = this.graph.nodes[this.nodeIds[inJsonGraph.end]];
            };
        };
    };

    private parseArcs(inJsonGraph : JsonGraph) : void {
        let arcId : number = 0;
        for (const arc in inJsonGraph.arcs) {
            const idPair : string[] = arc.split(',')
            const sourceNode : Node | undefined = this.graph.nodes[this.nodeIds[idPair[0]]];
            const targetNode : Node | undefined = this.graph.nodes[this.nodeIds[idPair[1]]];
            /* TODO - if the service works as intended, remove the following comment */
            // const dfg : number | undefined = this.parseArcDFG(inJsonGraph, arc);
            if (sourceNode !== undefined) {
                if (targetNode !== undefined) {
                    this.graph.addArc(sourceNode, targetNode, inJsonGraph.arcs[arc]);
                    this.arcIds[arc] = arcId;
                    arcId++;
                } else {
                    throw new Error('#srv.jps.pra.000: ' + 'parsing arcs from .json file failed - target node is undefined (node id in .json: "' + idPair[1] + '", node id in graph: "' + this.nodeIds[idPair[1]] + '")');
                };
            } else {
                throw new Error('#srv.jps.pra.000: ' + 'parsing arcs from .json file failed - source node is undefined (node id in .json: "' + idPair[0] + '", node id in graph: "' + this.nodeIds[idPair[0]] + '")');
            };
        };
    };

    /* TODO - if the service works as intended, remove the following comments */
    // 
    // private parseArcDFG(inJsonGraph : JsonGraph, inJsonArcId : string) : number | undefined {
    //     if (inJsonGraph.dfgs !== undefined) {
    //         if (inJsonGraph.dfgs[1][inJsonArcId] !== undefined) {
    //             return (this.dfgIds[inJsonGraph.dfgs[1][inJsonArcId]]);
    //         } else {
    //             return (undefined);
    //         };
    //     } else {
    //         return (undefined);
    //     };
    // };

    private parseMarked(inJsonGraph : JsonGraph) : void {
        if (inJsonGraph.marked !== undefined) {
            for (const nodeID in inJsonGraph.marked[0]) {
                const node : Node | undefined = this.graph.nodes[this.nodeIds[nodeID]]
                if (node !== undefined) {
                    this.graph.markedNodes.push(node);
                    node.marked = true;
                } else {
                    throw new Error('#srv.jps.prm.000: ' + 'parsing node from .json file failed - node in json (id "' + nodeID + '") is noted as marked, but the corresponding node in graph (id "' + this.nodeIds[nodeID] + '") is undefined');
                };
            };
            for (const arcID in inJsonGraph.marked[1]) {
                const arc : Arc = this.graph.arcs[this.arcIds[arcID]];
                this.graph.markedArcs.push(arc);
                arc.marked = true;
            };
        };
    };

    private parseDFGs(inJsonGraph : JsonGraph) : void {
        if (inJsonGraph.dfgs !== undefined) {
            let dfgCount = 0;
            for (const jsonDfgId in inJsonGraph.dfgs) {
                const jsonDfg = inJsonGraph.dfgs[jsonDfgId];
                const startNode : Node | undefined = this.graph.nodes[this.nodeIds[jsonDfg[0]]];
                const endNode : Node | undefined = this.graph.nodes[this.nodeIds[jsonDfg[1]]];
                const nodes : Node[] = [];
                const arcs : Arc[] = [];
                const log : Node[][] = [];
                for (const nodeID of jsonDfg[2]) {
                    const node : Node | undefined = this.graph.nodes[this.nodeIds[nodeID]]
                    if (node !== undefined) {
                        nodes.push(node);
                    } else {
                        throw new Error('#srv.jps.prd.000: ' + 'parsing dfg from .json file failed - node with id "' + nodeID + '" is set as part of a dfg in json, but the corresponding node in graph with id "' + this.nodeIds[nodeID] + '" is undefined');
                    };
                };
                for (const arcID of jsonDfg[3]) {
                    arcs.push(this.graph.arcs[this.arcIds[arcID]]);
                };
                for (const trace of jsonDfg[4]) {
                    const traceArray : Node[] = [];
                    for (let eventID = 0; eventID < trace.length; eventID++) {
                        const event : Node | undefined = this.graph.nodes[this.nodeIds[eventID]]
                        if (event !== undefined) {
                            traceArray.push(event);
                        } else {
                            throw new Error('#srv.jps.prd.001: ' + 'parsing dfg from .json file failed - node with id "' + eventID + '" is set as part of a dfg log in json, but the corresponding node in graph with id "' + this.nodeIds[eventID] + '" is undefined');
                        };
                    };
                    log.push(traceArray);
                };
                if (startNode !== undefined) {
                    if (endNode !== undefined) {
                        this.graph.appendDFG(startNode, endNode, nodes, arcs, log);
                        /* TODO - if the service works as intended, remove the following comments */
                        // if (dfgId !== this.dfgIds[jsonDfgId]) {
                        //     throw new Error('#srv.jps.prd.000: ' + 'parsing dfg from .json file failed - id of last appended dfg (' + dfgId + ') is not equal to predicted id (' + this.dfgIds[jsonDfgId] + ')');
                        // };
                    } else {
                        throw new Error('#srv.jps.prd.002: ' + 'parsing dfg from .json file failed - node with id "' + jsonDfg[1] + '" is set as end of a dfg in json, but the corresponding node in graph with id "' + this.nodeIds[jsonDfg[1]] + '" is undefined');
                    };
                } else {
                    throw new Error('#srv.jps.prd.003: ' + 'parsing dfg from .json file failed - node with id "' + jsonDfg[0] + '" is set as start of a dfg in json, but the corresponding node in graph with id "' + this.nodeIds[jsonDfg[0]] + '" is undefined');
                };
                dfgCount++;
            };
        };
    };

    private parseLog(inJsonGraph : JsonGraph) : void {
        if (inJsonGraph.log !== undefined) {
            let traceArray : Node[] = [];
            for (const jsonTrace of inJsonGraph.log) {
                traceArray = [];
                for (const jsonEvent of jsonTrace) {
                    const event : Node | undefined = this.graph.nodes[this.nodeIds[jsonEvent]]
                    if (event !== undefined) {
                        traceArray.push(event);
                    } else {
                        throw new Error('#srv.jps.prl.000: ' + 'parsing log from .json file failed - node with id "' + jsonEvent + '" is set as part of the log in json, but the corresponding node in graph with id "' + this.nodeIds[jsonEvent] + '" is undefined');
                    };
                };
                this.graph.logArray.push(traceArray);
            };
        };
    };

};