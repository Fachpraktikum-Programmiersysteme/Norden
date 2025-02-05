import {Injectable} from '@angular/core';

import {GraphGraphicsConfig} from '../classes/display/graph-graphics.config';

import {Graph} from '../classes/graph-representation/graph';
import {Node} from '../classes/graph-representation/node';
import {Arc} from '../classes/graph-representation/arc';

@Injectable({
    providedIn: 'root'
})
export class XesParserService {

    /* methods : constructor */

    public constructor(private _graphicsConfig : GraphGraphicsConfig) {}

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

        let traceCount : number = 0;

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
            throw new Error('#srv.xps.ini.000: ' + 'parsing .xes-file failed - addition of start node failed');
        };
        if (endNodeAdded[0]) {
            endNode = endNodeAdded[2];
            graph.endNode = endNode;
        } else {
            throw new Error('#srv.xps.ini.001: ' + 'parsing .xes-file failed - addition of end node failed');
        };

        dfgNodesArray.push(startNode);
        dfgNodesArray.push(endNode);

        try {

            for (const line of inXesString.split(/[\r\n]+/)){
                currentLine++;
                switch (line.trim()) {
                    case '<trace>' : {
                        if (closedLogFlag) {
                            throw new Error('#srv.xps.opt.000: ' + 'parsing .xes-file failed - could not parse .xes-format correctly - tried to open Trace in line ' + currentLine + ' after Log was closed in line ' + closedLogLine);
                        } else if (openedTraceFlag) {
                            throw new Error('#srv.xps.opt.001: ' + 'parsing .xes-file failed - could not parse .xes-format correctly - tried to open Trace in line ' + currentLine + ' before closing Trace opened in line ' + openedTraceLine);
                        } else if (openedEventFlag) {
                            throw new Error('#srv.xps.opt.002: ' + 'parsing .xes-file failed - could not parse .xes-format correctly - tried to open Trace in line ' + currentLine + ' before closing Event opened in line ' + openedEventLine);
                        } else {
                            openedTraceFlag = true;
                            openedTraceLine = currentLine;
                            graphTraceArray = [];
                            graphTraceArray.push(startNode);
                            dfgTraceArray = [];
                            dfgTraceArray.push(startNode);
                            lastNode = startNode;
                            currentNode = undefined;
                            incompleteEvents = {};
                        };
                        break;
                    }
                    case '<event>' : {
                        if (closedLogFlag) {
                            throw new Error('#srv.xps.ope.000: ' + 'parsing .xes-file failed - could not parse .xes-format correctly - tried to open Event in line ' + currentLine + ' after Log was closed in line ' + closedLogLine);
                        } else if (!openedTraceFlag) {
                            throw new Error('#srv.xps.ope.001: ' + 'parsing .xes-file failed - could not parse .xes-format correctly - tried to open Event in line ' + currentLine + ' while no Trace was open (last Trace was opened in line ' + openedTraceLine + ' and closed in line ' + closedTraceLine +')');
                        } else if (openedEventFlag) {
                            throw new Error('#srv.xps.ope.002: ' + 'parsing .xes-file failed - could not parse .xes-format correctly - tried to open Event in line ' + currentLine + ' before closing Event opened in line ' + openedEventLine);
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
                            throw new Error('#srv.xps.cle.000: ' + 'parsing .xes-file failed - could not parse .xes-format correctly - tried to close Event in line ' + currentLine + ' after Log was closed in line ' + closedLogLine);
                        } else if (!openedTraceFlag) {
                            throw new Error('#srv.xps.cle.001: ' + 'parsing .xes-file failed - could not parse .xes-format correctly - tried to close Event in line ' + currentLine + ' while no Trace was open (last Trace was opened in line ' + openedTraceLine + ' and closed in line ' + closedTraceLine +')');
                        } else if (!openedEventFlag) {
                            throw new Error('#srv.xps.cle.002: ' + 'parsing .xes-file failed - could not parse .xes-format correctly - tried to close Event in line ' + currentLine + ' while no Event was open (last Event was opened in line ' + openedEventLine + ' and closed in line ' + closedEventLine +')');
                        } else {
                            openedEventFlag = false;
                            closedEventLine = currentLine;
                            if (eventName === undefined) {
                                throw new Error('#srv.xps.cle.003: ' + 'parsing .xes-file failed - found an event without a defined identifier (opened: line ' + openedEventLine + ', closed: line ' + closedEventLine + ')');
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
                                        throw new Error('#srv.xps.cle.004: ' + 'parsing .xes-file failed - found event without lifecycle attribute, occurred ' + incompleteEvents[eventName] + ' in trace containing lifecycle attribute !== \'complete\' (event was opened in line ' + openedEventLine + ', and closed in line ' + closedEventLine + ')');
                                    };
                                };
                            };
                            const nodeAdded : [boolean, number, Node] = graph.addNode('event', eventName);
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
                                throw new Error('#srv.xps.cle.005: ' + 'parsing .xes-file failed - impossible error');
                            };
                            lastNode = currentNode;
                            currentNode = undefined;
                        };
                        break;
                    }
                    case '</trace>' : {
                        if (closedLogFlag) {
                            throw new Error('#srv.xps.clt.000: ' + 'parsing .xes-file failed - could not parse .xes-format correctly - tried to close Trace in line ' + currentLine + ' after Log was closed in line ' + closedLogLine);
                        } else if (!openedTraceFlag) {
                            throw new Error('#srv.xps.clt.001: ' + 'parsing .xes-file failed - could not parse .xes-format correctly - tried to close Trace in line ' + currentLine + ' while no Trace was open (last Trace was opened in line ' + openedTraceLine + ' and closed in line ' + closedTraceLine +')');
                        } else if (openedEventFlag) {
                            throw new Error('#srv.xps.clt.002: ' + 'parsing .xes-file failed - could not parse .xes-format correctly - tried to close Trace in line ' + currentLine + ' before closing Event opened in line ' + openedEventLine);
                        } else {
                            openedTraceFlag = false;
                            closedTraceLine = currentLine;
                            if (graphTraceArray.length !== dfgTraceArray.length) {
                                throw new Error('#srv.xps.clt.003: ' + 'parsing .xes-file failed - trace size of graph and initial dfg are not equal');
                            };
                            if (graphTraceArray.length === 1) {
                                if (lastNode !== startNode) {
                                    throw new Error('#srv.xps.clt.004: ' + 'parsing .xes-file failed - trace size is one, but last node is not the start node');
                                };
                                if (emptyTraceCount === 0) {
                                    if (emptyTraceTauNode !== undefined) {
                                        throw new Error('#srv.xps.clt.005: ' + 'parsing .xes-file failed - number of empty traces found is still zero, but the transition meant to represent empty traces has already been assigned');
                                    };
                                    const tauAdded : [boolean, number, Node] = graph.addNode('support', 'tau', 850, 300);
                                    if (tauAdded[0]) {
                                        emptyTraceTauNode = tauAdded[2];
                                        dfgNodesArray.push(emptyTraceTauNode);
                                    } else {
                                        throw new Error('#srv.xps.clt.006: ' + 'parsing .xes-file failed - transition representing empty trace could not be added');
                                    };
                                    const arcToTauAdded : [boolean, number, Arc] = graph.addArc(lastNode, emptyTraceTauNode);
                                    if (arcToTauAdded[0]) {
                                        dfgArcsArray.push(arcToTauAdded[2]);
                                    } else {
                                        throw new Error('#srv.xps.clt.007: ' + 'parsing .xes-file failed - arc to new tau transition could not be added');
                                    };
                                    const arcFromTauAdded : [boolean, number, Arc] = graph.addArc(emptyTraceTauNode, endNode);
                                    if (arcFromTauAdded[0]) {
                                        dfgArcsArray.push(arcFromTauAdded[2]);
                                    } else {
                                        throw new Error('#srv.xps.clt.008: ' + 'parsing .xes-file failed - arc from new tau transition could not be added');
                                    };
                                } else if (emptyTraceCount > 0) {
                                    if (emptyTraceTauNode === undefined) {
                                        throw new Error('#srv.xps.clt.009: ' + 'parsing .xes-file failed - at least one empty trace has been found, but the transition meant to represent empty traces has not been assigned correctly and is undefined');
                                    } else {
                                        graph.addArc(lastNode, emptyTraceTauNode);
                                        graph.addArc(emptyTraceTauNode, endNode);
                                    };
                                } else {
                                    throw new Error('#srv.xps.clt.010: ' + 'parsing .xes-file failed - number of empty traces found is less than zero');
                                };
                                graphTraceArray.push(emptyTraceTauNode, endNode);
                                graphLogArray.push(graphTraceArray);
                                dfgTraceArray.push(emptyTraceTauNode, endNode);
                                dfgLogArray.push(dfgTraceArray);
                                emptyTraceCount++;
                            } else if (graphTraceArray.length > 1) {
                                if (lastNode !== undefined) {
                                    if (lastNode !== startNode) {
                                        graphTraceArray.push(endNode);
                                        graphLogArray.push(graphTraceArray);
                                        dfgTraceArray.push(endNode);
                                        dfgLogArray.push(dfgTraceArray);
                                        const arcAdded : [boolean, number, Arc] = graph.addArc(lastNode, endNode);
                                        if (arcAdded[0]) {
                                            dfgArcsArray.push(arcAdded[2]);
                                        };
                                    } else {
                                        throw new Error('#srv.xps.clt.011: ' + 'parsing .xes-file failed - trace size is larger than one, but last node is the start node');
                                    };
                                } else {
                                    throw new Error('#srv.xps.clt.012: ' + 'parsing .xes-file failed - trace size is larger than one, but last node is undefined');
                                };
                            };
                            let incomplete : number = 0;
                            for (const event in incompleteEvents) {
                                if (incompleteEvents[event] !== 0) {
                                    incomplete++;
                                    throw new Error('#srv.xps.clt.013: ' + 'parsing .xes-file failed - event "' + event + '" occurred ' + incompleteEvents[event] + ' times in trace without reaching completion');
                                };
                            };
                            if (incomplete !== 0) {
                                throw new Error('#srv.xps.clt.014: ' + 'parsing .xes-file failed - found ' + incomplete + ' events in current trace that contain a lifecycle attribute, but were never logged as complete (trace was opened in line ' + openedTraceLine + ', see event details above)');
                            };
                            lastNode = undefined;
                            currentNode = undefined;
                            traceCount++;
                        };
                        break;
                    }
                    case '</log>' : {
                        if (closedLogFlag) {
                            throw new Error('#srv.xps.cll.000: ' + 'parsing .xes-file failed - could not parse .xes-format correctly - tried to close Log in line ' + currentLine + ' after Log was closed in line ' + closedLogLine);
                        } else if (openedTraceFlag) {
                            throw new Error('#srv.xps.cll.001: ' + 'parsing .xes-file failed - could not parse .xes-format correctly - tried to close Log in line ' + currentLine + ' before closing Trace opened in line ' + openedEventLine);
                        } else if (openedEventFlag) {
                            throw new Error('#srv.xps.cll.002: ' + 'parsing .xes-file failed - could not parse .xes-format correctly - tried to close Log in line ' + currentLine + ' before closing Event opened in line ' + openedEventLine);
                        } else {
                            closedLogFlag = true;
                            closedLogLine = currentLine;
                        };
                        break;
                    }
                    default : {
                        if  (!closedLogFlag && openedTraceFlag && openedEventFlag) {
                            if (line.includes('<string key="concept:name" value="') && line.includes('"/>')) {
                                const foo : string[] = line.split('<string key="concept:name" value="');
                                const bar : string[] = foo[1].split('"/>');
                                eventName = bar[0];
                            } else if (line.includes('string key="lifecycle:transition" value="') && line.includes('"/>')) {
                                const foo : string[] = line.split('<string key="lifecycle:transition" value="');
                                const bar : string[] = foo[1].split('"/>');
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
            console.log(' >> parsing of input xes finished');
            console.log('    >> found ' + graph.nodeCount + ' nodes (' + graph.nodes.length + ' in array) {{' + graph.supportCount + ' supports, ' + graph.eventCount + ' events, ' + graph.placeCount + ' places, ' + graph.transitionCount + ' transitions}} and ' + graph.arcCount + ' arcs (' + graph.arcs.length + ' in array)');
            console.log('    >> length of logArray : ' + graphLogArray.length);
            let maxLength = 0;
            for (const trace of graphLogArray) {
                if (trace.length > maxLength) {
                    maxLength = trace.length;
                };
            };
            console.log('    >> max length of eventArray : ' + maxLength);
            console.log('    >> found ' + emptyTraceCount + ' empty traces');
            /* to be removed - end*/

            if (traceCount > 0) {
                if (emptyTraceCount === 0) {
                    if (graph.nodes.length !== dfgNodesArray.length) {
                        throw new Error('#srv.xps.end.000: ' + 'parsing .xes-file failed - node count of graph and initial dfg do not match');
                    };
                    if (graph.arcs.length !== dfgArcsArray.length) {
                        throw new Error('#srv.xps.end.001: ' + 'parsing .xes-file failed - arc count of graph and initial dfg do not match');
                    };
                    if (graphLogArray.length !== dfgLogArray.length) {
                        throw new Error('#srv.xps.end.002: ' + 'parsing .xes-file failed - log size of graph and initial dfg do not match');
                    };
                } else if (emptyTraceCount > 0) {
                    if (emptyTraceCount === traceCount) {
                        graph.logArray = graphLogArray;
                        try {
                            return this.convertGraph(graph);
                        } catch (error) {
                            throw new Error('conversion of empty graph failed - ' + error);
                        };
                    } else if (emptyTraceCount > traceCount) {
                        throw new Error('#srv.xps.end.003: ' + 'parsing .xes-file failed - number of empty traces found is higher than number of total traces found');
                    };
                    if (graph.nodes.length !== (dfgNodesArray.length + 1)) {
                        throw new Error('#srv.xps.end.004: ' + 'parsing .xes-file failed - node count of graph and initial dfg do not match');
                    };
                    if (graph.arcs.length !== (dfgArcsArray.length + 2)) {
                        throw new Error('#srv.xps.end.005: ' + 'parsing .xes-file failed - arc count of graph and initial dfg do not match');
                    };
                    if (graphLogArray.length !== (dfgLogArray.length + emptyTraceCount)) {
                        throw new Error('#srv.xps.end.006: ' + 'parsing .xes-file failed - log size of graph and initial dfg do not match');
                    };
                } else {
                    throw new Error('#srv.xps.end.007: ' + 'parsing .xes-file failed - number of empty traces found is less than zero');
                };
                graph.appendDFG(startNode, endNode, dfgNodesArray, dfgArcsArray, dfgLogArray);
                graph.logArray = graphLogArray;
                return graph;
            } else if (traceCount === 0) {
                if (emptyTraceCount !== traceCount) {
                    throw new Error('#srv.xps.end.008: ' + 'parsing .xes-file failed - number of traces found zero, but number of empty traces found is not');
                };
                return new Graph;
            } else {
                throw new Error('#srv.xps.end.009: ' + 'parsing .xes-file failed - number of traces found is less than zero');
            };

        } catch (error) {

            console.error(error);

            return new Graph;

        };

    };

    private convertGraph(inOutEmptyGraph : Graph): Graph {

        /* initializing variables */

        const startNode : Node | undefined = inOutEmptyGraph.nodes[0];
        const endNode : Node | undefined = inOutEmptyGraph.nodes[1];
        const middleNode : Node | undefined = inOutEmptyGraph.nodes[2];
        const startArc : Arc = inOutEmptyGraph.arcs[0];
        const endArc : Arc = inOutEmptyGraph.arcs[1];

        /* checking whether the given graph is minimal and empty */

        if (inOutEmptyGraph.nodes.length !== 3) {
            throw new Error('#srv.xps.cvg.000');
        };
        if (inOutEmptyGraph.arcs.length !== 2) {
            throw new Error('#srv.xps.cvg.001');
        };
        if (inOutEmptyGraph.dfgArray.length !== 1) {
            throw new Error('#srv.xps.cvg.002');
        };
        if (startNode === undefined) {
            throw new Error('#srv.xps.cvg.003');
        };
        if (startNode.type !== 'support') {
            throw new Error('#srv.xps.cvg.004');
        };
        if (startNode.label !== 'play') {
            throw new Error('#srv.xps.cvg.005');
        };
        if (middleNode === undefined) {
            throw new Error('#srv.xps.cvg.006');
        };
        if (middleNode.type !== 'support') {
            throw new Error('#srv.xps.cvg.007');
        };
        if (middleNode.label !== 'tau') {
            throw new Error('#srv.xps.cvg.008');
        };
        if (endNode === undefined) {
            throw new Error('#srv.xps.cvg.009');
        };
        if (endNode.type !== 'support') {
            throw new Error('#srv.xps.cvg.010');
        };
        if (endNode.label !== 'stop') {
            throw new Error('#srv.xps.cvg.011');
        };
        if (startArc.source !== startNode) {
            throw new Error('#srv.xps.cvg.012');
        };
        if (startArc.target !== middleNode) {
            throw new Error('#srv.xps.cvg.013');
        };
        if (endArc.source !== middleNode) {
            throw new Error('#srv.xps.cvg.014');
        };
        if (endArc.target !== endNode) {
            throw new Error('#srv.xps.cvg.015');
        };
        if (startArc.weight !== endArc.weight) {
            throw new Error('#srv.xps.cvg.016');
        };

        /* creating replacement nodes */

        const startPlaceOneAdded : [boolean, number, Node] = inOutEmptyGraph.addNode('place', '', 850, 100);
        if (!(startPlaceOneAdded[0])) {
            throw new Error('#srv.xps.cvg.017');
        };
        const startPlaceOne : Node = startPlaceOneAdded[2];
        const startTransitionAdded : [boolean, number, Node] = inOutEmptyGraph.addNode('transition', startNode.label, 850, 150);
        if (!(startTransitionAdded[0])) {
            throw new Error('#srv.xps.cvg.018');
        };
        const startTransition : Node = startTransitionAdded[2];
        const startPlaceTwoAdded : [boolean, number, Node] = inOutEmptyGraph.addNode('place', '', 850, 200);
        if (!(startPlaceTwoAdded[0])) {
            throw new Error('#srv.xps.cvg.019');
        };
        const startPlaceTwo : Node = startPlaceTwoAdded[2];

        const middleTransitionAdded : [boolean, number, Node] = inOutEmptyGraph.addNode('transition', '', 850, 300);
        if (!(middleTransitionAdded[0])) {
            throw new Error('#srv.xps.cvg.020');
        };
        const middleTransition : Node = middleTransitionAdded[2];

        const endPlaceOneAdded : [boolean, number, Node] = inOutEmptyGraph.addNode('place', '', 850, 400);
        if (!(endPlaceOneAdded[0])) {
            throw new Error('#srv.xps.cvg.021');
        };
        const endPlaceOne : Node = endPlaceOneAdded[2];
        const endTransitionAdded : [boolean, number, Node] = inOutEmptyGraph.addNode('transition', endNode.label, 850, 450);
        if (!(endTransitionAdded[0])) {
            throw new Error('#srv.xps.cvg.022');
        };
        const endTransition : Node = endTransitionAdded[2];
        const endPlaceTwoAdded : [boolean, number, Node] = inOutEmptyGraph.addNode('place', '', 850, 500);
        if (!(endPlaceTwoAdded[0])) {
            throw new Error('#srv.xps.cvg.023');
        };
        const endPlaceTwo : Node = endPlaceTwoAdded[2];

        startTransition.special = true;
        middleTransition.special = true;
        endTransition.special = true;
        
        /* creating replacement arcs */

        const startArcOneAdded : [boolean, number, Arc] = inOutEmptyGraph.addArc(startPlaceOne, startTransition, startArc.weight);
        if (!(startArcOneAdded[0])) {
            throw new Error('#srv.xps.cvg.024');
        };
        const startArcTwoAdded : [boolean, number, Arc] = inOutEmptyGraph.addArc(startTransition, startPlaceTwo, startArc.weight);
        if (!(startArcTwoAdded[0])) {
            throw new Error('#srv.xps.cvg.025');
        };

        const middleArcOneAdded : [boolean, number, Arc] = inOutEmptyGraph.addArc(startPlaceTwo, middleTransition, startArc.weight);
        if (!(middleArcOneAdded[0])) {
            throw new Error('#srv.xps.cvg.026');
        };
        const middleArcTwoAdded : [boolean, number, Arc] = inOutEmptyGraph.addArc(middleTransition, endPlaceOne, endArc.weight);
        if (!(middleArcTwoAdded[0])) {
            throw new Error('#srv.xps.cvg.027');
        };

        const endArcOneAdded : [boolean, number, Arc] = inOutEmptyGraph.addArc(endPlaceOne, endTransition, endArc.weight);
        if (!(endArcOneAdded[0])) {
            throw new Error('#srv.xps.cvg.028');
        };
        const endArcTwoAdded : [boolean, number, Arc] = inOutEmptyGraph.addArc(endTransition, endPlaceTwo, endArc.weight);
        if (!(endArcTwoAdded[0])) {
            throw new Error('#srv.xps.cvg.029');
        };

        /* deleting graph dfgs */

        for (const dfg of inOutEmptyGraph.dfgArray) {
            const dfgDeleted : boolean = inOutEmptyGraph.deleteDFG(dfg);
            if (!(dfgDeleted)) {
                throw new Error('#srv.xps.cvg.030');
            };
        };

        /* updating graph event log */

        for (const trace of inOutEmptyGraph.logArray) {
            for (let evIdx = 0; evIdx < trace.length; evIdx++) {
                if (trace[evIdx] === startNode) {
                    if (trace[evIdx + 1] === middleNode) {
                        trace.splice(evIdx, 1, startPlaceOne, startTransition, startPlaceTwo);
                        evIdx = (evIdx + 2);
                    } else {
                        throw new Error('#srv.xps.cvg.031');
                    };
                };
                if (trace[evIdx] === middleNode) {
                    if (trace[evIdx - 1] === startPlaceTwo) {
                        trace.splice(evIdx, 1, middleTransition);
                    } else {
                        throw new Error('#srv.xps.cvg.032');
                    };
                };
                if (trace[evIdx] === endNode) {
                    if (trace[evIdx - 1] === middleTransition) {
                        trace.splice(evIdx, 1, endPlaceOne, endTransition, endPlaceTwo);
                        evIdx = (evIdx + 2);
                    } else {
                        throw new Error('#srv.xps.cvg.033');
                    };
                };
            };
        };

        /* updating references */

        inOutEmptyGraph.startNode = startPlaceOne;

        inOutEmptyGraph.endNode = endPlaceTwo;

        /* deleting replaced endpoints and updating references */

        if (!(inOutEmptyGraph.deleteNode(startNode))) {
            throw new Error('#srv.xps.cvg.034');
        };

        if (!(inOutEmptyGraph.deleteNode(middleNode))) {
            throw new Error('#srv.xps.cvg.035');
        };

        if (!(inOutEmptyGraph.deleteNode(endNode))) {
            throw new Error('#srv.xps.cvg.036');
        };

        /* deleting replaced endpoints and updating references */

        if (!(inOutEmptyGraph.deleteArc(startArc))) {
            throw new Error('#srv.xps.cvg.037');
        };

        if (!(inOutEmptyGraph.deleteArc(endArc))) {
            throw new Error('#srv.xps.cvg.038');
        };

        /* returning updated graph */

        return inOutEmptyGraph;

    };

};