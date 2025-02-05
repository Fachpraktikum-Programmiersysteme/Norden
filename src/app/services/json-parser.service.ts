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

    private unlabeledEvents : number = 0;
    private unlabeledTransitions : number = 0;

    /* methods : constructor */

    public constructor() {};

    /* methods : other */

    public parse(inJsonString : string): Graph {

        try {

            const jsonGraph = JSON.parse(inJsonString) as JsonGraph;

            this.initialize()

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
        this.unlabeledEvents = 0;
        this.unlabeledTransitions = 0;
    };

    private isCoords(inValue : Coords | Coords[]) : inValue is Coords {
        return true;
    };

    private parseSupports(inJsonGraph : JsonGraph) {
        if (inJsonGraph.supports !== undefined) {
            for (const support of inJsonGraph.supports) {
                const supportLabel = this.parseSupportLabel(inJsonGraph, support);
                const supportCoords : Coords | undefined = this.parseNodeCoords(inJsonGraph, support);
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
                throw new Error('#srv.jps.psn.000: ' + 'parsing support label from .json file failed - label for support node (id "' + inNodeId + '" in .json) is undefined');
            };
        } else {
            throw new Error('#srv.jps.psn.001: ' + 'parsing support label from .json file failed - graph contains support nodes, but no labels');
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
            if (sourceNode !== undefined) {
                if (targetNode !== undefined) {
                    this.graph.addArc(sourceNode, targetNode, inJsonGraph.arcs[arc]);
                    this.arcIds[arc] = arcId;
                    arcId++;
                } else {
                    throw new Error('#srv.jps.psa.000: ' + 'parsing arc from .json file failed - target node is undefined (node id in .json: "' + idPair[1] + '", node id in graph: "' + this.nodeIds[idPair[1]] + '")');
                };
            } else {
                throw new Error('#srv.jps.psa.001: ' + 'parsing arc from .json file failed - source node is undefined (node id in .json: "' + idPair[0] + '", node id in graph: "' + this.nodeIds[idPair[0]] + '")');
            };
        };
    };

    private parseMarked(inJsonGraph : JsonGraph) : void {
        if (inJsonGraph.marked !== undefined) {
            for (const nodeID in inJsonGraph.marked[0]) {
                const node : Node | undefined = this.graph.nodes[this.nodeIds[nodeID]]
                if (node !== undefined) {
                    this.graph.markedNodes.push(node);
                    node.marked = true;
                } else {
                    throw new Error('#srv.jps.psm.000: ' + 'parsing node \'marked\'-flag from .json file failed - node in json (id "' + nodeID + '") is flagged as marked, but the corresponding node in graph (id "' + this.nodeIds[nodeID] + '") is undefined');
                };
            };
            for (const arcID in inJsonGraph.marked[1]) {
                const arc : Arc = this.graph.arcs[this.arcIds[arcID]];
                this.graph.markedArcs.push(arc);
                arc.marked = true;
            };
        };
    };

    private parseSpecial(inJsonGraph : JsonGraph) : void {
        if (inJsonGraph.special !== undefined) {
            for (const nodeID in inJsonGraph.special) {
                const node : Node | undefined = this.graph.nodes[this.nodeIds[nodeID]]
                if (node !== undefined) {
                    node.special = true;
                } else {
                    throw new Error('#srv.jps.psc.000: ' + 'parsing node \'special\'-flag from .json file failed - node in json (id "' + nodeID + '") is flagged as special, but the corresponding node in graph (id "' + this.nodeIds[nodeID] + '") is undefined');
                };
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
                        throw new Error('#srv.jps.psd.000: ' + 'parsing dfg from .json file failed - node with id "' + nodeID + '" is set as part of a dfg in json, but the corresponding node in graph with id "' + this.nodeIds[nodeID] + '" is undefined');
                    };
                };
                for (const arcID of jsonDfg[3]) {
                    arcs.push(this.graph.arcs[this.arcIds[arcID]]);
                };
                for (const trace of jsonDfg[4]) {
                    const traceArray : Node[] = [];
                    for (let eventID = 0; eventID < trace.length; eventID++) {
                        const event : Node | undefined = this.graph.nodes[this.nodeIds[trace[eventID]]]
                        if (event !== undefined) {
                            traceArray.push(event);
                        } else {
                            throw new Error('#srv.jps.psd.001: ' + 'parsing dfg from .json file failed - node with id "' + trace[eventID] + '" is set as part of a dfg log in json, but the corresponding node in graph with id "' + this.nodeIds[trace[eventID]] + '" is undefined');
                        };
                    };
                    log.push(traceArray);
                };
                if (startNode !== undefined) {
                    if (endNode !== undefined) {
                        this.graph.appendDFG(startNode, endNode, nodes, arcs, log);
                    } else {
                        throw new Error('#srv.jps.psd.002: ' + 'parsing dfg from .json file failed - node with id "' + jsonDfg[1] + '" is set as end of a dfg in json, but the corresponding node in graph with id "' + this.nodeIds[jsonDfg[1]] + '" is undefined');
                    };
                } else {
                    throw new Error('#srv.jps.psd.003: ' + 'parsing dfg from .json file failed - node with id "' + jsonDfg[0] + '" is set as start of a dfg in json, but the corresponding node in graph with id "' + this.nodeIds[jsonDfg[0]] + '" is undefined');
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
                        throw new Error('#srv.jps.psl.000: ' + 'parsing log from .json file failed - node with id "' + jsonEvent + '" is set as part of the log in json, but the corresponding node in graph with id "' + this.nodeIds[jsonEvent] + '" is undefined');
                    };
                };
                this.graph.logArray.push(traceArray);
            };
        };
    };

};