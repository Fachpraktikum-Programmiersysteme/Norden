import {Injectable} from "@angular/core";

import {Coords} from "../classes/file-management/coordinates";
import {JsonGraph} from '../classes/file-management/json-graph';
import {JsonPetriNet} from "../classes/file-management/json-petri-net";

import {Graph} from '../classes/graph-representation/graph';

@Injectable({
    providedIn: 'root'
})
export class FileWriterService {

    /* methods : constructor */

    public constructor() {};

    /* methods : other */

    private graphToJSON(inGraph : Graph) : JsonGraph {
        const jsonGraph : JsonGraph = {
            log: [], 
            supports: [], 
            events: [], 
            places: [], 
            transitions: [], 
            start: '', 
            end: '', 
            arcs: {}, 
            labels: {}, 
            layout: {}, 
            dfgs: {}, 
            special: {}, 
            marked: [{}, {}]
        };
        let nodeId : string;
        let nodeCount : number = 0;
        let supportCount : number = 0;
        let eventCount : number = 0;
        let placeCount : number = 0;
        let transitionCount : number = 0;
        let arcPos : number = 0;
        let arcCount : number = 0;
        let dfgCount : number = 0;
        let eventsArray : string[];
        const tracesArray : string[][] = [];
        const nodeIds : {
            [graphNodeId: number]: string
        } = {};
        const arcIds : {
            [graphArcId: number]: string
        } = {};
        const dfgIds : {
            [dfgId: number]: string
        } = {};
        jsonGraph.log = [];
        jsonGraph.supports = [];
        jsonGraph.events = [];
        jsonGraph.places = [];
        jsonGraph.transitions = [];
        jsonGraph.start = '';
        jsonGraph.end = '';
        jsonGraph.labels = {};
        jsonGraph.arcs = {};
        jsonGraph.layout = {};
        jsonGraph.dfgs = {};
        jsonGraph.special = {};
        jsonGraph.marked = [{}, {}];
        for (const dfg of inGraph.dfgArray) {
            dfgCount++;
            dfgIds[dfg.id] = ('dfg' + dfgCount.toString());
        };
        for (const node of inGraph.nodes) {
            if (node !== undefined) {
                switch (node.type) {
                    case 'support' : {
                        supportCount++;
                        nodeId = ('s' + supportCount.toString());
                        jsonGraph.supports.push(nodeId);
                        jsonGraph.labels[nodeId] = node.label;
                        break;
                    }
                    case 'event' : {
                        eventCount++;
                        nodeId = ('e' + eventCount.toString());
                        jsonGraph.events.push(nodeId);
                        if (!(node.label.includes('undefined_event_name__'))) {
                            jsonGraph.labels[nodeId] = node.label;
                        };
                        break;
                    }
                    case 'place' : {
                        placeCount++;
                        nodeId = ('p' + placeCount.toString());
                        jsonGraph.places.push(nodeId);
                        if (node.label !== '') {
                            jsonGraph.labels[nodeId] = node.label;
                        };
                        break;
                    }
                    case 'transition' : {
                        transitionCount++;
                        nodeId = ('t' + transitionCount.toString());
                        jsonGraph.transitions.push(nodeId);
                        if (!(node.label.includes('undefined_transition_label__'))) {
                            jsonGraph.labels[nodeId] = node.label;
                        };
                        if (node.special) {
                            jsonGraph.special[nodeId] = true;
                        };
                        break;
                    };
                };
                jsonGraph.layout[nodeId] = {x: node.x, y: node.y};
                if (node.marked) {
                    jsonGraph.marked[0][nodeId] = true;
                };
                nodeIds[node.id] = nodeId;
                nodeCount++;
            } else {
                /* skip undefined entry in node array */
            };
        };
        if (nodeCount !== inGraph.nodeCount) {
            throw new Error('#srv.jws.toj.000: ' + 'conversion of graph to json failed - number of converted nodes (' + nodeCount + ') is not equal to original number of nodes (' + inGraph.nodeCount + ')');
        };
        if (supportCount !== inGraph.supportCount) {
            throw new Error('#srv.jws.toj.001: ' + 'conversion of graph to json failed - number of converted supports (' + supportCount + ') is not equal to original number of supports (' + inGraph.supportCount + ')');
        };
        if (placeCount !== inGraph.placeCount) {
            throw new Error('#srv.jws.toj.002: ' + 'conversion of graph to json failed - number of converted places (' + placeCount + ') is not equal to original number of places (' + inGraph.placeCount + ')');
        };
        if (transitionCount !== inGraph.transitionCount) {
            throw new Error('#srv.jws.toj.003: ' + 'conversion of graph to json failed - number of converted transitions (' + transitionCount + ') is not equal to original number of transitions (' + inGraph.transitionCount + ')');
        };
        if (inGraph.startNode !== undefined) {
            jsonGraph.start = nodeIds[inGraph.startNode.id];
        };
        if (inGraph.endNode !== undefined) {
            jsonGraph.end = nodeIds[inGraph.endNode.id];
        };
        for (const arc of inGraph.arcs) {
            let arcId : string = (nodeIds[arc.source.id] + ',' + nodeIds[arc.target.id]);
            jsonGraph.arcs[arcId] = arc.weight;
            jsonGraph.layout[arcId] = [{x: arc.source.x, y: arc.source.y}, {x: arc.target.x, y: arc.target.y}];
            if (arc.marked) {
                jsonGraph.marked[1][arcId] = true;
            };
            arcIds[arcPos] = arcId;
            arcPos++;
            arcCount = arcCount + arc.weight;
        };
        if (arcCount !== inGraph.arcCount) {
            throw new Error('#srv.jws.toj.004: ' + 'conversion of graph to json failed - number of converted arcs (' + arcCount + ') is not equal to original number of arcs (' + inGraph.arcCount + ')');
        }
        for (const trace of inGraph.logArray) {
            eventsArray = [];
            for (const event of trace) {
                eventsArray.push(nodeIds[event.id]);
            };
            tracesArray.push(eventsArray);
        };
        jsonGraph.log = tracesArray;
        for (const dfg of inGraph.dfgArray) {
            const dfgID : string = dfgIds[dfg.id];
            jsonGraph.dfgs[dfgID] = [nodeIds[dfg.startNode.id], nodeIds[dfg.endNode.id], [], [], []];
            for (const node of dfg.nodes) {
                jsonGraph.dfgs[dfgID][2].push(nodeIds[node.id]);
            };
            for (let arcID = 0; arcID < dfg.arcs.length; arcID++) {
                jsonGraph.dfgs[dfgID][3].push(arcIds[arcID]);
            };
            for (const trace of dfg.log) {
                const traceArray : string[] = [];
                for (let eventID = 0; eventID < trace.length; eventID++) {
                    traceArray.push(nodeIds[trace[eventID].id]);
                };
                jsonGraph.dfgs[dfgID][4].push(traceArray);
            };
        };
        return jsonGraph;
    };

