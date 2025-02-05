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

    public static generateOutputLogArray(graph: Graph) : {id : number, events : {id : number, label : string, color : string}[]}[] {
        const latestLog : {id : number, events : {id : number, label : string, color : string}[]}[] = [];
        let traceIdx : number = 0;
        for (const trace of graph.logArray) {
            const traceStub : {id : number, events : {id : number, label : string, color : string}[]} = {
                id : traceIdx,
                events : []
            };
            let eventIdx : number = 0;
            for (const event of trace) {
                traceStub.events.push(
                    {
                        id : eventIdx,
                        label : event.label,
                        color : GraphGraphicsConfig.getDfgColor(event.dfg),
                    }
                );
                eventIdx++;
            };
            if (traceStub.events.length !== 0) {
                latestLog.push(traceStub);
            };
            traceIdx++;
        }
        this.lastLog = latestLog;
        return this.lastLog;
    };

};