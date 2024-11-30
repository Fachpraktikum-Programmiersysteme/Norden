import {Injectable} from '@angular/core';

import {Coords} from "../classes/file-management/coordinates";
import {JsonGraph} from '../classes/file-management/json-graph';
import {Graph} from '../classes/graph-representation/graph';
import {Node} from '../classes/graph-representation/node';

@Injectable({
    providedIn: 'root'
})
export class JsonParserService {

    /* methods : constructor */

    public constructor() {}

    /* methods : other */

    public parse(inJsonString : string): [Graph, number[][]] {

        let graph : Graph = new Graph();
        let log : number[][] = [];

        try {

            let nodeIds : {
                [jsonNodeId: string]: number
            } = {};

            const jsonGraph = JSON.parse(inJsonString) as JsonGraph;

            [graph, nodeIds] = this.parseSupports(jsonGraph, nodeIds, graph);
            [graph, nodeIds] = this.parseEvents(jsonGraph, nodeIds, graph);
            [graph, nodeIds] = this.parsePlaces(jsonGraph, nodeIds, graph);
            [graph, nodeIds] = this.parseTransitions(jsonGraph, nodeIds, graph);

            graph = this.parseArcs(jsonGraph, nodeIds, graph)

            log = this.parseTraces(jsonGraph, nodeIds)

        } catch (error) {

            console.error('parsing of .json file failed - ', error);

        };

        return [graph, log];

    };

    private isCoords(inValue : Coords | Coords[]) : inValue is Coords {
        return true;
    };

    private parseSupports(
        inJsonGraph : JsonGraph, 
        inoutNodeIds : {[jsonNodeId: string]: number}, 
        inoutGraph : Graph
    ): [Graph, {[jsonNodeId: string]: number}] {
        let currentNodeIds : {[jsonNodeId: string]: number} = inoutNodeIds;
        let currentGraph : Graph = inoutGraph;
        let unlabeledSupports : number = 0;
        if (inJsonGraph.supports !== undefined) {
            if (inJsonGraph.labels !== undefined) {
                if (inJsonGraph.layout !== undefined) {
                    for (const support of inJsonGraph.supports) {
                        let supportLabel : string;
                        let supportCoordinates : Coords | undefined = undefined;
                        if (inJsonGraph.labels[support] !== undefined) {
                            supportLabel = inJsonGraph.labels[support];
                        } else {
                            supportLabel = ('undefined_support_label__' + unlabeledSupports.toString());
                            unlabeledSupports++;
                        };
                        if (inJsonGraph.layout[support] !== undefined) {
                            if (this.isCoords(inJsonGraph.layout[support])) {
                                supportCoordinates = inJsonGraph.layout[support] as Coords;
                            };
                        };
                        currentNodeIds[support] = currentGraph.addNode('support', supportLabel, supportCoordinates?.x, supportCoordinates?.y)[1];
                    };
                } else {
                    for (const support of inJsonGraph.supports) {
                        let supportLabel : string;
                        if (inJsonGraph.labels[support] !== undefined) {
                            supportLabel = inJsonGraph.labels[support];
                        } else {
                            supportLabel = ('undefined_support_label__' + unlabeledSupports.toString());
                            unlabeledSupports++;
                        };
                        currentNodeIds[support] = currentGraph.addNode('support', supportLabel)[1];
                    };
                };
            } else {
                for (const support of inJsonGraph.supports) {
                    let supportLabel : string = ('undefined_support_label__' + unlabeledSupports.toString());
                    unlabeledSupports++;
                    currentNodeIds[support] = currentGraph.addNode('support', supportLabel)[1];
                };
            };
        };
        return [currentGraph, currentNodeIds];
    };

