import {Injectable} from "@angular/core";

import {Graph} from '../classes/graph-representation/graph';
import {JsonGraph} from '../classes/file-management/json-graph';
import {JsonPetriNet} from "../classes/file-management/json-petri-net";

@Injectable({
    providedIn: 'root'
})
export class FileWriterService {

    /* methods : constructor */

    public constructor() {};

    /* methods : other */

    private toJSON(inGraph : Graph) : JsonGraph {
        const jsonGraph : JsonGraph = {
            supports: [], 
            events: [], 
            places: [], 
            transitions: [], 
            arcs: {}, 
            labels: {}, 
            layout: {}
        };
        let nodeId : string;
        let nodeCount : number = 0;
        let supportCount : number = 0;
        let eventCount : number = 0;
        let placeCount : number = 0;
        let transitionCount : number = 0;
        let arcCount : number = 0;
        jsonGraph.supports = [];
        jsonGraph.events = [];
        jsonGraph.places = [];
        jsonGraph.transitions = [];
        jsonGraph.labels = {};
        jsonGraph.arcs = {};
        jsonGraph.layout = {};
        let nodeIds : {
            [graphNodeId: number]: string
        } = {};
        for (const node of inGraph.nodes) {
            if (node !== undefined) {
                switch (node.type) {
                    case 'support' : {
                        supportCount++;
                        nodeId = ('s' + supportCount.toString());
                        jsonGraph.supports.push(nodeId);
                        if (!(node.label.includes('undefined_support_label__'))) {
                            jsonGraph.labels[nodeId] = node.label;
                        };
                        break;
                    }
                    case 'event' : {
                        eventCount++;
                        nodeId = ('e' + eventCount.toString());
                        jsonGraph.events.push(nodeId);
                        if (!(node.label.includes('undefined_event_label__'))) {
                            jsonGraph.labels[nodeId] = node.label;
                        };
                        break;
                    }
                    case 'place' : {
                        placeCount++;
                        nodeId = ('p' + placeCount.toString());
                        jsonGraph.places.push(nodeId);
                        if (!(node.label.includes('undefined_place_label__'))) {
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
                        break;
                    };
                };
                jsonGraph.layout[nodeId] = {x: node.x, y: node.y};
                nodeIds[node.id] = nodeId;
                nodeCount++;
            } else {
                /* skip undefined entry in node array */
            };
        };
        if (nodeCount !== inGraph.nodeCount) {
            throw new Error('#srv.jws.toj.000: ' + 'conversion of graph to json failed - number of converted nodes (' + nodeCount + ') is not equal to original number of nodes (' + inGraph.nodeCount + ')');
        }
        if (supportCount !== inGraph.supportCount) {
            throw new Error('#srv.jws.toj.001: ' + 'conversion of graph to json failed - number of converted supports (' + supportCount + ') is not equal to original number of supports (' + inGraph.supportCount + ')');
        }
        if (placeCount !== inGraph.placeCount) {
            throw new Error('#srv.jws.toj.002: ' + 'conversion of graph to json failed - number of converted places (' + placeCount + ') is not equal to original number of places (' + inGraph.placeCount + ')');
        }
        if (transitionCount !== inGraph.transitionCount) {
            throw new Error('#srv.jws.toj.003: ' + 'conversion of graph to json failed - number of converted transitions (' + transitionCount + ') is not equal to original number of transitions (' + inGraph.transitionCount + ')');
        }
        for (const arc of inGraph.arcs) {
            let arcId : string = (nodeIds[arc[0].id] + ',' + nodeIds[arc[1].id]);
            jsonGraph.arcs[arcId] = arc[2];
            jsonGraph.layout[arcId] = [{x: arc[0].x, y: arc[0].y}, {x: arc[1].x, y: arc[1].y}];
            arcCount = arcCount + arc[2];
        };
        if (arcCount !== inGraph.arcCount) {
            throw new Error('#srv.jws.toj.004: ' + 'conversion of graph to json failed - number of converted arcs (' + arcCount + ') is not equal to original number of arcs (' + inGraph.arcCount + ')');
        }
        return jsonGraph;
    };

    private toPNML(inGraph : Graph) : string {
        if (inGraph.supportCount !== 0) {
            throw new Error('#srv.jws.top.000: ' + 'conversion of graph to pnml failed - graph to be converted contains ' + inGraph.supportCount + ' support nodes (not 0)');
        };
        if (inGraph.eventCount !== 0) {
            throw new Error('#srv.jws.top.001: ' + 'conversion of graph to pnml failed - graph to be converted contains ' + inGraph.eventCount + ' event nodes (not 0)');
        };
        if (inGraph.nodeCount !== (inGraph.placeCount + inGraph.transitionCount)) {
            throw new Error('#srv.jws.top.002: ' + 'conversion of graph to pnml failed - graph to be converted contains ' + inGraph.nodeCount + ' nodes, which is different from the sum of place nodes (' + inGraph.placeCount + ') & transition nodes (' + inGraph.transitionCount + ')');
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
                        placeString = (placeString + '  <place id="p' + placeCount + '">' + '\,\n');
                        if (!(node.label.includes('undefined_place_label__'))) {
                            placeString = (placeString + '    <name>' + '\,\n');
                            placeString = (placeString + '      <text>' + '\,\n');
                            placeString = (placeString + '        ' + node.label + '\,\n');
                            placeString = (placeString + '      </text>' + '\,\n');
                            placeString = (placeString + '    </name>' + '\,\n');
                        };
                        placeString = (placeString + '    <graphics>' + '\,\n');
                        placeString = (placeString + '      <position x="' + node.x + '" y="' + node.y + '"/>' + '\,\n');
                        placeString = (placeString + '    </graphics>' + '\,\n');
                        placeString = (placeString + '    <initialMarking>' + '\,\n');
                        placeString = (placeString + '      <text>' + '\,\n');
                        placeString = (placeString + '        0' + '\,\n');
                        placeString = (placeString + '      </text>' + '\,\n');
                        placeString = (placeString + '    </initialMarking>' + '\,\n');
                        placeString = (placeString + '  </place>' + '\,\n');
                        break;
                    }
                    case 'transition' : {
                        transitionCount++;
                        nodeIds[node.id] = ('t' + transitionCount);
                        transitionString = (transitionString + '  <transition id="t' + transitionCount + '">' + '\,\n');
                        if (!(node.label.includes('undefined_transition_label__'))) {
                            transitionString = (transitionString + '    <name>' + '\,\n');
                            transitionString = (transitionString + '      <text>' + '\,\n');
                            transitionString = (transitionString + '        ' + node.label + '\,\n');
                            transitionString = (transitionString + '      </text>' + '\,\n');
                            transitionString = (transitionString + '    </name>' + '\,\n');
                        };
                        transitionString = (transitionString + '    <graphics>' + '\,\n');
                        transitionString = (transitionString + '      <position x="' + node.x + '" y="' + node.y + '"/>' + '\,\n');
                        transitionString = (transitionString + '    </graphics>' + '\,\n');
                        transitionString = (transitionString + '  </transition>' + '\,\n');
                        break;
                    };
                };
                nodeCount++;
            } else {
                /* skip undefined entry in node array */
            };
        };
        if (nodeCount !== inGraph.nodeCount) {
            throw new Error('#srv.jws.top.003: ' + 'conversion of graph to pnml failed - number of converted nodes (' + nodeCount + ') is not equal to original number of nodes (' + inGraph.nodeCount + ')');
        }
        if (supportCount !== inGraph.supportCount) {
            throw new Error('#srv.jws.top.004: ' + 'conversion of graph to pnml failed - number of converted supports (' + supportCount + ') is not equal to original number of supports (' + inGraph.supportCount + ')');
        }
        if (placeCount !== inGraph.placeCount) {
            throw new Error('#srv.jws.top.005: ' + 'conversion of graph to pnml failed - number of converted places (' + placeCount + ') is not equal to original number of places (' + inGraph.placeCount + ')');
        }
        if (transitionCount !== inGraph.transitionCount) {
            throw new Error('#srv.jws.top.006: ' + 'conversion of graph to pnml failed - number of converted transitions (' + transitionCount + ') is not equal to original number of transitions (' + inGraph.transitionCount + ')');
        }
        for (const arc of inGraph.arcs) {
            arcId++;
            arcString = (arcString + '  <arc id="a' + arcId + '" source="' + nodeIds[arc[0].id] + '" target="' + nodeIds[arc[1].id] + '">' + '\,\n');
            arcString = (arcString + '    <inscription>' + '\,\n');
            arcString = (arcString + '      <text>' + '\,\n');
            arcString = (arcString + '        1' + '\,\n');
            arcString = (arcString + '      </text>' + '\,\n');
            arcString = (arcString + '    </inscription>' + '\,\n');
            arcString = (arcString + '  </arc>' + '\,\n');
            arcCount = arcCount + arc[2];
        };
        if (arcCount !== inGraph.arcCount) {
            throw new Error('#srv.jws.top.007: ' + 'conversion of graph to pnml failed - number of converted arcs (' + arcCount + ') is not equal to original number of arcs (' + inGraph.arcCount + ')');
        }
        pnmlString = (pnmlString + '<?xml version="1.0" encoding="UTF-8"?>' + '\,\n');
        pnmlString = (pnmlString + '<pnml>' + '\,\n');
        pnmlString = (pnmlString + '<net id="unnamed petrinet" type="http://www.pnml.org/version-2009/grammar/pnml">' + '\,\n');
        pnmlString = (pnmlString + placeString);
        pnmlString = (pnmlString + transitionString);
        pnmlString = (pnmlString + arcString);
        pnmlString = (pnmlString + '</net>' + '\,\n');
        pnmlString = (pnmlString + '</pnml>');
        return pnmlString;
    };

    public isPetriNet(inGraph : Graph) : boolean {
        return (
            (inGraph.supportCount === 0) && 
            (inGraph.eventCount === 0) && 
            (inGraph.nodeCount === (inGraph.placeCount + inGraph.transitionCount))
        );
    };

    public writeFile(inFileName : string, inGraph : Graph) : void {
        /* to be removed - start */
        console.log();
        console.log(' >> starting to write to file');
        /* to be removed - end*/
        if (this.isPetriNet(inGraph)) {
            /* to be removed - start */
            console.log('    >> given graph is a petri net');
            /* to be removed - end*/
            const jsonGraph : JsonGraph = this.toJSON(inGraph);
            const jsonString : string = JSON.stringify(jsonGraph, null, 4);
            const splitArray : string[] = jsonString.split('"supports": []\,\n    "events": []\,\n    ');
            const modifiedString : string = (splitArray[0] + splitArray[1]);
            const jsonName : string = (inFileName + '.json');
            const jsonFile : File = new File([modifiedString], jsonName);
            const jsonLink : HTMLAnchorElement = document.createElement("a");
            jsonLink.href = URL.createObjectURL(jsonFile);
            jsonLink.download = jsonName;
            jsonLink.click();
            jsonLink.remove();
            const pnmlString : string = this.toPNML(inGraph);
            const pnmlName : string = (inFileName + '.pnml');
            const pnmlFile : File = new File([pnmlString], pnmlName);
            const pnmlLink : HTMLAnchorElement = document.createElement("a");
            pnmlLink.href = URL.createObjectURL(pnmlFile);
            pnmlLink.download = pnmlName;
            pnmlLink.click();
            pnmlLink.remove();
        } else {
            /* to be removed - start */
            console.log('    >> given graph is not a petri net');
            /* to be removed - end*/
            const jsonGraph : JsonGraph = this.toJSON(inGraph);
            const jsonString : string = JSON.stringify(jsonGraph, null, 4);
            const jsonName : string = (inFileName + '.json');
            const jsonFile : File = new File([jsonString], jsonName);
            const jsonLink : HTMLAnchorElement = document.createElement("a");
            jsonLink.href = URL.createObjectURL(jsonFile);
            jsonLink.download = jsonName;
            jsonLink.click();
            jsonLink.remove();
        };
        /* to be removed - start */
        console.log(' >> writing to .json file complete');
        console.log();
        /* to be removed - end*/
    };

};