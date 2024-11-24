import {Injectable} from "@angular/core";

import {Graph} from '../classes/graph-representation/graph';
import {JsonGraph} from '../classes/file-management/json-graph';
import {JsonPetriNet} from "../classes/file-management/json-petri-net";

@Injectable({
    providedIn: 'root'
})
export class JsonWriterService {

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
                        nodeId = ('s' + supportCount.toString());
                        jsonGraph.supports.push(nodeId);
                        supportCount++;
                        break;
                    }
                    case 'event' : {
                        nodeId = ('e' + eventCount.toString());
                        jsonGraph.events.push(nodeId);
                        eventCount++;
                        break;
                    }
                    case 'place' : {
                        nodeId = ('p' + placeCount.toString());
                        jsonGraph.places.push(nodeId);
                        placeCount++;
                        break;
                    }
                    case 'transition' : {
                        nodeId = ('t' + transitionCount.toString());
                        jsonGraph.transitions.push(nodeId);
                        transitionCount++;
                        break;
                    };
                };
                jsonGraph.labels[nodeId] = node.label;
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

    public isPetriNet(inGraph : Graph) : boolean {
        return (
            (inGraph.placeCount > 0) && 
            (inGraph.transitionCount > 0) && 
            (inGraph.supportCount === 0) && 
            (inGraph.eventCount === 0) && 
            (inGraph.nodeCount === (inGraph.placeCount + inGraph.transitionCount))
        );
    };

    public writeJSON(inFileName : string, inFileExtension : string, inGraph : Graph) : void {
        /* to be removed - start */
        console.log();
        console.log(' >> starting to write to .json file');
        /* to be removed - end*/
        if (this.isPetriNet(inGraph)) {
            /* to be removed - start */
            console.log('    >> given graph is a petri net');
            /* to be removed - end*/
            const jsonGraph : JsonGraph = this.toJSON(inGraph);
            const jsonString : string = JSON.stringify(jsonGraph, null, 4);
            const splitArray : string[] = jsonString.split('"supports": []\,\n    "events": []\,\n    ');
            const modifiedString : string = (splitArray[0] + splitArray[1]);
            const jsonFile : File = new File([modifiedString], (inFileName + '.' + inFileExtension));
            const jsonLink : HTMLAnchorElement = document.createElement("a");
            jsonLink.href = URL.createObjectURL(jsonFile);
            jsonLink.download = inFileName;
            jsonLink.click();
            jsonLink.remove();
        } else {
            /* to be removed - start */
            console.log('    >> given graph is not a petri net');
            /* to be removed - end*/
            const jsonGraph : JsonGraph = this.toJSON(inGraph);
            const jsonString : string = JSON.stringify(jsonGraph, null, 4);
            const jsonFile : File = new File([jsonString], (inFileName + '.' + inFileExtension));
            const jsonLink : HTMLAnchorElement = document.createElement("a");
            jsonLink.href = URL.createObjectURL(jsonFile);
            jsonLink.download = inFileName;
            jsonLink.click();
            jsonLink.remove();
        };
        /* to be removed - start */
        console.log(' >> writing to .json file complete');
        console.log();
        /* to be removed - end*/
    };

};