import {Injectable} from '@angular/core';

import {CssColorName} from '../classes/display/css-color-names';
import {Graph} from '../classes/graph-representation/graph';
import {Node} from '../classes/graph-representation/node';
import {Arc} from '../classes/graph-representation/arc';

@Injectable({
    providedIn: 'root'
})
export class SvgService {

    /* attributes */

    private readonly canvasWidth : number = 1800;
    private readonly canvasHeight : number = 600;

    private readonly defaultTextBoxWidth : number = 400;
    private readonly defaultTextBoxHeight : number = 90;

    private readonly defaultMaxTextWidth : number = Math.floor(Math.ceil(this.defaultTextBoxWidth - (this.defaultTextBoxWidth / 10)) / 10)

    // private readonly defaultAnimationDelay : number = 2;

    private readonly defaultNodeRadius : number = 20;
    private readonly defaultArrowRadius : number = 2;
    private readonly defaultTraceRadius : number = 7;

    private readonly defaultStrokeWidth : number = 5;

    private readonly defaultNodeStroke : CssColorName = 'Black';
    private readonly activeNodeStroke : CssColorName = 'OrangeRed';
    private readonly visitedNodeStroke : CssColorName = 'Green';
    private readonly markedNodeStroke : CssColorName = 'Crimson';
    private readonly defaultNodeFill : CssColorName = 'Silver';
    private readonly activeNodeFill : CssColorName = 'Orange';
    private readonly visitedNodeFill : CssColorName = 'Lime';

    private readonly defaultArcStroke : CssColorName = 'Gray';
    private readonly markedArcStroke : CssColorName = 'Crimson';
    private readonly activeArcStroke : CssColorName = 'Orange';
    private readonly visitedArcStroke : CssColorName = 'Lime';

    private readonly defaultCutStroke : CssColorName = 'Red';

    private readonly defaultTraceStroke : CssColorName = 'Blue';
    private readonly dfgTraceStroke : CssColorName = 'Indigo';
    private readonly defaultTraceFill : CssColorName = 'Aqua';
    private readonly dfgTraceFill : CssColorName = 'Magenta';

    private readonly defaultTextBoxStroke : CssColorName = 'Black';
    private readonly defaultTextBoxFill : CssColorName = 'White';
    private readonly defaultTextFill : CssColorName = 'Black';

    private readonly dfgFillColors : CssColorName[] = [
        'Aqua',
        'Blue',
        'CadetBlue',
        'CornflowerBlue',
        // 'Cyan',
        'DarkBlue',
        'DarkCyan',
        'DarkSlateBlue',
        'DarkTurquoise',
        'DeepSkyBlue',
        'DodgerBlue',
        'LightBlue',
	    'LightCyan',
        'LightSkyBlue',
	    'LightSteelBlue',
	    'MediumBlue',
	    'MediumSlateBlue',
        'MidnightBlue',
	    'Navy',
	    'PaleTurquoise',
        'PowderBlue',
        'RoyalBlue',
        'SkyBlue',
	    'SlateBlue',
        'SteelBlue',
        'Turquoise'
    ];

    private readonly arrowSVG : SVGElement = this.createSvgElement('svg');
    private readonly infosSVG : SVGElement = this.createSvgElement('svg');

    private _infoOverride : boolean = false;
    private _noAnimations : boolean = false;
    private _displayMode : 'default' | 'dfg' = 'default'

    /* methods - constructor */

    public constructor() {
        this.initArrow();
        this.initInfos();
    };

    /* methods - setters */

    public set infoOverride(inValue : boolean) {
        this._infoOverride = inValue;
    };

    public set noAnimations(inValue : boolean) {
        this._noAnimations = inValue;
    };

    public set displayMode(inValue : 'default' | 'dfg') {
        this._displayMode = inValue;
    };

    /* methods : other */

    public createSvgNodes(inGraph : Graph) : Array<SVGElement> {
        const nodeSvgArray: Array<SVGElement> = [];
        let nodeId : number = 0;
        for (const node of inGraph.nodes) {
            if (node !== undefined) {
                nodeSvgArray.push(this.createSvgNode(node, nodeId));
            } else {
                /* skip undefined node */
            };
            nodeId++;
        };
        return nodeSvgArray;
    };

