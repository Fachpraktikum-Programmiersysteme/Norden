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

            let eventLogArray : string[][];

            let undefEvents : number = 0;
            let unnamedEvents : number = 0;
    
            let currentNode : Node | undefined = undefined;
            let lastNode : Node | undefined = undefined;

            let traceArray : Node[];
            const logArray : Node[][] = [];
            const dfgArray : Node[] = [];

            const graph : Graph = new Graph();
            
            graph.addNode('support', 'play', 0, 850, 50);
            graph.addNode('support', 'stop', 0, 850, 550);
            
            let startNode : Node;
            let endNode : Node;
            
            if (graph.nodes[0] !== undefined) {
                startNode = graph.nodes[0];
            } else {
                throw new Error('#srv.xps.isn.000: ' + 'reading from .xes-file failed - impossible error');
            };
            if (graph.nodes[1] !== undefined) {
                endNode = graph.nodes[1];
            } else {
                throw new Error('#srv.xps.ien.001: ' + 'reading from .xes-file failed - impossible error');
            };
    
            dfgArray.push(startNode);
            dfgArray.push(endNode);
    
            eventLogArray = this.processLogString(inLogString)
    
            for (const trace of eventLogArray) {
                traceArray = [];
                traceArray.push(startNode);
                for (const event of trace) {
                    let eventLabel : string;
                    if (event === undefined) {
                        undefEvents++;
                        eventLabel = ('undefined_event_name__' + undefEvents.toString());
                    /* to be removed - start */
                    // } else if (event === '') {
                    //     unnamedEvents++;
                    //     eventLabel = ('empty_event_name__' + unnamedEvents.toString());
                    /* to be removed - end */
                    } else {
                        eventLabel = event;
                    };
                    let nodeAdded : [boolean, number] = graph.addNode('event', eventLabel, 0);
                    currentNode = graph.nodes[nodeAdded[1]];
                    if (currentNode !== undefined) {
                        traceArray.push(currentNode);
                        if (nodeAdded[0]) {
                            dfgArray.push(currentNode);
                        };
                        if (lastNode !== undefined) {
                            graph.addArc(lastNode, currentNode, 0);
                        } else {
                            /* TODO - if the service works as intended, remove the following comments */
                            // if (graph.nodes[0] !== undefined) {
                                graph.addArc(startNode, currentNode, 0)
                            // } else {
                            //     throw new Error('#srv.tps.prs.000: ' + 'parsing text failed - impossible error');
                            // };
                        };
                        lastNode = currentNode;
                        currentNode = undefined;
                    } else {
                        throw new Error('#srv.tps.prs.001: ' + 'parsing text failed - impossible error');
                    };
                };
                if (lastNode !== undefined) {
                    /* TODO - if the service works as intended, remove the following comments */
                    // if (graph.nodes[1] !== undefined) {
                        graph.addArc(lastNode, endNode, 0)
                    // } else {
                    //     throw new Error('#srv.tps.prs.002: ' + 'parsing text failed - impossible error');
                    // };
                    lastNode = undefined;
                };
                traceArray.push(endNode);
                logArray.push(traceArray);
            };

            /* to be removed - start */
            console.log(' >> parsing of input text finished');
            console.log(' >> dfgArray : ' + dfgArray);
            console.log(' >> graph.nodes : ' + graph.nodes);
            /* to be removed - end */

            /* TODO - if the service works as intended, remove the following comments */
            // if (graph.nodes[0] !== undefined) {
            //     if (graph.nodes[1] !== undefined) {
                    graph.appendDFG(startNode, endNode, dfgArray, graph.arcs);
            //     } else {
            //         throw new Error('#srv.tps.prs.003: ' + 'parsing text failed - impossible error');
            //     };
            // } else {
            //     throw new Error('#srv.tps.prs.004: ' + 'parsing text failed - impossible error');
            // };

            graph.logArray = logArray;
    
            return graph;

        } else {

            return new Graph;

        };

    };

};