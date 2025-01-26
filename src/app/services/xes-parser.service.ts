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

        // let unnamedEvents : number = 0;

        let eventName : string | undefined = undefined;
        let eventLifecycle : string | undefined = undefined;

        let incompleteEvents : {
            [eventName : string] : number
        } = {};

        let noEvent : boolean = true;

        let currentNode : Node | undefined = undefined;
        let lastNode : Node | undefined = undefined;

        let traceArray : Node[] = [];
        const logArray : Node[][] = [];
        const dfgArray : Node[] = [];
        const dfgLogArray : Node[][] = [];
        let dfgTraceArray : Node[] = [];

        const graph : Graph = new Graph();

        const startNodeAdded : [boolean, number, Node] = graph.addNode('support', 'play', 850, 50);
        const endNodeAdded : [boolean, number, Node] = graph.addNode('support', 'stop', 850, 550);

        let startNode : Node;
        let endNode : Node;

        if (startNodeAdded[0]) {
            startNode = startNodeAdded[2];
            graph.startNode = startNode;
        } else {
            throw new Error('#srv.xps.isn.000: ' + 'reading from text file failed - addition of start node failed');
        };
        if (endNodeAdded[0]) {
            endNode = endNodeAdded[2];
            graph.endNode = endNode;
        } else {
            throw new Error('#srv.xps.ien.001: ' + 'reading from text file failed - addition of end node failed');
        };

        dfgArray.push(startNode);
        dfgArray.push(endNode);

        try {

            for (const line of inXesString.split(/[\r\n]+/)){
                currentLine++;
                switch (line.trim()) {
                    case '<trace>' : {
                        if (closedLogFlag) {
                            throw new Error('#srv.xps.opt.000: ' + 'reading from .xes-file failed - could not parse .xes-format correctly - tried to open Trace in line ' + currentLine + ' after Log was closed in line ' + closedLogLine);
                        } else if (openedTraceFlag) {
                            throw new Error('#srv.xps.opt.001: ' + 'reading from .xes-file failed - could not parse .xes-format correctly - tried to open Trace in line ' + currentLine + ' before closing Trace opened in line ' + openedTraceLine);
                        } else if (openedEventFlag) {
                            throw new Error('#srv.xps.opt.002: ' + 'reading from .xes-file failed - could not parse .xes-format correctly - tried to open Trace in line ' + currentLine + ' before closing Event opened in line ' + openedEventLine);
                        } else {
                            openedTraceFlag = true;
                            openedTraceLine = currentLine;
                            traceArray = [];
                            traceArray.push(startNode);
                            dfgTraceArray = [];
                            dfgTraceArray.push(startNode);
                            incompleteEvents = {};
                        };
                        break;
                    }
                    case '<event>' : {
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
                    case '</event>' : {
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
                                throw new Error('#srv.xps.cle.003: ' + 'reading from .xes-file failed - found an event without a defined identifier (opened: line ' + openedEventLine + ', closed: line ' + closedEventLine + ')');
                                // unnamedEvents++;
                                // eventName = ('undefined_event_name__' + unnamedEvents.toString());
                            };
                            if (eventLifecycle !== undefined) {
                                if (eventLifecycle !== 'complete') {
                                    if (incompleteEvents[eventName] !== undefined) {
                                        incompleteEvents[eventName]++;
                                    } else {
                                        incompleteEvents[eventName] = 1;
                                    };
                                    break;
                                } else {
                                    if (incompleteEvents[eventName] !== undefined) {
                                        incompleteEvents[eventName] = 0;
                                    };
                                };
                            } else {
                                if (incompleteEvents[eventName] !== undefined) {
                                    if (incompleteEvents[eventName] !== 0) {
                                        throw new Error('#srv.xps.cle.004: ' + 'reading from .xes-file failed - found event without lifecycle attribute, occurred ' + incompleteEvents[eventName] + ' in trace containing lifecycle attribute !== \'complete\' (event was opened in line ' + openedEventLine + ', and closed in line ' + closedEventLine + ')');
                                    };
                                };
                            };
                            let nodeAdded : [boolean, number, Node] = graph.addNode('event', eventName);
                            currentNode = nodeAdded[2];
                            noEvent = false;
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
                                throw new Error('#srv.xps.cle.006: ' + 'reading from .xes-file failed - impossible error');
                            };
                        };
                        break;
                    }
                    case '</trace>' : {
                        if (closedLogFlag) {
                            throw new Error('#srv.xps.clt.000: ' + 'reading from .xes-file failed - could not parse .xes-format correctly - tried to close Trace in line ' + currentLine + ' after Log was closed in line ' + closedLogLine);
                        } else if (!openedTraceFlag) {
                            throw new Error('#srv.xps.clt.001: ' + 'reading from .xes-file failed - could not parse .xes-format correctly - tried to close Trace in line ' + currentLine + ' while no Trace was open (last Trace was opened in line ' + openedTraceLine + ' and closed in line ' + closedTraceLine +')');
                        } else if (openedEventFlag) {
                            throw new Error('#srv.xps.clt.002: ' + 'reading from .xes-file failed - could not parse .xes-format correctly - tried to close Trace in line ' + currentLine + ' before closing Event opened in line ' + openedEventLine);
                        } else {
                            openedTraceFlag = false;
                            closedTraceLine = currentLine;
                            traceArray.push(endNode);
                            logArray.push(traceArray);
                            dfgTraceArray.push(endNode);
                            dfgLogArray.push(dfgTraceArray);
                            if (lastNode !== undefined) {
                                graph.addArc(lastNode, endNode)
                                lastNode = undefined;
                            };
                            let incomplete : number = 0;
                            for (const event in incompleteEvents) {
                                if (incompleteEvents[event] !== 0) {
                                    incomplete++;
                                    throw new Error('#srv.xps.clt.003: ' + 'reading from .xes-file failed - event "' + event + '" occurred ' + incompleteEvents[event] + ' times in trace without reaching completion');
                                };
                            };
                            if (incomplete !== 0) {
                                throw new Error('#srv.xps.clt.004: ' + 'reading from .xes-file failed - found ' + incomplete + ' events in current trace that contain a lifecycle attribute, but were never logged as complete (trace was opened in line ' + openedTraceLine + ', see event details above)');
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
                                let foo : string[] = line.split('<string key="concept:name" value="');
                                let bar : string[] = foo[1].split('"/>');
                                eventName = bar[0];
                            } else if (line.includes('string key="lifecycle:transition" value="') && line.includes('"/>')) {
                                let foo : string[] = line.split('<string key="lifecycle:transition" value="');
                                let bar : string[] = foo[1].split('"/>');
                                eventLifecycle = bar[0];
                            } else {
                                /* line does not include name or lifecycle of currently opened event --> skip line */
                            };
                        } else {
                            /* log, trace, event or multiple are closed --> skip line */
                        };
                    };
                };
            };

            /* to be removed - start*/
            console.log(' >> parsing of input xes finished - found ' + graph.nodeCount + ' nodes (' + graph.nodes.length + ' in array) {{' + graph.supportCount + ' supports, ' + graph.eventCount + ' events, ' + graph.placeCount + ' places, ' + graph.transitionCount + ' transitions}} and ' + graph.arcCount + ' arcs (' + graph.arcs.length + ' in array)');
            console.log(' >> length of logArray : ' + logArray.length);
            let maxLength = 0;
            for (const trace of logArray) {
                if (trace.length > maxLength) {
                    maxLength = trace.length;
                };
            };
            console.log(' >> max length of eventArray : ' + maxLength);
            /* to be removed - end*/

            if (noEvent) {
                graph.addArc(startNode, endNode);
            };

            graph.appendDFG(startNode, endNode, dfgArray, graph.arcs, dfgLogArray);

            graph.logArray = logArray;

            return graph;

        } catch (error) {

            console.error('parsing of .xes file failed - ', error);

            return new Graph;

        };

    };

};