    public createSvgArcs(inGraph : Graph) : Array<SVGElement> {
        const arcSvgArray: Array<SVGElement> = [];
        let arcId : number = 0;
        for (const arc of inGraph.arcs) {
            if (arc !== undefined) {
                arcSvgArray.push(this.createSvgArc(arc, arcId));
            } else {
                /* skip undefined arc */
            };
            arcId++;
        };
        return arcSvgArray;
    };

    public createSvgInfos(inGraph : Graph) : Array<SVGElement> {
        const infoSvgArray: Array<SVGElement> = [];
        let nodeId : number = 0;
        for (const node of inGraph.nodes) {
            if (node !== undefined) {
                infoSvgArray.push(this.createSvgInfo(node, nodeId));
            } else {
                /* skip undefined node */
            };
            nodeId++;
        };
        return infoSvgArray;
    };

    public createSvgTraces(inGraph : Graph) : Array<SVGElement> {
        const traceSvgArray: Array<SVGElement> = [];
        if (!this._noAnimations) {
            let maxTraceLength : number = 0;
            for (const trace of inGraph.logArray) {
                if (trace.length > maxTraceLength) {
                    maxTraceLength = trace.length;
                };
            };
            const duration =  (maxTraceLength * 2);
            const interval = (duration / (inGraph.logArray.length));
            let delay : number = 0;
            for (const trace of inGraph.logArray) {
                if (trace.length > 0) {
                    traceSvgArray.push(this.createSvgTrace(trace, delay, duration));
                    delay = delay + interval;
                };
            };
        };
        return traceSvgArray;
    };

    public createSvgCut(startX: number, startY: number, endX: number, endY: number): SVGElement {
        const svg: SVGElement = this.createSvgElement('line');
        svg.setAttribute('customType', 'cut');
        svg.setAttribute('x1', `${startX}`);
        svg.setAttribute('y1', `${startY}`);
        svg.setAttribute('x2', `${endX}`);
        svg.setAttribute('y2', `${endY}`);
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke', this.defaultCutStroke);
        return svg;
    };

