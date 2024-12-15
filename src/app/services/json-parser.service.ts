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

    private dfgIds : {
        [jsonDfgId: string]: number
    } = {};

    private unlabeledSupports : number = 0;
    private unlabeledEvents : number = 0;
    private unlabeledPlaces : number = 0;
    private unlabeledTransitions : number = 0;

    /* methods : constructor */

    public constructor() {};

    /* methods : other */

    public parse(inJsonString : string): Graph {

        try {

            const jsonGraph = JSON.parse(inJsonString) as JsonGraph;

            this.initialize()

            this.parseDfgIds(jsonGraph);

            this.parseSupports(jsonGraph);
            this.parseEvents(jsonGraph);
            this.parsePlaces(jsonGraph);
            this.parseTransitions(jsonGraph);

            this.parseArcs(jsonGraph);

            this.parseMarked(jsonGraph);

            this.parseDFGs(jsonGraph);

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
        this.dfgIds = {};
        this.unlabeledSupports = 0;
        this.unlabeledEvents = 0;
        this.unlabeledPlaces = 0;
        this.unlabeledTransitions = 0;
    };

    private isCoords(inValue : Coords | Coords[]) : inValue is Coords {
        return true;
    };

    private parseDfgIds(inJsonGraph : JsonGraph) : void {
        if (inJsonGraph.dfgs !== undefined) {
            let dfgCount = 0;
            for (const dfg in inJsonGraph.dfgs[2]) {
                this.dfgIds[dfg] = dfgCount;
                dfgCount++;
            };
        };
    };

    private parseSupports(inJsonGraph : JsonGraph) {
        if (inJsonGraph.supports !== undefined) {
            for (const support of inJsonGraph.supports) {
                const supportLabel = this.parseSupportLabel(inJsonGraph, support);
                const supportCoords : Coords | undefined = this.parseNodeCoords(inJsonGraph, support);
                const supportDFG : number | undefined = this.parseNodeDFG(inJsonGraph, support);
                const supportAdded : [boolean, number] = this.graph.addNode('support', supportLabel, supportDFG, supportCoords?.x, supportCoords?.y);
                this.nodeIds[support] = supportAdded[1];
            };
        };
    };

    private parseEvents(inJsonGraph : JsonGraph) {
        if (inJsonGraph.events !== undefined) {
            for (const event of inJsonGraph.events) {
                const eventLabel = this.parseEventLabel(inJsonGraph, event);
                const eventCoords : Coords | undefined = this.parseNodeCoords(inJsonGraph, event);
                const eventDFG : number | undefined = this.parseNodeDFG(inJsonGraph, event);
                const eventAdded : [boolean, number] = this.graph.addNode('event', eventLabel, eventDFG, eventCoords?.x, eventCoords?.y);
                this.nodeIds[event] = eventAdded[1];
            };
        };
    };

    private parsePlaces(inJsonGraph : JsonGraph) {
        if (inJsonGraph.places !== undefined) {
            for (const place of inJsonGraph.places) {
                const placeLabel = this.parsePlaceLabel(inJsonGraph, place);
                const placeCoords : Coords | undefined = this.parseNodeCoords(inJsonGraph, place);
                const placeDFG : number | undefined = this.parseNodeDFG(inJsonGraph, place);
                const placeAdded : [boolean, number] = this.graph.addNode('place', placeLabel, placeDFG, placeCoords?.x, placeCoords?.y);
                this.nodeIds[place] = placeAdded[1];
            };
        };
    };

    private parseTransitions(inJsonGraph : JsonGraph) {
        if (inJsonGraph.transitions !== undefined) {
            for (const transition of inJsonGraph.transitions) {
                const transitionLabel = this.parseTransitionLabel(inJsonGraph, transition);
                const transitionCoords : Coords | undefined = this.parseNodeCoords(inJsonGraph, transition);
                const transitionDFG : number | undefined = this.parseNodeDFG(inJsonGraph, transition);
                const transitionAdded : [boolean, number] = this.graph.addNode('transition', transitionLabel, transitionDFG, transitionCoords?.x, transitionCoords?.y);
                this.nodeIds[transition] = transitionAdded[1];
            };
        };
    };

    private parseSupportLabel(inJsonGraph : JsonGraph, inNodeId : string) : string {
        if (inJsonGraph.labels !== undefined) {
            if (inJsonGraph.labels[inNodeId] !== undefined) {
                return (inJsonGraph.labels[inNodeId]);
            } else {
                this.unlabeledSupports++
                return ('undefined_support_label__' + this.unlabeledSupports.toString());
            };
        } else {
            this.unlabeledSupports++
            return ('undefined_support_label__' + this.unlabeledSupports.toString());
        };
    };

    private parseEventLabel(inJsonGraph : JsonGraph, inNodeId : string) : string {
        if (inJsonGraph.labels !== undefined) {
            if (inJsonGraph.labels[inNodeId] !== undefined) {
                return (inJsonGraph.labels[inNodeId]);
            } else {
                this.unlabeledEvents++
                return ('undefined_event_label__' + this.unlabeledEvents.toString());
            };
        } else {
            this.unlabeledEvents++
            return ('undefined_event_label__' + this.unlabeledEvents.toString());
        };
    };

    private parsePlaceLabel(inJsonGraph : JsonGraph, inNodeId : string) : string {
        if (inJsonGraph.labels !== undefined) {
            if (inJsonGraph.labels[inNodeId] !== undefined) {
                return (inJsonGraph.labels[inNodeId]);
            } else {
                this.unlabeledPlaces++
                return ('undefined_place_label__' + this.unlabeledPlaces.toString());
            };
        } else {
            this.unlabeledPlaces++
            return ('undefined_place_label__' + this.unlabeledPlaces.toString());
        };
    };

    private parseTransitionLabel(inJsonGraph : JsonGraph, inNodeId : string) : string {
        if (inJsonGraph.labels !== undefined) {
            if (inJsonGraph.labels[inNodeId] !== undefined) {
                return (inJsonGraph.labels[inNodeId]);
            } else {
                this.unlabeledTransitions++
                return ('undefined_transition_label__' + this.unlabeledTransitions.toString());
            };
        } else {
            this.unlabeledTransitions++
            return ('undefined_transition_label__' + this.unlabeledTransitions.toString());
        };
    };

    private parseNodeCoords(inJsonGraph : JsonGraph, inNodeId : string) : Coords | undefined {
        if (inJsonGraph.layout !== undefined) {
            if (inJsonGraph.layout[inNodeId] !== undefined) {
                if (this.isCoords(inJsonGraph.layout[inNodeId])) {
                    return (inJsonGraph.layout[inNodeId] as Coords);
                } else {
                    return (undefined);
                };
            } else {
                return (undefined);
            };
        } else {
            return (undefined);
        };
    };

    private parseNodeDFG(inJsonGraph : JsonGraph, inJsonNodeId : string) : number | undefined {
        if (inJsonGraph.dfgs !== undefined) {
            if (inJsonGraph.dfgs[0][inJsonNodeId] !== undefined) {
                return (this.dfgIds[inJsonGraph.dfgs[0][inJsonNodeId]]);
            } else {
                return (undefined);
            };
        } else {
            return (undefined);
        };
    };

    private parseArcs(inJsonGraph : JsonGraph) : void {
        let arcId : number = 0;
        for (const arc in inJsonGraph.arcs) {
            const idPair : string[] = arc.split(',')
            const sourceNode : Node | undefined = this.graph.nodes[this.nodeIds[idPair[0]]];
            const targetNode : Node | undefined = this.graph.nodes[this.nodeIds[idPair[1]]];
            const dfg : number | undefined = this.parseArcDFG(inJsonGraph, arc);
            if (sourceNode !== undefined) {
                if (targetNode !== undefined) {
                    this.graph.addArc(sourceNode, targetNode, dfg, inJsonGraph.arcs[arc]);
                    this.arcIds[arc] = arcId;
                    arcId++;
                } else {
                    throw new Error('#srv.jps.psa.000: ' + 'parsing arcs from .json file failed - target node is undefined (node id in .json: "' + idPair[1] + '", node id in graph: "' + this.nodeIds[idPair[1]] + '")');
                };
            } else {
                throw new Error('#srv.jps.psa.000: ' + 'parsing arcs from .json file failed - source node is undefined (node id in .json: "' + idPair[0] + '", node id in graph: "' + this.nodeIds[idPair[0]] + '")');
            };
        };
    };

    private parseArcDFG(inJsonGraph : JsonGraph, inJsonArcId : string) : number | undefined {
        if (inJsonGraph.dfgs !== undefined) {
            if (inJsonGraph.dfgs[1][inJsonArcId] !== undefined) {
                return (this.dfgIds[inJsonGraph.dfgs[1][inJsonArcId]]);
            } else {
                return (undefined);
            };
        } else {
            return (undefined);
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
                    throw new Error('#srv.jps.psm.000: ' + 'parsing node from .json file failed - node in json (id "' + nodeID + '") is noted as marked, but the corresponding node in graph (id "' + this.nodeIds[nodeID] + '") is undefined');
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
            for (const jsonDfgId in inJsonGraph.dfgs[2]) {
                const jsonDfg = inJsonGraph.dfgs[2][jsonDfgId];
                const startNode : Node | undefined = this.graph.nodes[this.nodeIds[jsonDfg[0]]];
                const endNode : Node | undefined = this.graph.nodes[this.nodeIds[jsonDfg[1]]];
                const nodes : (Node | undefined)[] = [];
                const arcs : Arc[] = [];
                for (const nodeID in jsonDfg[2]) {
                    nodes.push(this.graph.nodes[this.nodeIds[nodeID]]);
                };
                for (const arcID in jsonDfg[3]) {
                    arcs.push(this.graph.arcs[this.arcIds[arcID]]);
                };
                if (startNode !== undefined) {
                    if (endNode !== undefined) {
                        const dfgId : number = this.graph.appendDFG(startNode, endNode, [], arcs);
                        if (dfgId !== this.dfgIds[jsonDfgId]) {
                            throw new Error('#srv.jps.psd.000: ' + 'parsing dfg from .json file failed - id of last appended dfg (' + dfgId + ') is not equal to predicted id (' + this.dfgIds[jsonDfgId] + ')');
                        } else {
                            for (const node of nodes) {
                                if (node !== undefined) {
                                    this.graph.dfgArray[dfgCount].nodes.push(node);
                                } else {
                                    throw new Error('#srv.jps.psd.001: ' + 'parsing dfg from .json file failed - node noted as part of a dfg in json is undefined in graph');
                                };
                            };
                        };
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

};