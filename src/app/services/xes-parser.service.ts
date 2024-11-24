// import fs from 'fs';
// import readline from 'readline';

import {Injectable} from '@angular/core';

import {Graph} from '../classes/graph-representation/graph';
import {Node} from '../classes/graph-representation/node';

@Injectable({
    providedIn: 'root'
})
export class XesParserService {

    /* methods : constructor */

    public constructor() {}

    /* methods : other */

    public parse(inXesString : string): Graph {

        let currentLine : number = 0;
    
        let openedTraceLine : number | undefined = undefined;
        let openedEventLine : number | undefined = undefined;
        let closedEventLine : number | undefined = undefined;
        let closedTraceLine : number | undefined = undefined;
        let closedLogLine : number | undefined = undefined;
    
        let openedTraceFlag : boolean = false;
        let openedEventFlag : boolean = false;
        let closedLogFlag : boolean = false;

        let unnamedEvents : number = 0;
    
        let eventName : string | undefined = undefined;
        let eventLifecycle : string | undefined = undefined;

        /* to be removed - start*/
        let eventsArray : string[] = [];
        let tracesArray : string[][] = [];
        /* to be removed - end*/

        let noEvent : boolean = true;
    
        let currentNode : Node | undefined = undefined;
        let lastNode : Node | undefined = undefined;

        const startNode : Node = new Node(0, 'support', 'play', 850, 50);
        const endNode : Node = new Node(0, 'support', 'stop', 850, 350);

        const graph : Graph = new Graph([startNode, endNode]);

        try {

            for (const line of inXesString.split(/[\r\n]+/)){
                currentLine++;
                /* to be removed - start*/
                // console.log(' >> starting to parse line ' + currentLine);
                /* to be removed - end*/
                switch (line) {
                    case '	<trace>' : {
                        if (closedLogFlag) {
                            throw new Error('#srv.xps.opt.000: ' + 'reading from .xes-file failed - could not parse .xes-format correctly - tried to open Trace in line ' + currentLine + ' after Log was closed in line ' + closedLogLine);
                        } else if (openedTraceFlag) {
                            throw new Error('#srv.xps.opt.001: ' + 'reading from .xes-file failed - could not parse .xes-format correctly - tried to open Trace in line ' + currentLine + ' before closing Trace opened in line ' + openedTraceLine);
                        } else if (openedEventFlag) {
                            throw new Error('#srv.xps.opt.002: ' + 'reading from .xes-file failed - could not parse .xes-format correctly - tried to open Trace in line ' + currentLine + ' before closing Event opened in line ' + openedEventLine);
                        } else {
                            openedTraceFlag = true;
                            openedTraceLine = currentLine;
                            /* to be removed - start*/
                            eventsArray = [];
                            /* to be removed - end*/
                        };
                        break;
                    }
                    case '		<event>' : {
                        if (closedLogFlag) {
                            throw new Error('#srv.xps.ope.000: ' + 'reading from .xes-file failed - could not parse .xes-format correctly - tried to open Event in line ' + currentLine + ' after Log was closed in line ' + closedLogLine);
                        } else if (!openedTraceFlag) {
                            throw new Error('#srv.xps.ope.001: ' + 'reading from .xes-file failed - could not parse .xes-format correctly - tried to open Event in line ' + currentLine + ' while no Trace was open (last Trace was opened in line ' + openedTraceLine + ' and closed in line ' + closedTraceLine +')');
                        } else if (openedEventFlag) {
                            throw new Error('#srv.xps.ope.002: ' + 'reading from .xes-file failed - could not parse .xes-format correctly - tried to open Event in line ' + currentLine + ' before closing Event opened in line ' + openedEventLine);
                        } else {
                            openedEventFlag = true;
                            openedEventLine = currentLine;
                            eventName = undefined;
                            eventLifecycle = undefined;
                        };
                        break;
                    }
                    case '		</event>' : {
                        if (closedLogFlag) {
                            throw new Error('#srv.xps.cle.000: ' + 'reading from .xes-file failed - could not parse .xes-format correctly - tried to close Event in line ' + currentLine + ' after Log was closed in line ' + closedLogLine);
                        } else if (!openedTraceFlag) {
                            throw new Error('#srv.xps.cle.001: ' + 'reading from .xes-file failed - could not parse .xes-format correctly - tried to close Event in line ' + currentLine + ' while no Trace was open (last Trace was opened in line ' + openedTraceLine + ' and closed in line ' + closedTraceLine +')');
                        } else if (!openedEventFlag) {
                            throw new Error('#srv.xps.cle.002: ' + 'reading from .xes-file failed - could not parse .xes-format correctly - tried to close Event in line ' + currentLine + ' while no Event was open (last Event was opened in line ' + openedEventLine + ' and closed in line ' + closedEventLine +')');
                        } else {
                            openedEventFlag = false;
                            closedEventLine = currentLine;
                            if (eventName === undefined) {
                                unnamedEvents++;
                                eventName = ('undefined_event_name__' + unnamedEvents.toString());
                            };
                            let eventLabel : string;
                            if (eventLifecycle !== undefined) {
                                eventLabel = (eventName + '_' + eventLifecycle);
                            } else {
                                eventLabel = (eventName);
                            };
                            /* to be removed - start*/
                            eventsArray.push(eventLabel);
                            /* to be removed - end*/
                            let nodeAdded : [boolean, number] = graph.addNode('event', eventLabel);
                            currentNode = graph.nodes[nodeAdded[1]];
                            noEvent = false;
                            if (currentNode !== undefined) {
                                if (lastNode !== undefined) {
                                    graph.addArc(lastNode, currentNode);
                                } else {
                                    if (graph.nodes[0] !== undefined) {
                                        graph.addArc(graph.nodes[0], currentNode)
                                    } else {
                                        throw new Error('#srv.xps.cle.004: ' + 'reading from .xes-file failed - impossible error');
                                    };
                                };
                                lastNode = currentNode;
                                currentNode = undefined;
                            } else {
                                throw new Error('#srv.xps.cle.005: ' + 'reading from .xes-file failed - impossible error');
                            };
                        };
                        break;
                    }
                    case '	</trace>' : {
                        if (closedLogFlag) {
                            throw new Error('#srv.xps.clt.000: ' + 'reading from .xes-file failed - could not parse .xes-format correctly - tried to close Trace in line ' + currentLine + ' after Log was closed in line ' + closedLogLine);
                        } else if (!openedTraceFlag) {
                            throw new Error('#srv.xps.clt.001: ' + 'reading from .xes-file failed - could not parse .xes-format correctly - tried to close Trace in line ' + currentLine + ' while no Trace was open (last Trace was opened in line ' + openedTraceLine + ' and closed in line ' + closedTraceLine +')');
                        } else if (openedEventFlag) {
                            throw new Error('#srv.xps.clt.002: ' + 'reading from .xes-file failed - could not parse .xes-format correctly - tried to close Trace in line ' + currentLine + ' before closing Event opened in line ' + openedEventLine);
                        } else {
                            openedTraceFlag = false;
                            closedTraceLine = currentLine;
                            /* to be removed - start*/
                            tracesArray.push(eventsArray);
                            /* to be removed - end*/
                            if (lastNode !== undefined) {
                                if (graph.nodes[1] !== undefined) {
                                    graph.addArc(lastNode, graph.nodes[1])
                                } else {
                                    throw new Error('#srv.xps.clt.003: ' + 'reading from .xes-file failed - impossible error');
                                };
                                lastNode = undefined;
                            };
                        };
                        break;
                    }
                    case '</log>' : {
                        if (closedLogFlag) {
                            throw new Error('#srv.xps.cll.000: ' + 'reading from .xes-file failed - could not parse .xes-format correctly - tried to close Log in line ' + currentLine + ' after Log was closed in line ' + closedLogLine);
                        } else if (openedTraceFlag) {
                            throw new Error('#srv.xps.cll.001: ' + 'reading from .xes-file failed - could not parse .xes-format correctly - tried to close Log in line ' + currentLine + ' before closing Trace opened in line ' + openedEventLine);
                        } else if (openedEventFlag) {
                            throw new Error('#srv.xps.cll.002: ' + 'reading from .xes-file failed - could not parse .xes-format correctly - tried to close Log in line ' + currentLine + ' before closing Event opened in line ' + openedEventLine);
                        } else {
                            closedLogFlag = true;
                            closedLogLine = currentLine;
                        };
                        break;
                    }
                    default : {
                        if  (!closedLogFlag && openedTraceFlag && openedEventFlag) {
                            if (line.includes('<string key="concept:name" value="') && line.includes('"/>')) {
                                let foo : string[] = line.split('<string key="concept:name" value="')
                                let bar : string[] = foo[1].split('"/>')
                                eventName = bar[0];
                            } else if (line.includes('string key="lifecycle:transition" value="') && line.includes('"/>')) {
                                let foo : string[] = line.split('<string key="lifecycle:transition" value="')
                                let bar : string[] = foo[1].split('"/>')
                                eventLifecycle = bar[0];
                            } else {
                                /* line does not include name or lifecycle of currently opened event --> skip line */
                            };
                        } else {
                            /* log, trace, event or multiple are closed --> skip line */
                        };
                    };
                };
                /* to be removed - start*/
                // console.log(' >> finished parsing line ' + currentLine);
                /* to be removed - end*/
            };

            /* to be removed - start*/
            console.log(' >> parsing finished - found ' + graph.nodeCount + ' nodes (' + graph.nodes.length + ' in array) {{' + graph.supportCount + ' supports, ' + graph.eventCount + ' events, ' + graph.placeCount + ' places, ' + graph.transitionCount + ' transitions}} and ' + graph.arcCount + ' arcs (' + graph.arcs.length + ' in array)');
            console.log(' >> length of tracesArray : ' + tracesArray.length);
            let maxLength = 0;
            for (const trace of tracesArray) {
                if (trace.length > maxLength) {
                    maxLength = trace.length;
                };
            };
            console.log(' >> max length of eventArray : ' + maxLength);
            /* to be removed - end*/

            if (noEvent) {
                if (graph.nodes[0] !== undefined) {
                    if (graph.nodes[1] !== undefined) {
                        graph.addArc(graph.nodes[0], graph.nodes[1])
                    } else {
                        throw new Error('#srv.xps.fle.000: ' + 'reading from .xes-file failed - impossible error');
                    };
                } else {
                    throw new Error('#srv.xps.fle.001: ' + 'reading from .xes-file failed - impossible error');
                };
            };
            
            return graph;

        } catch (error) {

            console.error('parsing of .xes file failed - ', error);

            return new Graph();

        };

    };

};