    private createSvgNode(inNode : Node, inNodeId : number) : SVGElement {
        let svg : SVGElement;
        switch (inNode.type) {
            case 'support' : {
                svg = this.createSvgElement('rect');
                svg.setAttribute('customType', 'support-node');
                svg.setAttribute('id', ('support_' + inNodeId));
                svg.setAttribute('x', `${inNode.x - this.defaultNodeRadius + 1}`);
                svg.setAttribute('y', `${inNode.y - this.defaultNodeRadius + 1}`);
                svg.setAttribute('width', `${(this.defaultNodeRadius * 2) - 1}`);
                svg.setAttribute('height', `${(this.defaultNodeRadius * 2) - 1}`);
                svg.setAttribute('rx', `${Math.floor(this.defaultNodeRadius / 2)}`);
                break;
            }
            case 'event' : {
                svg = this.createSvgElement('rect');
                svg.setAttribute('customType', 'event-node');
                svg.setAttribute('id', ('event_' + inNodeId));
                svg.setAttribute('x', `${inNode.x - this.defaultNodeRadius + 1}`);
                svg.setAttribute('y', `${inNode.y - this.defaultNodeRadius + 1}`);
                svg.setAttribute('width', `${(this.defaultNodeRadius * 2) - 1}`);
                svg.setAttribute('height', `${(this.defaultNodeRadius * 2) - 1}`);
                svg.setAttribute('rx', `${Math.floor(this.defaultNodeRadius / 2)}`);
                break;
            }
            case 'place' : {
                svg = this.createSvgElement('circle');
                svg.setAttribute('customType', 'place-node');
                svg.setAttribute('id', ('place_' + inNodeId));
                svg.setAttribute('cx', `${inNode.x}`);
                svg.setAttribute('cy', `${inNode.y}`);
                svg.setAttribute('r', `${this.defaultNodeRadius}`);
                break;
            }
            case 'transition' : {
                svg = this.createSvgElement('rect');
                svg.setAttribute('customType', 'transition-node');
                svg.setAttribute('id', ('transition_' + inNodeId));
                svg.setAttribute('x', `${inNode.x - this.defaultNodeRadius + 1}`);
                svg.setAttribute('y', `${inNode.y - this.defaultNodeRadius + 1}`);
                svg.setAttribute('width', `${(this.defaultNodeRadius * 2) - 1}`);
                svg.setAttribute('height', `${(this.defaultNodeRadius * 2) - 1}`);
                svg.setAttribute('rx', `${0}`);
                break;
            }
        };
        svg.setAttribute('stroke-width', `${this.defaultStrokeWidth}`);
        if (this._displayMode === 'default') {
            if (inNode.isMarked) {
                svg.setAttribute('stroke', this.markedNodeStroke);
                if (inNode.isActive) {
                    svg.setAttribute('fill', this.activeNodeFill);
                } else if (inNode.wasVisited) {
                    svg.setAttribute('fill', this.visitedNodeFill);
                } else {
                    /* impossible case */
                    svg.setAttribute('fill', this.defaultNodeFill);
                };
            } else {
                if (inNode.isActive) {
                    svg.setAttribute('stroke', this.activeNodeStroke);
                    svg.setAttribute('fill', this.activeNodeFill);
                } else if (inNode.wasVisited) {
                    svg.setAttribute('stroke', this.visitedNodeStroke);
                    svg.setAttribute('fill', this.visitedNodeFill);
                } else {
                    svg.setAttribute('stroke', this.defaultNodeStroke);
                    svg.setAttribute('fill', this.defaultNodeFill);
                };
            };
        } else {
            if (inNode.isMarked) {
                svg.setAttribute('stroke', this.markedNodeStroke);
            } else {
                svg.setAttribute('stroke', this.defaultNodeStroke);
            };
            if (inNode.isActive) {
                svg.setAttribute('fill', this.activeNodeFill);
            } else {
                if (inNode.dfg !== undefined) {
                    svg.setAttribute('fill', this.dfgFillColors[((inNode.dfg) % (this.dfgFillColors.length))])
                } else {
                    svg.setAttribute('fill', this.defaultNodeFill);
                };
            };
        };
        inNode.registerNodeSvg(svg);
        return(svg);
    };

    private createSvgArc(inArc: Arc, inArcId: number): SVGElement {
        const svg: SVGElement = this.createSvgElement('line');
        svg.setAttribute('customType', 'arc');
        svg.setAttribute('id', ('arc_' + inArcId));
        svg.setAttribute('stroke-width', `${this.defaultStrokeWidth}`);
        let arcVectorX : number = ((inArc.target.x) - (inArc.source.x));
        let arcVectorY : number = ((inArc.target.y) - (inArc.source.y));
        let arcVectorLength : number = (Math.sqrt((arcVectorX * arcVectorX) + (arcVectorY * arcVectorY)));
        let offVectorLength : number = ((this.defaultNodeRadius / 4) / arcVectorLength);
        let offsetX : number = (Math.floor(offVectorLength * arcVectorY * (-1)));
        let offsetY : number = (Math.floor(offVectorLength * arcVectorX));

        if (inArc.reverseExists) {
            svg.setAttribute('x1', `${(inArc.source.x + offsetX)}`);
            svg.setAttribute('y1', `${(inArc.source.y + offsetY)}`);
            svg.setAttribute('x2', `${(inArc.target.x + offsetX)}`);
            svg.setAttribute('y2', `${(inArc.target.y + offsetY)}`);
        } else {
            svg.setAttribute('x1', `${inArc.source.x}`);
            svg.setAttribute('y1', `${inArc.source.y}`);
            svg.setAttribute('x2', `${inArc.target.x}`);
            svg.setAttribute('y2', `${inArc.target.y}`);
        };

        if (this._displayMode === 'default') {
            if (inArc.isActive && !(inArc.overrideActive)) {
                svg.setAttribute('stroke', this.activeArcStroke);
                svg.setAttribute('marker-end', 'url(#arrow_head_active)');
            } else if (inArc.isMarked) {
                svg.setAttribute('stroke', this.markedArcStroke);
                svg.setAttribute('marker-end', 'url(#arrow_head_marked)');
            } else if (inArc.wasVisited) {
                svg.setAttribute('stroke', this.visitedArcStroke);
                svg.setAttribute('marker-end', 'url(#arrow_head_visited)');
            } else {
                svg.setAttribute('stroke', this.defaultArcStroke);
                svg.setAttribute('marker-end', 'url(#arrow_head_default)');
            };
        } else {
            if (inArc.isActive  && !(inArc.overrideActive)) {
                svg.setAttribute('stroke', this.activeArcStroke);
                svg.setAttribute('marker-end', 'url(#arrow_head_active)');
            } else if (inArc.isMarked) {
                svg.setAttribute('stroke', this.markedArcStroke);
                svg.setAttribute('marker-end', 'url(#arrow_head_marked)');
            } else if (inArc.dfg !== undefined) {
                svg.setAttribute('stroke', this.dfgFillColors[((inArc.dfg) % (this.dfgFillColors.length))]);
                svg.setAttribute('marker-end', 'url(#arrow_head_dfg)');
            } else {
                svg.setAttribute('stroke', this.defaultArcStroke);
                svg.setAttribute('marker-end', 'url(#arrow_head_default)');
            };
        };
        this.arrowSVG.appendChild(svg);
        return svg;
    };