    private netToJSON(inGraph : Graph) : JsonPetriNet {
        const jsonPetriNet : JsonPetriNet = {
            places: [], 
            transitions: []
        };
        let nodeId : string;
        let nodeCount : number = 0;
        let supportCount : number = 0;
        let eventCount : number = 0;
        let placeCount : number = 0;
        let transitionCount : number = 0;
        let arcCount : number = 0;
        let jpnPlaces : string[] = [];
        let jpnTransitions : string[] = [];
        let jpnArcs : {
            [placeIdPair: string] : number
        } = {};
        let jpnLabels : {
            [transitionId: string]: string
        } = {};
        let jpnLayout : {
            [id_or_idPair: string]: Coords | Coords[]
        } = {};
        let labelFound : boolean = false;
        let nodeIds : {
            [graphNodeId: number]: string
        } = {};
        for (const node of inGraph.nodes) {
            if (node !== undefined) {
                switch (node.type) {
                    case 'support' : {
                        supportCount++;
                        break;
                    }
                    case 'event' : {
                        eventCount++;
                        break;
                    }
                    case 'place' : {
                        placeCount++;
                        nodeId = ('p' + placeCount.toString());
                        jpnPlaces.push(nodeId);
                        /* place labels are not part of the original definition of a JsonPetriNet */
                        // if (!(node.label.includes('undefined_place_label__'))) {
                        //     jpnLabels[nodeId] = node.label;
                        //     labelFound = true;
                        // };
                        jpnLayout[nodeId] = {x: node.x, y: node.y};
                        nodeIds[node.id] = nodeId;
                        break;
                    }
                    case 'transition' : {
                        transitionCount++;
                        nodeId = ('t' + transitionCount.toString());
                        jpnTransitions.push(nodeId);
                        if (!(node.label.includes('undefined_transition_label__'))) {
                            jpnLabels[nodeId] = node.label;
                            labelFound = true;
                        };
                        jpnLayout[nodeId] = {x: node.x, y: node.y};
                        nodeIds[node.id] = nodeId;
                        break;
                    };
                };
                nodeCount++;
            } else {
                /* skip undefined entry in node array */
            };
        };
        if (nodeCount !== inGraph.nodeCount) {
            throw new Error('#srv.jws.ntj.000: ' + 'conversion of graph to json failed - number of converted nodes (' + nodeCount + ') is not equal to original number of nodes (' + inGraph.nodeCount + ')');
        };
        if (supportCount !== inGraph.supportCount) {
            throw new Error('#srv.jws.ntj.001: ' + 'conversion of graph to json failed - number of converted supports (' + supportCount + ') is not equal to original number of supports (' + inGraph.supportCount + ')');
        };
        if (placeCount !== inGraph.placeCount) {
            throw new Error('#srv.jws.ntj.002: ' + 'conversion of graph to json failed - number of converted places (' + placeCount + ') is not equal to original number of places (' + inGraph.placeCount + ')');
        };
        if (transitionCount !== inGraph.transitionCount) {
            throw new Error('#srv.jws.ntj.003: ' + 'conversion of graph to json failed - number of converted transitions (' + transitionCount + ') is not equal to original number of transitions (' + inGraph.transitionCount + ')');
        };
        for (const arc of inGraph.arcs) {
            let arcId : string = (nodeIds[arc.source.id] + ',' + nodeIds[arc.target.id]);
            jpnArcs[arcId] = arc.weight;
            jpnLayout[arcId] = [{x: arc.source.x, y: arc.source.y}, {x: arc.target.x, y: arc.target.y}];
            arcCount = arcCount + arc.weight;
        };
        if (arcCount !== inGraph.arcCount) {
            throw new Error('#srv.jws.ntj.004: ' + 'conversion of graph to json failed - number of converted arcs (' + arcCount + ') is not equal to original number of arcs (' + inGraph.arcCount + ')');
        };
        jsonPetriNet.places = jpnPlaces;
        jsonPetriNet.transitions = jpnTransitions;
        if (inGraph.arcs.length > 0) {
            jsonPetriNet.arcs = jpnArcs;
        };
        if (labelFound) {
            jsonPetriNet.labels = jpnLabels;
        };
        jsonPetriNet.layout = jpnLayout;
        return jsonPetriNet;
    };

