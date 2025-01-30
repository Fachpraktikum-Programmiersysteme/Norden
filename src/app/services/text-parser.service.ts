import {Injectable} from '@angular/core';

import {Graph} from '../classes/graph-representation/graph';
import {Node} from '../classes/graph-representation/node';

@Injectable({
    providedIn: 'root'
})
export class TextParserService {

    /* methods : constructor */

    constructor() {}

    /* methods : other */

    private preProcessLogString(inLogString : string) : string {

        let logStringArray : string[];
        let logString : string;

        if (inLogString.includes('')) {
            logStringArray = inLogString.split('\n');
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
    
            let currentNode : Node | undefined = undefined;
            let lastNode : Node | undefined = undefined;

            let traceArray : Node[];
            const logArray : Node[][] = [];
            const dfgArray : Node[] = [];
            const dfgLogArray : Node[][] = [];
            let dfgTraceArray : Node[];

            const graph : Graph = new Graph();
            
            const startNodeAdded : [boolean, number, Node] = graph.addNode('support', 'play', 850, 50);
            const endNodeAdded : [boolean, number, Node] = graph.addNode('support', 'stop', 850, 550);
            
            let startNode : Node;
            let endNode : Node;
            
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
    
            dfgArray.push(startNode);
            dfgArray.push(endNode);
    
            logString = this.preProcessLogString(inLogString);

            eventLogArray = this.processLogString(logString);
    
            for (const trace of eventLogArray) {
                traceArray = [];
                traceArray.push(startNode);
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
                    if (currentNode !== undefined) {
                        traceArray.push(currentNode);
                        dfgTraceArray.push(currentNode);
                        if (nodeAdded[0]) {
                            dfgArray.push(currentNode);
                        };
                        if (lastNode !== undefined) {
                            graph.addArc(lastNode, currentNode);
                        } else {
                            graph.addArc(startNode, currentNode)
                        };
                        lastNode = currentNode;
                        currentNode = undefined;
                    } else {
                        throw new Error('#srv.tps.prs.003: ' + 'parsing text failed - impossible error');
                    };
                };
                if (lastNode !== undefined) {
                    graph.addArc(lastNode, endNode)
                    lastNode = undefined;
                };
                traceArray.push(endNode);
                dfgTraceArray.push(endNode);
                logArray.push(traceArray);
                dfgLogArray.push(dfgTraceArray);
            };

            graph.appendDFG(startNode, endNode, dfgArray, graph.arcs, dfgLogArray);

            graph.logArray = logArray;
    
            return graph;

        } else {

            return new Graph;

        };

    };

};