    /* do not remove - alternative implementation */
    // 
    // private createSvgArc(inNodes: [Node, Node], inBiDirectional: boolean, inMarking: boolean, inArcId: number): SVGElement {
    //     const svg: SVGElement = this.createSvgElement('path');
    //     svg.setAttribute('customType', 'arc');
    //     svg.setAttribute('id', ('arc_' + inArcId));
    //     svg.setAttribute('fill', 'Transparent');
    //     svg.setAttribute('stroke-width', `${this.defaultStrokeWidth}`);
    //     let arcVectorX : number = ((inNodes[1].x) - (inNodes[0].x));
    //     let arcVectorY : number = ((inNodes[1].y) - (inNodes[0].y));
    //     let halfX : number = ((arcVectorX) / (2));
    //     let halfY : number = ((arcVectorY) / (2));
    //     let controlX : number = ((inNodes[0].x) + (halfX) - (halfY));
    //     let controlY : number = ((inNodes[0].y) + (halfY) + (halfX));
    //     if (inBiDirectional) {
    //         svg.setAttribute('d', `M ${inNodes[0].x} ${inNodes[0].y} Q ${controlX} ${controlY} ${inNodes[1].x} ${inNodes[1].y}`);
    //     } else {
    //         svg.setAttribute('d', `M ${inNodes[0].x} ${inNodes[0].y} ${inNodes[1].x} ${inNodes[1].y}`);
    //     };
    //     if (inMarking) {
    //         svg.setAttribute('stroke', this.markedArcColor);
    //         svg.setAttribute('marker-end', 'url(#arrow_head_marked)');
    //     } else {
    //         svg.setAttribute('stroke', this.defaultArcColor);
    //         svg.setAttribute('marker-end', 'url(#arrow_head_default)');
    //     };
    //     this.arrowSVG.appendChild(svg);
    //     return svg;
    // };

