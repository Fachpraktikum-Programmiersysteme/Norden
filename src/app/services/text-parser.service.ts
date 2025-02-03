import {Injectable} from '@angular/core';

import {GraphGraphicsConfig} from '../classes/display/graph-graphics.config';

import {Graph} from '../classes/graph-representation/graph';
import {Node} from '../classes/graph-representation/node';
import {Arc} from '../classes/graph-representation/arc';

@Injectable({
    providedIn: 'root'
})
export class TextParserService {

    /* methods : constructor */

    constructor(private _graphicsConfig : GraphGraphicsConfig) {}

    /* methods : other */

    private preProcessLogString(inLogString : string) : string {

        let logStringArray : string[];
        let logString : string;

        if (inLogString.includes('')) {
            logStringArray = inLogString.split('\n');
            for (let idx = 0; idx < (logStringArray.length - 1); idx++) {
                if (logStringArray[idx].charAt(logStringArray[idx].length - 1) !== ' ') {
                    logStringArray[idx] = (logStringArray[idx] + ' ');
                };
            };
            logString = logStringArray.join('');
        } else {
            logString = inLogString;
        };

        return logString;

    };

    private processLogString(inLogString : string) : string[][] {

        let eventLogArray : string[][] = [];
        let tracesArray : string[];

        const eventLogString = inLogString;
    
        tracesArray = eventLogString.split(' + ');

        for (const trace of tracesArray) {
            let eventsArray : string[] = trace.split(' ');
            eventLogArray.push(eventsArray);
        };

        return eventLogArray;

    };