    private parseEvents(
        inJsonGraph : JsonGraph, 
        inoutNodeIds : {[jsonNodeId: string]: number}, 
        inoutGraph : Graph
    ): [Graph, {[jsonNodeId: string]: number}] {
        let currentNodeIds : {[jsonNodeId: string]: number} = inoutNodeIds;
        let currentGraph : Graph = inoutGraph;
        let unlabeledEvents : number = 0;
        if (inJsonGraph.events !== undefined) {
            if (inJsonGraph.labels !== undefined) {
                if (inJsonGraph.layout !== undefined) {
                    for (const event of inJsonGraph.events) {
                        let nodeAdded : [boolean, number];
                        let eventLabel : string;
                        let eventCoordinates : Coords | undefined = undefined;
                        if (inJsonGraph.labels[event] !== undefined) {
                            eventLabel = inJsonGraph.labels[event];
                        } else {
                            eventLabel = ('undefined_event_label__' + unlabeledEvents.toString());
                            unlabeledEvents++;
                        };
                        if (inJsonGraph.layout[event] !== undefined) {
                            if (this.isCoords(inJsonGraph.layout[event])) {
                                eventCoordinates = inJsonGraph.layout[event] as Coords;
                            };
                        };
                        nodeAdded = currentGraph.addNode('event', eventLabel, eventCoordinates?.x, eventCoordinates?.y);
                        currentNodeIds[event] = nodeAdded[1];
                        if (!nodeAdded[0]) {
                            throw new Error('#srv.jps.pse.000: ' + 'parsing events from .json file failed - duplicate event label detected (label "' + eventLabel + '")');
                        };
                    };
                } else {
                    for (const event of inJsonGraph.events) {
                        let nodeAdded : [boolean, number];
                        let eventLabel : string;
                        if (inJsonGraph.labels[event] !== undefined) {
                            eventLabel = inJsonGraph.labels[event];
                        } else {
                            eventLabel = ('undefined_event_label__' + unlabeledEvents.toString());
                            unlabeledEvents++;
                        };
                        nodeAdded = currentGraph.addNode('event', eventLabel);
                        currentNodeIds[event] = nodeAdded[1];
                        if (!nodeAdded[0]) {
                            throw new Error('#srv.jps.pse.001: ' + 'parsing events from .json file failed - duplicate event label detected (label "' + eventLabel + '")');
                        };
                    };
                };
            } else {
                for (const event of inJsonGraph.events) {
                    let eventLabel : string = ('undefined_event_label__' + unlabeledEvents.toString());
                    unlabeledEvents++;
                    currentNodeIds[event] = currentGraph.addNode('event', eventLabel)[1];
                };
            };
        };
        return [currentGraph, currentNodeIds];
    };

    private parsePlaces(
        inJsonGraph : JsonGraph, 
        inoutNodeIds : {[jsonNodeId: string]: number}, 
        inoutGraph : Graph
    ): [Graph, {[jsonNodeId: string]: number}] {
        let currentNodeIds : {[jsonNodeId: string]: number} = inoutNodeIds;
        let currentGraph : Graph = inoutGraph;
        let unlabeledPlaces : number = 0;
        if (inJsonGraph.places !== undefined) {
            if (inJsonGraph.labels !== undefined) {
                if (inJsonGraph.layout !== undefined) {
                    for (const place of inJsonGraph.places) {
                        let placeLabel : string;
                        let placeCoordinates : Coords | undefined = undefined;
                        if (inJsonGraph.labels[place] !== undefined) {
                            placeLabel = inJsonGraph.labels[place];
                        } else {
                            placeLabel = ('undefined_place_label__' + unlabeledPlaces.toString());
                            unlabeledPlaces++;
                        };
                        if (inJsonGraph.layout[place] !== undefined) {
                            if (this.isCoords(inJsonGraph.layout[place])) {
                                placeCoordinates = inJsonGraph.layout[place] as Coords;
                            };
                        };
                        currentNodeIds[place] = currentGraph.addNode('place', placeLabel, placeCoordinates?.x, placeCoordinates?.y)[1];
                    };
                } else {
                    for (const place of inJsonGraph.places) {
                        let placeLabel : string;
                        if (inJsonGraph.labels[place] !== undefined) {
                            placeLabel = inJsonGraph.labels[place];
                        } else {
                            placeLabel = ('undefined_place_label__' + unlabeledPlaces.toString());
                            unlabeledPlaces++;
                        };
                        currentNodeIds[place] = currentGraph.addNode('place', placeLabel)[1];
                    };
                };
            } else {
                for (const place of inJsonGraph.places) {
                    let placeLabel : string = ('undefined_place_label__' + unlabeledPlaces.toString());
                    unlabeledPlaces++;
                    currentNodeIds[place] = currentGraph.addNode('place', placeLabel)[1];
                };
            };
        };
        return [currentGraph, currentNodeIds];
    };