    private createSvgInfo(inNode : Node, inNodeId : number) : SVGElement {
        let x : number;
        let y : number;
        if (inNode.x < Math.ceil(this.canvasWidth / 2)) {
            if (inNode.y < Math.ceil(this.canvasHeight / 2)) {
                x = inNode.x + (this.defaultNodeRadius + 3);
                y = inNode.y + (this.defaultNodeRadius + 3);
                x = inNode.x + (this.defaultNodeRadius + 3);
                y = inNode.y + (this.defaultNodeRadius + 3);
            } else {
                x = inNode.x + (this.defaultNodeRadius + 3);
                y = inNode.y - (this.defaultNodeRadius + 3 + this.defaultTextBoxHeight);
                x = inNode.x + (this.defaultNodeRadius + 3);
                y = inNode.y - (this.defaultNodeRadius + 3 + this.defaultTextBoxHeight);
            };
        } else {
            if (inNode.y < Math.ceil(this.canvasHeight / 2)) {
                x = inNode.x - (this.defaultNodeRadius + 3 + this.defaultTextBoxWidth);
                y = inNode.y + (this.defaultNodeRadius + 3);
                x = inNode.x - (this.defaultNodeRadius + 3 + this.defaultTextBoxWidth);
                y = inNode.y + (this.defaultNodeRadius + 3);
            } else {
                x = inNode.x - (this.defaultNodeRadius + 3 + this.defaultTextBoxWidth);
                y = inNode.y - (this.defaultNodeRadius + 3 + this.defaultTextBoxHeight);
                x = inNode.x - (this.defaultNodeRadius + 3 + this.defaultTextBoxWidth);
                y = inNode.y - (this.defaultNodeRadius + 3 + this.defaultTextBoxHeight);
            };
        };
        const svg = this.createSvgElement('svg');
        const rect = this.createSvgElement('rect');
        const cont = this.createSvgElement('g');
        const text0 = this.createSvgElement('text');
        const text1 = this.createSvgElement('text');
        const text2 = this.createSvgElement('text');
        const text3 = this.createSvgElement('text');
        const text4 = this.createSvgElement('text');
        const text5 = this.createSvgElement('text');
        svg.setAttribute('customType', 'node-info-panel');
        if (this._infoOverride) {
            svg.setAttribute('visibility', 'visible');
        } else  if (inNode.isInfoActive) {
            svg.setAttribute('visibility', 'visible');
        } else {
            svg.setAttribute('visibility', 'hidden');
        };
        rect.setAttribute('x', `${x}`);
        rect.setAttribute('y', `${y}`);
        rect.setAttribute('width', `${this.defaultTextBoxWidth}`);
        rect.setAttribute('height', `${this.defaultTextBoxHeight}`);
        rect.setAttribute('fill', this.defaultTextBoxFill);
        rect.setAttribute('stroke', this.defaultTextBoxStroke);
        rect.setAttribute('stroke-width', '2');
        rect.setAttribute('rx', '10');
        cont.setAttribute('x', `${x}`);
        cont.setAttribute('y', `${y}`);
        cont.setAttribute('width', `${this.defaultTextBoxWidth}`);
        cont.setAttribute('height', `${this.defaultTextBoxHeight}`);
        text0.setAttribute('x', `${x + 10}`);
        text0.setAttribute('y', `${y}`);
        text0.setAttribute('dy', '0.4em');
        text0.setAttribute('fill', this.defaultTextBoxFill);
        text0.textContent = ('...');
        text1.setAttribute('x', `${x + 10}`);
        text1.setAttribute('y', `${y}`);
        text1.setAttribute('dy', '1.1em');
        text1.setAttribute('fill', 'Black');
        text1.textContent = (`label : ` + `'${inNode.label}'`);
        if (text1.textContent.length > this.defaultMaxTextWidth) {
            text1.setAttribute('textLength', `${this.defaultTextBoxWidth - 20}`);
            text1.setAttribute('lengthAdjust', 'spacingAndGlyphs');
            /* to be removed - start */
            console.log('node "' + inNodeId + '" found that info text line 1 is too long (' + text1.textContent.length + ')');
            /* to be removed - end */
        };
        text2.setAttribute('x', `${x + 10}`);
        text2.setAttribute('y', `${y}`);
        text2.setAttribute('dy', '2.1em');
        text2.setAttribute('fill', this.defaultTextFill);
        text2.textContent = (`type : ` + `'${inNode.type}'`);
        if (text2.textContent.length > this.defaultMaxTextWidth) {
            text2.setAttribute('textLength', `${this.defaultTextBoxWidth - 20}`);
            text2.setAttribute('lengthAdjust', 'spacingAndGlyphs');
            /* to be removed - start */
            console.log('node "' + inNodeId + '" found that info text line 2 is too long (' + text2.textContent.length + ')');
            /* to be removed - end */
        };
        text3.setAttribute('x', `${x + 10}`);
        text3.setAttribute('y', `${y}`);
        text3.setAttribute('dy', '3.1em');
        text3.setAttribute('fill', this.defaultTextFill);
        text3.textContent = (`id : ` + `'${inNode.id}' (attr.) ` + `'${inNodeId}' (array)`);
        if (text3.textContent.length > this.defaultMaxTextWidth) {
            text3.setAttribute('textLength', `${this.defaultTextBoxWidth - 20}`);
            text3.setAttribute('lengthAdjust', 'spacingAndGlyphs');
            /* to be removed - start */
            console.log('node "' + inNodeId + '" found that info text line 3 is too long (' + text3.textContent.length + ')');
            /* to be removed - end */
        };
        text4.setAttribute('x', `${x + 10}`);
        text4.setAttribute('y', `${y}`);
        text4.setAttribute('dy', '4.1em');
        text4.setAttribute('fill', this.defaultTextFill);
        text4.textContent = (`coords : ` + `(${inNode.x}`+ `|`+ `${inNode.y})`);
        if (text4.textContent.length > this.defaultMaxTextWidth) {
            text4.setAttribute('textLength', `${this.defaultTextBoxWidth - 20}`);
            text4.setAttribute('lengthAdjust', 'spacingAndGlyphs');
            /* to be removed - start */
            console.log('node "' + inNodeId + '" found that info text line 4 is too long (' + text4.textContent.length + ')');
            /* to be removed - end */
        };
        text5.setAttribute('x', `${x + 10}`);
        text5.setAttribute('y', `${y}`);
        text5.setAttribute('dy', '5.1em');
        text5.setAttribute('fill', this.defaultTextFill);
        if (inNode.dfg !== undefined) {
            text5.textContent = (`dfg : ` + `'${inNode.dfg}'`);
        } else {
            text5.textContent = (`dfg : ` + `'none'`);
        };
        if (text5.textContent.length > this.defaultMaxTextWidth) {
            text5.setAttribute('textLength', `${this.defaultTextBoxWidth - 20}`);
            text5.setAttribute('lengthAdjust', 'spacingAndGlyphs');
            /* to be removed - start */
            console.log('node "' + inNodeId + '" found that info text line 5 is too long (' + text5.textContent.length + ')');
            /* to be removed - end */
        };
        cont.appendChild(text0);
        cont.appendChild(text1);
        cont.appendChild(text2);
        cont.appendChild(text3);
        cont.appendChild(text4);
        cont.appendChild(text5);
        svg.appendChild(rect);
        svg.appendChild(cont);
        this.infosSVG.appendChild(svg);
        inNode.registerInfoSvg(svg);
        return svg;
    };

