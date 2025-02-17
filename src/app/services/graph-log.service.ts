import {Injectable} from '@angular/core';

import {GraphGraphicsConfig} from '../classes/display/graph-graphics.config';
import {Graph} from '../classes/graph-representation/graph';

@Injectable({
    providedIn: 'root',
})
export class GraphLogService {

    /* attributes */

    private static lastLog : {id : number, events : {id : number, label : string, color : string}[]}[] = [];

    /* methods - constructor */
    
    public constructor() {};

    /* methods - other */

    public static generateOutputLogArrayDFG(graph: Graph) : {id : number, events : {id : number, label : string, color : string}[]}[] {
        const latestLog : {id : number, events : {id : number, label : string, color : string}[]}[] = [];
        let traceIdx : number = 0;
        for (const trace of graph.logArray) {
            const traceStub : {id : number, events : {id : number, label : string, color : string}[]} = {
                id : traceIdx,
                events : []
            };
            let eventIdx : number = 0;
            for (const event of trace) {
                let eventColor : string;
                if (event.active) {
                    eventColor = GraphGraphicsConfig.getActiveColorDFG();
                } else if (event.marked) {
                    eventColor = GraphGraphicsConfig.getMarkedColor();
                } else {
                    eventColor = GraphGraphicsConfig.getDfgColor(event.dfg);
                };
                traceStub.events.push(
                    {
                        id : eventIdx,
                        label : event.label,
                        color : eventColor,
                    }
                );
                eventIdx++;
            };
            if (traceStub.events.length !== 0) {
                latestLog.push(traceStub);
            };
            traceIdx++;
        };
        this.lastLog = latestLog;
        return this.lastLog;
    };

    public static generateOutputLogArrayCGS(graph: Graph) : {id : number, events : {id : number, label : string, color : string}[]}[] {
        const latestLog : {id : number, events : {id : number, label : string, color : string}[]}[] = [];
        let traceIdx : number = 0;
        for (const trace of graph.logArray) {
            const traceStub : {id : number, events : {id : number, label : string, color : string}[]} = {
                id : traceIdx,
                events : []
            };
            let eventIdx : number = 0;
            for (const event of trace) {
                let eventColor : string;
                if (event.active) {
                    eventColor = GraphGraphicsConfig.getActiveColorCGS();
                } else if (event.newlyCreated) {
                    eventColor = GraphGraphicsConfig.getNewColor();
                } else if (event.changed) {
                    eventColor = GraphGraphicsConfig.getChangedColor();
                } else {
                    eventColor = 'Black'
                };
                traceStub.events.push(
                    {
                        id : eventIdx,
                        label : event.label,
                        color : eventColor,
                    }
                );
                eventIdx++;
            };
            if (traceStub.events.length !== 0) {
                latestLog.push(traceStub);
            };
            traceIdx++;
        };
        this.lastLog = latestLog;
        return this.lastLog;
    };

};