    private parseTransitions(
        inJsonGraph : JsonGraph, 
        inoutNodeIds : {[jsonNodeId: string]: number}, 
        inoutGraph : Graph
    ): [Graph, {[jsonNodeId: string]: number}] {
        let currentNodeIds : {[jsonNodeId: string]: number} = inoutNodeIds;
        let currentGraph : Graph = inoutGraph;
        let unlabeledTransitions : number = 0;
        if (inJsonGraph.transitions !== undefined) {
            if (inJsonGraph.labels !== undefined) {
                if (inJsonGraph.layout !== undefined) {
                    for (const transition of inJsonGraph.transitions) {
                        let transitionLabel : string;
                        let transitionCoordinates : Coords | undefined = undefined;
                        if (inJsonGraph.labels[transition] !== undefined) {
                            transitionLabel = inJsonGraph.labels[transition];
                        } else {
                            transitionLabel = ('undefined_transition_label__' + unlabeledTransitions.toString());
                            unlabeledTransitions++;
                        };
                        if (inJsonGraph.layout[transition] !== undefined) {
                            if (this.isCoords(inJsonGraph.layout[transition])) {
                                transitionCoordinates = inJsonGraph.layout[transition] as Coords;
                            };
                        };
                        currentNodeIds[transition] = currentGraph.addNode('transition', transitionLabel, transitionCoordinates?.x, transitionCoordinates?.y)[1];
                    };
                } else {
                    for (const transition of inJsonGraph.transitions) {
                        let transitionLabel : string;
                        if (inJsonGraph.labels[transition] !== undefined) {
                            transitionLabel = inJsonGraph.labels[transition];
                        } else {
                            transitionLabel = ('undefined_transition_label__' + unlabeledTransitions.toString());
                            unlabeledTransitions++;
                        };
                        currentNodeIds[transition] = currentGraph.addNode('transition', transitionLabel)[1];
                    };
                };
            } else {
                for (const transition of inJsonGraph.transitions) {
                    let transitionLabel : string = ('undefined_transition_label__' + unlabeledTransitions.toString());
                    unlabeledTransitions++;
                    currentNodeIds[transition] = currentGraph.addNode('transition', transitionLabel)[1];
                };
            };
        };
        return [currentGraph, currentNodeIds];
    };

    private parseArcs(
        inJsonGraph : JsonGraph, 
        inNodeIds : {[jsonNodeId: string]: number}, 
        inoutGraph : Graph
    ): Graph {
        let currentGraph : Graph = inoutGraph;
        for (const arc in inJsonGraph.arcs) {
            let idPair : string[] = arc.split(',')
            let sourceNode : Node | undefined = currentGraph.nodes[inNodeIds[idPair[0]]];
            let targetNode : Node | undefined = currentGraph.nodes[inNodeIds[idPair[1]]];
            if (sourceNode !== undefined) {
                if (targetNode !== undefined) {
                    currentGraph.addArc(sourceNode, targetNode, inJsonGraph.arcs[arc]);
                } else {
                    throw new Error('#srv.jps.psa.000: ' + 'parsing arcs from .json file failed - target node is undefined (node id in .json: "' + idPair[1] + '", node id in graph: "' + inNodeIds[idPair[1]] + '")');
                };
            } else {
                throw new Error('#srv.jps.psa.000: ' + 'parsing arcs from .json file failed - source node is undefined (node id in .json: "' + idPair[0] + '", node id in graph: "' + inNodeIds[idPair[0]] + '")');
            };
        };
        return currentGraph;
    };

    private parseTraces(
        inJsonGraph : JsonGraph, 
        inNodeIds : {[jsonNodeId: string]: number}
    ): number[][] {
        let eventsArray : number[] = [];
        let tracesArray : number[][] = [];
        if (inJsonGraph.log !== undefined) {
            for (const trace of inJsonGraph.log) {
                eventsArray = [];
                for (const event of trace) {
                    eventsArray.push(inNodeIds[event]);
                };
                tracesArray.push(eventsArray);
            };
        };
        return tracesArray;
    };

};