    private createSvgTrace(inTrace : Node[], inAnimationDelay : number, inAnimationDuration : number) : SVGElement {
        const svg : SVGElement = this.createSvgElement('circle');
        svg.setAttribute('customType', 'trace-animation');
        svg.setAttribute('cx', '0');
        svg.setAttribute('cy', '0');
        svg.setAttribute('r', `${this.defaultTraceRadius}`);
        svg.setAttribute('stroke-width', '2');
        if (this._displayMode === 'default') {
            svg.setAttribute('stroke', `${this.defaultTraceStroke}`);
            svg.setAttribute('fill', `${this.defaultTraceFill}`);
        } else {
            svg.setAttribute('stroke', `${this.dfgTraceStroke}`);
            svg.setAttribute('fill', `${this.dfgTraceFill}`);
        };
        const animation : SVGElement = this.createSvgElement('animateMotion');
        animation.setAttribute('begin', (`${inAnimationDelay}` + `s`));
        animation.setAttribute('dur', (`${inAnimationDuration}` + `s`));
        animation.setAttribute('repeatCount', 'indefinite');
        let path : string = '';
        let currentNode : Node = inTrace[0];
        path = (`M ` + `${currentNode.x}` + ` ` + `${currentNode.y}`);
        for (let nodeIdx = 1; nodeIdx < inTrace.length; nodeIdx++) {
            currentNode = inTrace[nodeIdx];
            path = (`${path}` + `, ` + `${currentNode.x}` + ` ` + `${currentNode.y}`)
        };
        animation.setAttribute('path', path);
        svg.appendChild(animation);
        return svg;
    };

