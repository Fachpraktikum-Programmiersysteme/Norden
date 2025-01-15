import { Injectable } from '@angular/core';
import { Graph } from '../graph-representation/graph';
import { Node } from '../graph-representation/node';

@Injectable({
    providedIn: 'root',
})
export class GraphLogService {
    private static readonly dfgFillColors: string[] = [
        'Aqua',
        'Green',
        'SteelBlue',
        'Lime',
        'SlateBlue',
        'DarkGoldenRod',
        'LightSteelBlue',
        'DarkOliveGreen',
        'RoyalBlue',
        'MediumAquaMarine',
        'SeaGreen',
        'Yellow',
        'DarkTurquoise',
        'PowderBlue',
        'Chartreuse',
        'Navy',
        'MediumSpringGreen',
        'Teal',
        'SkyBlue',
        'LemonChiffon',
        'MediumBlue',
        'PaleGreen',
        'CornflowerBlue',
        'DarkSlateBlue',
        'PaleTurquoise',
        'GreenYellow',
        'Aquamarine',
        'OliveDrab',
        'DodgerBlue',
        'MediumSeaGreen',
        'Khaki',
        'CadetBlue',
        'Blue',
        'LimeGreen',
        'MidnightBlue',
        'PaleGoldenRod',
        'ForestGreen',
        'Turquoise',
        'DarkSeaGreen',
        'Gold',
        'LightBlue',
        'DarkCyan',
        'SpringGreen',
        'MediumSlateBlue',
        'Olive',
        'LightSkyBlue',
        'GoldenRod',
        'LightGreen',
        'DeepSkyBlue',
        'LightSeaGreen',
        'DarkGreen',
        'DarkKhaki',
        'MediumTurquoise',
        'YellowGreen',
    ];

    public static generateOutputLogArray(graph: Graph): [string, string][][] {
        const outLogArray: [string, string][][] = [];
        for (const trace of graph.logArray) {
            const eventsArray: [string, string][] = [];
            for (const event of trace) {
                eventsArray.push([event.label, this.getDfgColor(event.dfg)]);
            }
            if (eventsArray.length !== 0) {
                outLogArray.push(eventsArray);
            }
        }
        return outLogArray;
    }

    // Map DFG ID to a color
    private static getDfgColor(dfgId: number | undefined): string {
        if (dfgId !== undefined) {
            return this.dfgFillColors[dfgId % this.dfgFillColors.length];
        } else {
            return 'Black';
        }
    }
}