    private netToPNML(inGraph : Graph) : string {
        if (inGraph.supportCount !== 0) {
            throw new Error('#srv.jws.ntp.000: ' + 'conversion of graph to pnml failed - graph to be converted contains ' + inGraph.supportCount + ' support nodes (not 0)');
        };
        if (inGraph.eventCount !== 0) {
            throw new Error('#srv.jws.ntp.001: ' + 'conversion of graph to pnml failed - graph to be converted contains ' + inGraph.eventCount + ' event nodes (not 0)');
        };
        if (inGraph.nodeCount !== (inGraph.placeCount + inGraph.transitionCount)) {
            throw new Error('#srv.jws.ntp.002: ' + 'conversion of graph to pnml failed - graph to be converted contains ' + inGraph.nodeCount + ' nodes, which is different from the sum of place nodes (' + inGraph.placeCount + ') & transition nodes (' + inGraph.transitionCount + ')');
        };
        let pnmlString : string = '';
        let placeString : string = '';
        let transitionString : string = '';
        let arcString : string = '';
        let nodeCount : number = 0;
        let supportCount : number = 0;
        let eventCount : number = 0;
        let placeCount : number = 0;
        let transitionCount : number = 0;
        let arcCount : number = 0;
        let arcId : number = 0;
        let nodeIds : {
            [graphNodeId: number]: string
        } = {};
        for (const node of inGraph.nodes) {
            if (node !== undefined) {
                switch (node.type) {
                    case 'support' : {
                        supportCount++;
                        break;
                    }
                    case 'event' : {
                        eventCount++;
                        break;
                    }
                    case 'place' : {
                        placeCount++;
                        nodeIds[node.id] = ('p' + placeCount);
                        placeString = (placeString + '  <place id="p' + placeCount + '">' + '\n');
                        if (!(node.label.includes('undefined_place_label__'))) {
                            placeString = (placeString + '    <name>' + '\n');
                            placeString = (placeString + '      <text>' + '\n');
                            placeString = (placeString + '        ' + node.label + '\n');
                            placeString = (placeString + '      </text>' + '\n');
                            placeString = (placeString + '    </name>' + '\n');
                        };
                        placeString = (placeString + '    <graphics>' + '\n');
                        placeString = (placeString + '      <position x="' + node.x + '" y="' + node.y + '"/>' + '\n');
                        placeString = (placeString + '    </graphics>' + '\n');
                        placeString = (placeString + '    <initialMarking>' + '\n');
                        placeString = (placeString + '      <text>' + '\n');
                        placeString = (placeString + '        0' + '\n');
                        placeString = (placeString + '      </text>' + '\n');
                        placeString = (placeString + '    </initialMarking>' + '\n');
                        placeString = (placeString + '  </place>' + '\n');
                        break;
                    }
                    case 'transition' : {
                        transitionCount++;
                        nodeIds[node.id] = ('t' + transitionCount);
                        transitionString = (transitionString + '  <transition id="t' + transitionCount + '">' + '\n');
                        if (!(node.label.includes('undefined_transition_label__'))) {
                            transitionString = (transitionString + '    <name>' + '\n');
                            transitionString = (transitionString + '      <text>' + '\n');
                            transitionString = (transitionString + '        ' + node.label + '\n');
                            transitionString = (transitionString + '      </text>' + '\n');
                            transitionString = (transitionString + '    </name>' + '\n');
                        };
                        transitionString = (transitionString + '    <graphics>' + '\n');
                        transitionString = (transitionString + '      <position x="' + node.x + '" y="' + node.y + '"/>' + '\n');
                        transitionString = (transitionString + '    </graphics>' + '\n');
                        transitionString = (transitionString + '  </transition>' + '\n');
                        break;
                    };
                };
                nodeCount++;
            } else {
                /* skip undefined entry in node array */
            };
        };
        if (nodeCount !== inGraph.nodeCount) {
            throw new Error('#srv.jws.ntp.003: ' + 'conversion of graph to pnml failed - number of converted nodes (' + nodeCount + ') is not equal to original number of nodes (' + inGraph.nodeCount + ')');
        };
        if (supportCount !== inGraph.supportCount) {
            throw new Error('#srv.jws.ntp.004: ' + 'conversion of graph to pnml failed - number of converted supports (' + supportCount + ') is not equal to original number of supports (' + inGraph.supportCount + ')');
        };
        if (placeCount !== inGraph.placeCount) {
            throw new Error('#srv.jws.ntp.005: ' + 'conversion of graph to pnml failed - number of converted places (' + placeCount + ') is not equal to original number of places (' + inGraph.placeCount + ')');
        };
        if (transitionCount !== inGraph.transitionCount) {
            throw new Error('#srv.jws.ntp.006: ' + 'conversion of graph to pnml failed - number of converted transitions (' + transitionCount + ') is not equal to original number of transitions (' + inGraph.transitionCount + ')');
        };
        for (const arc of inGraph.arcs) {
            arcId++;
            arcString = (arcString + '  <arc id="a' + arcId + '" source="' + nodeIds[arc.source.id] + '" target="' + nodeIds[arc.target.id] + '">' + '\n');
            arcString = (arcString + '    <inscription>' + '\n');
            arcString = (arcString + '      <text>' + '\n');
            arcString = (arcString + '        1' + '\n');
            arcString = (arcString + '      </text>' + '\n');
            arcString = (arcString + '    </inscription>' + '\n');
            arcString = (arcString + '  </arc>' + '\n');
            arcCount = arcCount + arc.weight;
        };
        if (arcCount !== inGraph.arcCount) {
            throw new Error('#srv.jws.ntp.007: ' + 'conversion of graph to pnml failed - number of converted arcs (' + arcCount + ') is not equal to original number of arcs (' + inGraph.arcCount + ')');
        }
        pnmlString = (pnmlString + '<?xml version="1.0" encoding="UTF-8"?>' + '\n');
        pnmlString = (pnmlString + '<pnml>' + '\n');
        pnmlString = (pnmlString + '<net id="unnamed petrinet" type="http://www.pnml.org/version-2009/grammar/pnml">' + '\n');
        pnmlString = (pnmlString + placeString);
        pnmlString = (pnmlString + transitionString);
        pnmlString = (pnmlString + arcString);
        pnmlString = (pnmlString + '</net>' + '\n');
        pnmlString = (pnmlString + '</pnml>');
        return pnmlString;
    };

