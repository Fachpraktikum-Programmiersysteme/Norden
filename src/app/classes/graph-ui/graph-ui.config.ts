import {Injectable} from '@angular/core';

import {CssColorName} from '../display/css-color-names';

@Injectable({
    providedIn: 'root',
})
export class GraphUiConfig {

    // canvas dimensions
    readonly canvasWidth: number = 1800;
    readonly canvasHeight: number = 600;

    // node and arc dimensions
    readonly defaultNodeRadius: number = 20;
    readonly defaultArrowRadius: number = 2;
    readonly defaultTraceRadius: number = 7;
    readonly defaultStrokeWidth: number = 5;

    // textbox dimensions
    readonly defaultTextBoxWidth: number = 400;
    readonly defaultTextBoxHeight: number = 90;
    readonly defaultMaxTextWidth: number = Math.floor(
        Math.ceil(this.defaultTextBoxWidth - this.defaultTextBoxWidth / 10) / 10
    );

    // default delay between animations
    // readonly defaultAnimationDelay : number = 2;

    // default colors for nodes, arcs, traces, and text
    readonly defaultNodeStroke: CssColorName = 'Black';
    readonly activeNodeStroke: CssColorName = 'OrangeRed';
    readonly visitedNodeStroke: CssColorName = 'Green';
    readonly markedNodeStroke: CssColorName = 'Crimson';
    readonly defaultNodeFill: CssColorName = 'Silver';
    readonly activeNodeFill: CssColorName = 'Orange';
    readonly visitedNodeFill: CssColorName = 'Lime';

    readonly defaultArcStroke: CssColorName = 'Gray';
    readonly markedArcStroke: CssColorName = 'Crimson';
    readonly activeArcStroke: CssColorName = 'Orange';
    readonly visitedArcStroke: CssColorName = 'Lime';

    readonly defaultCutStroke: CssColorName = 'Red';

    readonly defaultTraceStroke: CssColorName = 'Blue';
    readonly dfgTraceStroke: CssColorName = 'Indigo';
    readonly defaultTraceFill: CssColorName = 'Aqua';
    readonly dfgTraceFill: CssColorName = 'Magenta';

    readonly defaultTextBoxStroke: CssColorName = 'Black';
    readonly defaultTextBoxFill: CssColorName = 'White';
    readonly defaultTextFill: CssColorName = 'Black';

    // DFG fill colors
    static readonly dfgFillColors: CssColorName[] = [
        'Aqua', 'Green', 'SteelBlue', 'Lime', 'SlateBlue',
        'DarkGoldenRod', 'LightSteelBlue', 'DarkOliveGreen', 'RoyalBlue',
        'MediumAquaMarine', 'SeaGreen', 'Yellow', 'DarkTurquoise',
        'PowderBlue', 'Chartreuse', 'Navy', 'MediumSpringGreen', 'Teal',
        'SkyBlue', 'LemonChiffon', 'MediumBlue', 'PaleGreen', 'CornflowerBlue',
        'DarkSlateBlue', 'PaleTurquoise', 'GreenYellow', 'Aquamarine', 'OliveDrab',
        'DodgerBlue', 'MediumSeaGreen', 'Khaki', 'CadetBlue', 'Blue', 'LimeGreen',
        'MidnightBlue', 'PaleGoldenRod', 'ForestGreen', 'Turquoise', 'DarkSeaGreen',
        'Gold', 'LightBlue', 'DarkCyan', 'SpringGreen', 'MediumSlateBlue', 'Olive',
        'LightSkyBlue', 'GoldenRod', 'LightGreen', 'DeepSkyBlue', 'LightSeaGreen',
        'DarkGreen', 'DarkKhaki', 'MediumTurquoise', 'YellowGreen',
    ];

    public static getDfgColor(inDfgId : number | undefined) : string {
        if (inDfgId !== undefined) {
            return this.dfgFillColors[((inDfgId) % (this.dfgFillColors.length))];
        } else {
            return 'Black'
        };
    };
}