    public parse(inLogString : string): Graph {

        if (inLogString !== '') {

            let logString : string;

            let eventLogArray : string[][];

            let undefEvents : number = 0;

            let emptyTraceCount : number = 0;
            
            let emptyTraceTauNode : Node | undefined = undefined;
    
            let currentNode : Node | undefined = undefined;
            let lastNode : Node | undefined = undefined;
            
            let startNode : Node;
            let endNode : Node;

            let graphTraceArray : Node[] = [];
            const graphLogArray : Node[][] = [];
            
            let dfgTraceArray : Node[] = [];
            const dfgLogArray : Node[][] = [];
            
            const dfgNodesArray : Node[] = [];
            const dfgArcsArray : Arc[] = [];

            const shortLoopTauCases : [Arc, Node, Arc][] = [];

            const graph : Graph = new Graph();
            
            const startNodeAdded : [boolean, number, Node] = graph.addNode('support', 'play', 850, 50);
            const endNodeAdded : [boolean, number, Node] = graph.addNode('support', 'stop', 850, 550);
            
            if (startNodeAdded[0]) {
                startNode = startNodeAdded[2];
                graph.startNode = startNode;
            } else {
                throw new Error('#srv.tps.prs.000: ' + 'parsing text failed - addition of start node failed');
            };
            if (endNodeAdded[0]) {
                endNode = endNodeAdded[2];
                graph.endNode = endNode;
            } else {
                throw new Error('#srv.tps.prs.001: ' + 'parsing text failed - addition of end node failed');
            };
    
            dfgNodesArray.push(startNode);
            dfgNodesArray.push(endNode);
    
            logString = this.preProcessLogString(inLogString);

            eventLogArray = this.processLogString(logString);
    
            for (const trace of eventLogArray) {
                graphTraceArray = [];
                graphTraceArray.push(startNode);
                dfgTraceArray = [];
                dfgTraceArray.push(startNode);
                for (const event of trace) {
                    let eventLabel : string;
                    if (event === undefined) {
                        undefEvents++;
                        eventLabel = ('undefined_event_name__' + undefEvents.toString());
                    } else {
                        eventLabel = event;
                    };
                    let nodeAdded : [boolean, number, Node] = graph.addNode('event', eventLabel);
                    currentNode = nodeAdded[2];
                    if (nodeAdded[0]) {
                        dfgNodesArray.push(currentNode);
                    };
                    if (lastNode !== undefined) {
                        if (lastNode !== currentNode) {
                            const arcAdded : [boolean, number, Arc] = graph.addArc(lastNode, currentNode);
                            if (arcAdded[0]) {
                                dfgArcsArray.push(arcAdded[2]);
                            };
                            graphTraceArray.push(currentNode);
                            dfgTraceArray.push(currentNode);
                        } else {
                            let caseFound : number = (-1);
                            for (let caseIdx = 0; caseIdx < shortLoopTauCases.length; caseIdx++) {
                                const tauCase : [Arc, Node, Arc] = shortLoopTauCases[caseIdx];
                                if (tauCase[0].source === lastNode) {
                                    if (tauCase[2].target === currentNode) {
                                        caseFound = caseIdx;
                                        break;
                                    } else {
                                        throw new Error('#srv.tps.prs.002: ' + 'parsing text failed - tau case array for handling short loops contains impossible case');
                                    };
                                };
                            };
                            if (caseFound < 0) {
                                let tauX : number;
                                let tauY : number;
                                tauX = Math.floor(currentNode.x + Math.ceil(this._graphicsConfig.defaultNodeRadius / 2));
                                tauY = Math.floor(currentNode.y);
                                const tauAdded : [boolean, number, Node] = graph.addNode('support', 'tau', tauX, tauY);
                                if (!(tauAdded[0])) {
                                    throw new Error('#srv.tps.prs.003: ' + 'parsing text failed - addition of tau node failed due to conflict with an existing node');
                                };
                                const tau : Node = tauAdded[2];
                                const arcToTauAdded : [boolean, number, Arc] = graph.addArc(lastNode, tau);
                                if (!(arcToTauAdded[0])) {
                                    throw new Error('#srv.tps.prs.004: ' + 'parsing text failed - addition of arc from source node to new tau node failed due to conflict with an existing arc');
                                };
                                const arcToTau : Arc = arcToTauAdded[2];
                                const arcFromTauAdded : [boolean, number, Arc] = graph.addArc(tau, currentNode);
                                if (!(arcFromTauAdded[0])) {
                                    throw new Error('#srv.tps.prs.005: ' + 'parsing text failed - addition of arc from new tau node to target node failed due to conflict with an existing arc');
                                };
                                const arcFromTau : Arc = arcFromTauAdded[2];
                                shortLoopTauCases.push([arcToTau, tau, arcFromTau]);
                                dfgNodesArray.push(tau);
                                dfgArcsArray.push(arcToTau, arcFromTau);
                                graphTraceArray.push(tau, currentNode);
                                dfgTraceArray.push(tau, currentNode);
                            } else {
                                const foundCase : [Arc, Node, Arc] = shortLoopTauCases[caseFound];
                                graph.updateArcWeight(foundCase[0], (foundCase[0].weight + 1));
                                graph.updateArcWeight(foundCase[2], (foundCase[2].weight + 1));
                                graphTraceArray.push(foundCase[1], currentNode);
                                dfgTraceArray.push(foundCase[1], currentNode);
                            };
                        };
                    } else {
                        const arcAdded : [boolean, number, Arc] = graph.addArc(startNode, currentNode);
                        if (arcAdded[0]) {
                            dfgArcsArray.push(arcAdded[2]);
                        };
                        graphTraceArray.push(currentNode);
                        dfgTraceArray.push(currentNode);
                    };
                    lastNode = currentNode;
                    currentNode = undefined;
                };
                if (lastNode !== undefined) {
                    const arcAdded : [boolean, number, Arc] = graph.addArc(lastNode, endNode);
                    if (arcAdded[0]) {
                        dfgArcsArray.push(arcAdded[2]);
                    };
                    lastNode = undefined;
                } else {
                    if (emptyTraceCount === 0) {
                        if (emptyTraceTauNode !== undefined) {
                            throw new Error('#srv.tps.prs.006: ' + 'parsing text failed - number of empty traces found is still zero, but the transition meant to represent empty traces has already been assigned');
                        };
                        const tauAdded : [boolean, number, Node] = graph.addNode('support', 'tau', 850, 300);
                        if (tauAdded[0]) {
                            emptyTraceTauNode = tauAdded[2];
                            dfgNodesArray.push(emptyTraceTauNode);
                        } else {
                            throw new Error('#srv.tps.prs.007: ' + 'parsing text failed - transition representing empty trace could not be added');
                        };
                        const arcToTauAdded : [boolean, number, Arc] = graph.addArc(startNode, emptyTraceTauNode);
                        if (arcToTauAdded[0]) {
                            dfgArcsArray.push(arcToTauAdded[2]);
                        } else {
                            throw new Error('#srv.tps.prs.008: ' + 'parsing text failed - arc to new tau transition could not be added');
                        };
                        const arcFromTauAdded : [boolean, number, Arc] = graph.addArc(emptyTraceTauNode, endNode);
                        if (arcFromTauAdded[0]) {
                            dfgArcsArray.push(arcFromTauAdded[2]);
                        } else {
                            throw new Error('#srv.tps.prs.009: ' + 'parsing text failed - arc from new tau transition could not be added');
                        };
                    } else if (emptyTraceCount > 0) {
                        if (emptyTraceTauNode === undefined) {
                            throw new Error('#srv.tps.prs.010: ' + 'parsing text failed - at least one empty trace has been found, but the transition meant to represent empty traces has not been assigned correctly and is undefined');
                        } else {
                            graph.addArc(startNode, emptyTraceTauNode);
                            graph.addArc(emptyTraceTauNode, endNode);
                        };
                    } else {
                        throw new Error('#srv.tps.prs.011: ' + 'parsing text failed - number of empty traces found is less than zero');
                    };
                    graphTraceArray.push(emptyTraceTauNode, endNode);
                    graphLogArray.push(graphTraceArray);
                    dfgTraceArray.push(emptyTraceTauNode, endNode);
                    dfgLogArray.push(dfgTraceArray);
                    emptyTraceCount++;
                };
                graphTraceArray.push(endNode);
                dfgTraceArray.push(endNode);
                graphLogArray.push(graphTraceArray);
                dfgLogArray.push(dfgTraceArray);
            };

            graph.appendDFG(startNode, endNode, dfgNodesArray, dfgArcsArray, dfgLogArray);

            graph.logArray = graphLogArray;
    
            return graph;

        } else {

            return new Graph;

        };

    };

};