    public isPetriNet(inGraph : Graph) : boolean {
        if (inGraph.dfgArray.length !== 0) {
            return false;
        } else if (inGraph.supportCount !== 0) {
            return false;
        } else if (inGraph.eventCount !== 0) {
            return false;
        } else if (inGraph.nodeCount !== (inGraph.placeCount + inGraph.transitionCount)) {
            return false;
        } else {
            return true;
        };
    };

    public writeFile(inFileName : string, inGraph : Graph) : void {
        if (this.isPetriNet(inGraph)) {
            const jsonPetriNet : JsonPetriNet = this.netToJSON(inGraph);
            const jsonString : string = JSON.stringify(jsonPetriNet, null, 4);
            const jsonName : string = (inFileName + '.json');
            const jsonFile : File = new File([jsonString], jsonName);
            const jsonLink : HTMLAnchorElement = document.createElement("a");
            jsonLink.href = URL.createObjectURL(jsonFile);
            jsonLink.download = jsonName;
            jsonLink.click();
            jsonLink.remove();
            const pnmlString : string = this.netToPNML(inGraph);
            const pnmlName : string = (inFileName + '.pnml');
            const pnmlFile : File = new File([pnmlString], pnmlName);
            const pnmlLink : HTMLAnchorElement = document.createElement("a");
            pnmlLink.href = URL.createObjectURL(pnmlFile);
            pnmlLink.download = pnmlName;
            pnmlLink.click();
            pnmlLink.remove();
        } else {
            const jsonGraph : JsonGraph = this.graphToJSON(inGraph);
            const jsonString : string = JSON.stringify(jsonGraph, null, 4);
            const jsonName : string = (inFileName + '.json');
            const jsonFile : File = new File([jsonString], jsonName);
            const jsonLink : HTMLAnchorElement = document.createElement("a");
            jsonLink.href = URL.createObjectURL(jsonFile);
            jsonLink.download = jsonName;
            jsonLink.click();
            jsonLink.remove();
        };
    };

};