    private createSvgElement(name: string): SVGElement {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    };

    private initArrow() : void {
        const arrowDefs : SVGElement = this.createSvgElement('defs');
        const arrowMarkD : SVGElement = this.createSvgElement('marker');
        arrowMarkD.setAttribute('id', 'arrow_head_default');
        arrowMarkD.setAttribute('viewBox', ('0 0 ' + `${this.defaultArrowRadius * 2}` + ' ' + `${this.defaultArrowRadius * 2}`));
        arrowMarkD.setAttribute('refX', `${(this.defaultArrowRadius * 2) + Math.floor(this.defaultNodeRadius / 6)}`);
        arrowMarkD.setAttribute('refY', `${this.defaultArrowRadius}`);
        arrowMarkD.setAttribute('markerHeight', `${this.defaultArrowRadius * 2}`);
        arrowMarkD.setAttribute('markerWidth', `${this.defaultArrowRadius * 2}`);
        arrowMarkD.setAttribute('markerUnits', 'strokeWidth');
        arrowMarkD.setAttribute('orient', 'auto');
        const arrowPathD : SVGElement = this.createSvgElement('path');
        arrowPathD.setAttribute('d', 'M 0 0 L '+ `${this.defaultArrowRadius * 2}` + ' ' + `${this.defaultArrowRadius}` + ' L 0 ' + `${this.defaultArrowRadius * 2}` + ' z');
        arrowPathD.setAttribute('fill', this.defaultArcStroke);
        const arrowMarkM : SVGElement = this.createSvgElement('marker');
        arrowMarkM.setAttribute('id', 'arrow_head_marked');
        arrowMarkM.setAttribute('viewBox', ('0 0 ' + `${this.defaultArrowRadius * 2}` + ' ' + `${this.defaultArrowRadius * 2}`));
        arrowMarkM.setAttribute('refX', `${(this.defaultArrowRadius * 2) + Math.floor(this.defaultNodeRadius / 6)}`);
        arrowMarkM.setAttribute('refY', `${this.defaultArrowRadius}`);
        arrowMarkM.setAttribute('markerHeight', `${this.defaultArrowRadius * 2}`);
        arrowMarkM.setAttribute('markerWidth', `${this.defaultArrowRadius * 2}`);
        arrowMarkM.setAttribute('markerUnits', 'strokeWidth');
        arrowMarkM.setAttribute('orient', 'auto');
        const arrowPathM : SVGElement = this.createSvgElement('path');
        arrowPathM.setAttribute('d', 'M 0 0 L '+ `${this.defaultArrowRadius * 2}` + ' ' + `${this.defaultArrowRadius}` + ' L 0 ' + `${this.defaultArrowRadius * 2}` + ' z');
        arrowPathM.setAttribute('fill', this.markedArcStroke);
        const arrowMarkA : SVGElement = this.createSvgElement('marker');
        arrowMarkA.setAttribute('id', 'arrow_head_active');
        arrowMarkA.setAttribute('viewBox', ('0 0 ' + `${this.defaultArrowRadius * 2}` + ' ' + `${this.defaultArrowRadius * 2}`));
        arrowMarkA.setAttribute('refX', `${(this.defaultArrowRadius * 2) + Math.floor(this.defaultNodeRadius / 6)}`);
        arrowMarkA.setAttribute('refY', `${this.defaultArrowRadius}`);
        arrowMarkA.setAttribute('markerHeight', `${this.defaultArrowRadius * 2}`);
        arrowMarkA.setAttribute('markerWidth', `${this.defaultArrowRadius * 2}`);
        arrowMarkA.setAttribute('markerUnits', 'strokeWidth');
        arrowMarkA.setAttribute('orient', 'auto');
        const arrowPathA : SVGElement = this.createSvgElement('path');
        arrowPathA.setAttribute('d', 'M 0 0 L '+ `${this.defaultArrowRadius * 2}` + ' ' + `${this.defaultArrowRadius}` + ' L 0 ' + `${this.defaultArrowRadius * 2}` + ' z');
        arrowPathA.setAttribute('fill', this.activeArcStroke);
        const arrowMarkV : SVGElement = this.createSvgElement('marker');
        arrowMarkV.setAttribute('id', 'arrow_head_visited');
        arrowMarkV.setAttribute('viewBox', ('0 0 ' + `${this.defaultArrowRadius * 2}` + ' ' + `${this.defaultArrowRadius * 2}`));
        arrowMarkV.setAttribute('refX', `${(this.defaultArrowRadius * 2) + Math.floor(this.defaultNodeRadius / 6)}`);
        arrowMarkV.setAttribute('refY', `${this.defaultArrowRadius}`);
        arrowMarkV.setAttribute('markerHeight', `${this.defaultArrowRadius * 2}`);
        arrowMarkV.setAttribute('markerWidth', `${this.defaultArrowRadius * 2}`);
        arrowMarkV.setAttribute('markerUnits', 'strokeWidth');
        arrowMarkV.setAttribute('orient', 'auto');
        const arrowPathV : SVGElement = this.createSvgElement('path');
        arrowPathV.setAttribute('d', 'M 0 0 L '+ `${this.defaultArrowRadius * 2}` + ' ' + `${this.defaultArrowRadius}` + ' L 0 ' + `${this.defaultArrowRadius * 2}` + ' z');
        arrowPathV.setAttribute('fill', this.visitedArcStroke);
        const arrowMarkDFG : SVGElement = this.createSvgElement('marker');
        arrowMarkDFG.setAttribute('id', 'arrow_head_dfg');
        arrowMarkDFG.setAttribute('viewBox', ('0 0 ' + `${this.defaultArrowRadius * 2}` + ' ' + `${this.defaultArrowRadius * 2}`));
        arrowMarkDFG.setAttribute('refX', `${(this.defaultArrowRadius * 2) + Math.floor(this.defaultNodeRadius / 6)}`);
        arrowMarkDFG.setAttribute('refY', `${this.defaultArrowRadius}`);
        arrowMarkDFG.setAttribute('markerHeight', `${this.defaultArrowRadius * 2}`);
        arrowMarkDFG.setAttribute('markerWidth', `${this.defaultArrowRadius * 2}`);
        arrowMarkDFG.setAttribute('markerUnits', 'strokeWidth');
        arrowMarkDFG.setAttribute('orient', 'auto');
        const arrowPathDFG : SVGElement = this.createSvgElement('path');
        arrowPathDFG.setAttribute('d', 'M 0 0 L '+ `${this.defaultArrowRadius * 2}` + ' ' + `${this.defaultArrowRadius}` + ' L 0 ' + `${this.defaultArrowRadius * 2}` + ' z');
        arrowPathDFG.setAttribute('fill', this.defaultNodeStroke);
        arrowMarkD.appendChild(arrowPathD);
        arrowDefs.appendChild(arrowMarkD);
        arrowMarkM.appendChild(arrowPathM);
        arrowDefs.appendChild(arrowMarkM);
        arrowMarkA.appendChild(arrowPathA);
        arrowDefs.appendChild(arrowMarkA);
        arrowMarkV.appendChild(arrowPathV);
        arrowDefs.appendChild(arrowMarkV);
        arrowMarkDFG.appendChild(arrowPathDFG);
        arrowDefs.appendChild(arrowMarkDFG);
        this.arrowSVG.appendChild(arrowDefs);
        const div = document.getElementById('canvas');
        if (div !== null) {
            div.appendChild(this.arrowSVG);
        } else {
            throw new Error('#srv.svg.ina.000: ' + 'initialization of arrow-svg failed - main drawing area div (identifier: "canvas") could not be located');
        };
    };

    private initInfos() : void {
        const div = document.getElementById('canvas');
        if (div !== null) {
            div.appendChild(this.infosSVG);
        } else {
            throw new Error('#srv.svg.ini.000: ' + 'initialization of infos-svg failed - main drawing area div (identifier: "canvas") could not be located');
        };
    };

};