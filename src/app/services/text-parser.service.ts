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

        let logArray : string[][] = [];
        let tracesArray : string[];

        const eventLogString = inLogString;
    
        tracesArray = eventLogString.split(' + ');

        for (const trace of tracesArray) {
            let eventsArray : string[] = trace.split(' ');
            logArray.push(eventsArray);
        };

        return logArray;

    };

    public parse(inLogString : string): Graph {

        if (inLogString === '') {

            return new Graph();

        } else {

            let logArray : string[][];

            let undefEvents : number = 0;
            let unnamedEvents : number = 0;
    
            let currentNode : Node | undefined = undefined;
            let lastNode : Node | undefined = undefined;
    
            const startNode : Node = new Node(0, 'support', 'play', 850, 50);
            const endNode : Node = new Node(0, 'support', 'stop', 850, 350);
    
            const graph : Graph = new Graph([startNode, endNode]);
    
            logArray = this.processLogString(inLogString)
    
            for (const trace of logArray) {
                for (const event of trace) {
                    let eventLabel : string;
                    if (event === undefined) {
                        undefEvents++;
                        eventLabel = ('undefined_event_name__' + undefEvents.toString());
                    } else if (event === '') {
                        unnamedEvents++;
                        eventLabel = ('empty_event_name__' + unnamedEvents.toString());
                    } else {
                        eventLabel = event;
                    };
                    let nodeAdded : [boolean, number] = graph.addNode('event', eventLabel);
                    currentNode = graph.nodes[nodeAdded[1]];
                    if (currentNode !== undefined) {
                        if (lastNode !== undefined) {
                            graph.addArc(lastNode, currentNode);
                        } else {
                            if (graph.nodes[0] !== undefined) {
                                graph.addArc(graph.nodes[0], currentNode)
                            } else {
                                throw new Error('#srv.tps.prs.000: ' + 'parsing text failed - impossible error');
                            };
                        };
                        lastNode = currentNode;
                        currentNode = undefined;
                    } else {
                        throw new Error('#srv.tps.prs.001: ' + 'parsing text failed - impossible error');
                    };
                };
                if (lastNode !== undefined) {
                    if (graph.nodes[1] !== undefined) {
                        graph.addArc(lastNode, graph.nodes[1])
                    } else {
                        throw new Error('#srv.tps.prs.002: ' + 'parsing text failed - impossible error');
                    };
                    lastNode = undefined;
                };
            };
    
            return graph;

        };

    };

};