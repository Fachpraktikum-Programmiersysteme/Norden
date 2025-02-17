import {Injectable} from '@angular/core';

import {CssColorName} from './css-color-names';

@Injectable({
    providedIn: 'root',
})
export class GraphGraphicsConfig {

    /* attributes */

    /* dimensions of the canvas */
    readonly canvasWidth: number = 1800;
    readonly canvasHeight: number = 600;

    /* dimensions of nodes, arcs, arrowheads & animated trace objects */
    readonly defaultNodeRadius: number = 20;

    readonly defaultStrokeWidth: number = 5;
    
    readonly defaultArrowRadius: number = 2;

    readonly defaultTraceRadius: number = 7;

    /* dimensions of nodeinfo-textboxes */
    readonly defaultTextBoxWidth: number = 400;
    readonly defaultTextBoxHeight: number = 90;
    readonly defaultMaxTextWidth: number = Math.floor(Math.ceil(this.defaultTextBoxWidth - (this.defaultTextBoxWidth / 10)) / 10);

    /* offset for symbols displayed directly on top of node objects */
    readonly defaultNodeSymbolOffset: number = (0.3 * this.defaultNodeRadius);

    /* default delay between animations */
    // readonly defaultAnimationDelay : number = 2;

    /* default colors for nodes, arcs, traces, and text */
    readonly defaultNodeStroke: CssColorName = 'Black';
    readonly markedNodeStroke: CssColorName = 'Crimson';
    readonly visitedNodeStroke: CssColorName = 'MediumBlue';
    readonly changedNodeStroke: CssColorName = 'GoldenRod';
    readonly newNodeStroke: CssColorName = 'Green';
    readonly activeNodeStrokeDFG: CssColorName = 'OrangeRed';
    readonly activeNodeStrokeCGS: CssColorName = 'Blue';
    readonly defaultNodeFill: CssColorName = 'Silver';
    readonly visitedNodeFill: CssColorName = 'RoyalBlue';
    readonly changedNodeFill: CssColorName = 'Gold';
    readonly newNodeFill: CssColorName = 'Lime';
    readonly activeNodeFillDFG: CssColorName = 'Orange';
    readonly activeNodeFillCGS: CssColorName = 'Aqua';

    readonly defaultArcStroke: CssColorName = 'Gray';
    readonly markedArcStroke: CssColorName = 'Crimson';
    readonly visitedArcStroke: CssColorName = 'RoyalBlue';
    readonly changedArcStroke: CssColorName = 'Gold';
    readonly newArcStroke: CssColorName = 'Lime';
    readonly activeArcStrokeDFG: CssColorName = 'Orange';
    readonly activeArcStrokeCGS: CssColorName = 'Aqua';

    readonly defaultTraceStrokeDFG: CssColorName = 'Indigo';
    readonly defaultTraceStrokeCGS: CssColorName = 'Blue';
    readonly defaultTraceFillDFG: CssColorName = 'Magenta';
    readonly defaultTraceFillCGS: CssColorName = 'Aqua';

    readonly defaultCutStroke: CssColorName = 'Red';

    readonly defaultTextBoxStroke: CssColorName = 'Black';
    readonly defaultTextBoxFill: CssColorName = 'White';
    readonly defaultTextFill: CssColorName = 'Black';

    /* DFG fill colors */
    private static readonly dfgFillColors : CssColorName[] = [
        'Aqua',               // ( #00FFFF)
        'Green',              // ( #008000)
        'SteelBlue',          // ( #4682B4)
        'Lime',               // ( #00FF00)
        'SlateBlue',          // ( #6A5ACD)
        'DarkGoldenRod',      // ( #B8860B)
        'LightSteelBlue',     // ( #B0C4DE)
        'DarkOliveGreen',     // ( #556B2F)
        'RoyalBlue',          // ( #4169E1)
        'MediumAquaMarine',   // ( #66CDAA)
        'SeaGreen',           // ( #2E8B57)
        'Yellow',             // ( #FFFF00)
        'DarkTurquoise',      // ( #00CED1)
        'PowderBlue',         // ( #B0E0E6)
        'Chartreuse',         // ( #7FFF00)
        'Navy',               // ( #000080)
        'MediumSpringGreen',  // ( #00FA9A)
        'Teal',               // ( #008080)
        'SkyBlue',            // ( #87CEEB)
        'LemonChiffon',       // ( #FFFACD)
        'MediumBlue',         // ( #0000CD)
        'PaleGreen',          // ( #98FB98)
        'CornflowerBlue',     // ( #6495ED)
        'DarkSlateBlue',      // ( #483D8B)
        'PaleTurquoise',      // ( #AFEEEE)
        'GreenYellow',        // ( #ADFF2F)
        'Aquamarine',         // ( #7FFFD4)
        'OliveDrab',          // ( #6B8E23)
        'DodgerBlue',         // ( #1E90FF)
        'MediumSeaGreen',     // ( #3CB371)
        'Khaki',              // ( #F0E68C)
        'CadetBlue',          // ( #5F9EA0)
        'Blue',               // ( #0000FF)
        'LimeGreen',          // ( #32CD32)
        'MidnightBlue',       // ( #191970)
        'PaleGoldenRod',      // ( #EEE8AA)
        'ForestGreen',        // ( #228B22)
        'Turquoise',          // ( #40E0D0)
        'DarkSeaGreen',       // ( #8FBC8F)
        'Gold',               // ( #FFD700)
        'LightBlue',          // ( #ADD8E6)
        'DarkCyan',           // ( #008B8B)
        'SpringGreen',        // ( #00FF7F)
        'MediumSlateBlue',    // ( #7B68EE)
        'Olive',              // ( #808000)
        'LightSkyBlue',       // ( #87CEFA)
        'GoldenRod',          // ( #DAA520)
        'LightGreen',         // ( #90EE90)
        'DeepSkyBlue',        // ( #00BFFF)
        'LightSeaGreen',      // ( #20B2AA)
        'DarkGreen',          // ( #006400)
        'DarkKhaki',          // ( #BDB76B)
        'MediumTurquoise',    // ( #48D1CC)
        'YellowGreen'         // ( #9ACD32)
    ];

    /* methods - other */

    public static getDfgColor(inDfgId : number | undefined) : string {
        if (inDfgId !== undefined) {
            return this.dfgFillColors[((inDfgId) % (this.dfgFillColors.length))];
        } else {
            return 'Black';
        };
    };

    public static getActiveColorDFG() : string {
        // return 'OrangeRed'; /* darker option */
        return 'Orange'; /* brighter option */
    };

    public static getActiveColorCGS() : string {
        // return 'Blue'; /* darker option */
        return 'Aqua'; /* brighter option */
    };

    public static getMarkedColor() : string {
        return 'Crimson'; /* darker option */
        // return 'Red'; /* brighter option */
    };

    public static getChangedColor() : string {
        return 'GoldenRod'; /* darker option */
        // return 'Gold'; /* brighter option */
    };

    public static getNewColor() : string {
        return 'Green'; /* darker option */
        // return 'Lime'; /* brighter option */
    };

};