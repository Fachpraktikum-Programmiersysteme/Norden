import {Injectable} from '@angular/core';

import {CssColorName} from '../classes/display/css-color-names';
import {Graph} from '../classes/graph-representation/graph';
import {Node} from '../classes/graph-representation/node';

@Injectable({
    providedIn: 'root'
})
export class SvgService {

    /* attributes */

    private readonly canvasWidth : number = 1800;
    private readonly canvasHeight : number = 600;

    private readonly defaultTextBoxWidth : number = 400;
    private readonly defaultTextBoxHeight : number = 75;

    private readonly defaultMaxTextWidth : number = Math.floor(Math.ceil(this.defaultTextBoxWidth - (this.defaultTextBoxWidth / 10)) / 10)

    // private readonly defaultAnimationDelay : number = 2;

    private readonly svgDefaultNodeRadius : number = 20;
    private readonly svgDefaultArrowRadius : number = 2;
    private readonly svgDefaultTraceRadius : number = 5;
    private readonly svgDefaultStrokeWidth : number = 5;

    private readonly svgDefaultNodeStroke : CssColorName = 'Black';
    private readonly svgDefaultNodeFill : CssColorName = 'Silver';
    private readonly svgDefaultArcColor : CssColorName = 'Gray';
    private readonly svgActiveNodeStroke : CssColorName = 'Green';
    private readonly svgActiveNodeFill : CssColorName = 'Lime';
    private readonly svgVisitedNodeStroke : CssColorName = 'Blue';
    private readonly svgVisitedNodeFill : CssColorName = 'Aqua';
    private readonly svgMarkedNodeStroke : CssColorName = 'Maroon';
    private readonly svgMarkedArcColor : CssColorName = 'Fuchsia';
    private readonly svgDefaultTraceStroke : CssColorName = 'Olive';
    private readonly svgDefaultTraceFill : CssColorName = 'Yellow';

    private readonly arrowSVG : SVGElement = this.createSvgElement('svg');
    private readonly infosSVG : SVGElement = this.createSvgElement('svg');

    private _infoOverwrite : boolean = false;
    private _noAnimations : boolean = false;

    /* methods - constructor */

    public constructor() {
        this.initArrow();
        this.initInfos();
    };

    /* methods - setters */

    public set infoOverwrite(inValue : boolean) {
        this._infoOverwrite = inValue;
    };

    public set noAnimations(inValue : boolean) {
        this._noAnimations = inValue;
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
                arcSvgArray.push(this.createSvgArc([arc[0], arc[1]], arc[3], arcId));
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

    public createSvgTraces(inGraph : Graph, inEventLog : number[][], inMaxTraceLength : number) : Array<SVGElement> {
        const traceSvgArray: Array<SVGElement> = [];
        if (!this._noAnimations) {
            const duration =  (inMaxTraceLength * 2);
            const interval = (duration / (inEventLog.length));
            let delay : number = 0;
            for (const trace of inEventLog) {
                if (trace.length > 0) {
                    traceSvgArray.push(this.createSvgTrace(inGraph, trace, delay, duration));
                    delay = delay + interval;
                };
            };
        };
        return traceSvgArray;
    }

    private createSvgNode(inNode : Node, inNodeId : number) : SVGElement {
        let svg : SVGElement;
        switch (inNode.type) {
            case 'support' : {
                svg = this.createSvgElement('rect');
                svg.setAttribute('id', ('support_' + inNodeId));
                svg.setAttribute('x', `${inNode.x - this.svgDefaultNodeRadius + 1}`);
                svg.setAttribute('y', `${inNode.y - this.svgDefaultNodeRadius + 1}`);
                svg.setAttribute('width', `${(this.svgDefaultNodeRadius * 2) - 1}`);
                svg.setAttribute('height', `${(this.svgDefaultNodeRadius * 2) - 1}`);
                svg.setAttribute('rx', `${Math.floor(this.svgDefaultNodeRadius / 2)}`);
                break;
            }
            case 'event' : {
                svg = this.createSvgElement('rect');
                svg.setAttribute('id', ('event_' + inNodeId));
                svg.setAttribute('x', `${inNode.x - this.svgDefaultNodeRadius + 1}`);
                svg.setAttribute('y', `${inNode.y - this.svgDefaultNodeRadius + 1}`);
                svg.setAttribute('width', `${(this.svgDefaultNodeRadius * 2) - 1}`);
                svg.setAttribute('height', `${(this.svgDefaultNodeRadius * 2) - 1}`);
                svg.setAttribute('rx', `${Math.floor(this.svgDefaultNodeRadius / 2)}`);
                break;
            }
            case 'place' : {
                svg = this.createSvgElement('circle');
                svg.setAttribute('id', ('place_' + inNodeId));
                svg.setAttribute('cx', `${inNode.x}`);
                svg.setAttribute('cy', `${inNode.y}`);
                svg.setAttribute('r', `${this.svgDefaultNodeRadius}`);
                break;
            }
            case 'transition' : {
                svg = this.createSvgElement('rect');
                svg.setAttribute('id', ('transition_' + inNodeId));
                svg.setAttribute('x', `${inNode.x - this.svgDefaultNodeRadius + 1}`);
                svg.setAttribute('y', `${inNode.y - this.svgDefaultNodeRadius + 1}`);
                svg.setAttribute('width', `${(this.svgDefaultNodeRadius * 2) - 1}`);
                svg.setAttribute('height', `${(this.svgDefaultNodeRadius * 2) - 1}`);
                svg.setAttribute('rx', `${0}`);
                break;
            }
        };
        svg.setAttribute('stroke-width', `${this.svgDefaultStrokeWidth}`);
        if (inNode.isMarked) {
            svg.setAttribute('stroke', this.svgMarkedNodeStroke);
            if (inNode.isActive) {
                svg.setAttribute('fill', this.svgActiveNodeFill);
            } else if (inNode.wasVisited) {
                svg.setAttribute('fill', this.svgVisitedNodeFill);
            } else {
                /* impossible case */
                svg.setAttribute('fill', this.svgDefaultNodeFill);
            };
        } else {
            if (inNode.isActive) {
                svg.setAttribute('stroke', this.svgActiveNodeStroke);
                svg.setAttribute('fill', this.svgActiveNodeFill);
            } else if (inNode.wasVisited) {
                svg.setAttribute('stroke', this.svgVisitedNodeStroke);
                svg.setAttribute('fill', this.svgVisitedNodeFill);
            } else {
                svg.setAttribute('stroke', this.svgDefaultNodeStroke);
                svg.setAttribute('fill', this.svgDefaultNodeFill);
            };
        };
        inNode.registerNodeSvg(svg);
        return(svg);
    };

    private createSvgArc(inNodes : [Node, Node], inMarking : boolean, inArcId : number) : SVGElement {
        const svg : SVGElement = this.createSvgElement('line');
        svg.setAttribute('id', ('arc_' + inArcId));
        svg.setAttribute('x1', `${inNodes[0].x}`);
        svg.setAttribute('y1', `${inNodes[0].y}`);
        svg.setAttribute('x2', `${inNodes[1].x}`);
        svg.setAttribute('y2', `${inNodes[1].y}`);
        svg.setAttribute('stroke-width', `${this.svgDefaultStrokeWidth}`);
        if (inMarking) {
            svg.setAttribute('stroke', this.svgMarkedArcColor);
            svg.setAttribute('marker-end', 'url(#arrow_head_marked)');
        } else {
            svg.setAttribute('stroke', this.svgDefaultArcColor);
            svg.setAttribute('marker-end', 'url(#arrow_head_default)');
        };
        this.arrowSVG.appendChild(svg);
        return svg;
    };

    private createSvgInfo(inNode : Node, inNodeId : number) : SVGElement {
        let x : number;
        let y : number;
        if (inNode.x < Math.ceil(this.canvasWidth / 2)) {
            if (inNode.y < Math.ceil(this.canvasHeight / 2)) {
                x = inNode.x + (this.svgDefaultNodeRadius + 3);
                y = inNode.y + (this.svgDefaultNodeRadius + 3);
                x = inNode.x + (this.svgDefaultNodeRadius + 3);
                y = inNode.y + (this.svgDefaultNodeRadius + 3);
            } else {
                x = inNode.x + (this.svgDefaultNodeRadius + 3);
                y = inNode.y - (this.svgDefaultNodeRadius + 3 + this.defaultTextBoxHeight);
                x = inNode.x + (this.svgDefaultNodeRadius + 3);
                y = inNode.y - (this.svgDefaultNodeRadius + 3 + this.defaultTextBoxHeight);
            };
        } else {
            if (inNode.y < Math.ceil(this.canvasHeight / 2)) {
                x = inNode.x - (this.svgDefaultNodeRadius + 3 + this.defaultTextBoxWidth);
                y = inNode.y + (this.svgDefaultNodeRadius + 3);
                x = inNode.x - (this.svgDefaultNodeRadius + 3 + this.defaultTextBoxWidth);
                y = inNode.y + (this.svgDefaultNodeRadius + 3);
            } else {
                x = inNode.x - (this.svgDefaultNodeRadius + 3 + this.defaultTextBoxWidth);
                y = inNode.y - (this.svgDefaultNodeRadius + 3 + this.defaultTextBoxHeight);
                x = inNode.x - (this.svgDefaultNodeRadius + 3 + this.defaultTextBoxWidth);
                y = inNode.y - (this.svgDefaultNodeRadius + 3 + this.defaultTextBoxHeight);
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
        // svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        if (this._infoOverwrite) {
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
        rect.setAttribute('fill', 'White');
        rect.setAttribute('stroke', 'Black');
        rect.setAttribute('stroke-width', '2');
        rect.setAttribute('rx', '10');
        cont.setAttribute('x', `${x}`);
        cont.setAttribute('y', `${y}`);
        cont.setAttribute('width', `${this.defaultTextBoxWidth}`);
        cont.setAttribute('height', `${this.defaultTextBoxHeight}`);
        text0.setAttribute('x', `${x + 10}`);
        text0.setAttribute('y', `${y}`);
        text0.setAttribute('dy', '0.4em');
        text0.setAttribute('fill', 'White');
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
            console.log('node "' + inNodeId + '" found that text no. 1 is too long (' + text1.textContent.length + ')');
            /* to be removed - end */
        };
        text2.setAttribute('x', `${x + 10}`);
        text2.setAttribute('y', `${y}`);
        text2.setAttribute('dy', '2.1em');
        text2.setAttribute('fill', 'Black');
        text2.textContent = (`type : ` + `'${inNode.type}'`);
        if (text2.textContent.length > this.defaultMaxTextWidth) {
            text2.setAttribute('textLength', `${this.defaultTextBoxWidth - 20}`);
            text2.setAttribute('lengthAdjust', 'spacingAndGlyphs');
            /* to be removed - start */
            console.log('node "' + inNodeId + '" found that text no. 2 is too long (' + text2.textContent.length + ')');
            /* to be removed - end */
        };
        text3.setAttribute('x', `${x + 10}`);
        text3.setAttribute('y', `${y}`);
        text3.setAttribute('dy', '3.1em');
        text3.setAttribute('fill', 'Black');
        text3.textContent = (`id : ` + `'${inNode.id}' (attr.) ` + `'${inNodeId}' (array)`);
        if (text3.textContent.length > this.defaultMaxTextWidth) {
            text3.setAttribute('textLength', `${this.defaultTextBoxWidth - 20}`);
            text3.setAttribute('lengthAdjust', 'spacingAndGlyphs');
            /* to be removed - start */
            console.log('node "' + inNodeId + '" found that text no. 3 is too long (' + text3.textContent.length + ')');
            /* to be removed - end */
        };
        text4.setAttribute('x', `${x + 10}`);
        text4.setAttribute('y', `${y}`);
        text4.setAttribute('dy', '4.1em');
        text4.setAttribute('fill', 'Black');
        text4.textContent = (`coords : ` + `(${inNode.x}`+ `|`+ `${inNode.y})`);
        if (text4.textContent.length > this.defaultMaxTextWidth) {
            text4.setAttribute('textLength', `${this.defaultTextBoxWidth - 20}`);
            text4.setAttribute('lengthAdjust', 'spacingAndGlyphs');
            /* to be removed - start */
            console.log('node "' + inNodeId + '" found that text no. 4 is too long (' + text4.textContent.length + ')');
            /* to be removed - end */
        };
        cont.appendChild(text0);
        cont.appendChild(text1);
        cont.appendChild(text2);
        cont.appendChild(text3);
        cont.appendChild(text4);
        svg.appendChild(rect);
        svg.appendChild(cont);
        this.infosSVG.appendChild(svg);
        inNode.registerInfoSvg(svg);
        return svg;
    };

    private createSvgTrace(inGraph : Graph, inTrace : number[], inAnimationDelay : number, inAnimationDuration : number) : SVGElement {
        const svg : SVGElement = this.createSvgElement('circle');
        svg.setAttribute('cx', '0');
        svg.setAttribute('cy', '0');
        svg.setAttribute('r', `${this.svgDefaultTraceRadius}`);
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke', `${this.svgDefaultTraceStroke}`);
        svg.setAttribute('fill', `${this.svgDefaultTraceFill}`);
        const animation : SVGElement = this.createSvgElement('animateMotion');
        animation.setAttribute('begin', (`${inAnimationDelay}` + `s`));
        animation.setAttribute('dur', (`${inAnimationDuration}` + `s`));
        animation.setAttribute('repeatCount', 'indefinite');
        let path : string = '';
        let currentNode : Node | undefined = inGraph.nodes[inTrace[0]];
        if (currentNode !== undefined) {
            path = (`M ` + `${currentNode.x}` + ` ` + `${currentNode.y}`)
        } else {
            throw new Error('#srv.svg.cst.000: ' + 'creation of trace-svg failed - node ' + 0 + ' is undefined');
        };
        for (let nodeIdx = 1; nodeIdx < inTrace.length; nodeIdx++) {
            currentNode = inGraph.nodes[inTrace[nodeIdx]];
            if (currentNode !== undefined) {
                path = (`${path}` + `, ` + `${currentNode.x}` + ` ` + `${currentNode.y}`)
            } else {
                throw new Error('#srv.svg.cst.001: ' + 'creation of trace-svg failed - node "' + nodeIdx + '" is undefined');
            };
        };
        animation.setAttribute('path', path);
        svg.appendChild(animation);
        return svg;
    };

    private createSvgElement(name : string): SVGElement {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    };

    private initArrow() : void {
        const arrowDefs : SVGElement = this.createSvgElement('defs');
        const arrowMarkD : SVGElement = this.createSvgElement('marker');
        arrowMarkD.setAttribute('id', 'arrow_head_default');
        arrowMarkD.setAttribute('viewBox', ('0 0 ' + `${this.svgDefaultArrowRadius * 2}` + ' ' + `${this.svgDefaultArrowRadius * 2}`));
        arrowMarkD.setAttribute('refX', `${(this.svgDefaultArrowRadius * 2) + Math.floor(this.svgDefaultNodeRadius / 6)}`);
        arrowMarkD.setAttribute('refY', `${this.svgDefaultArrowRadius}`);
        arrowMarkD.setAttribute('markerHeight', `${this.svgDefaultArrowRadius * 2}`);
        arrowMarkD.setAttribute('markerWidth', `${this.svgDefaultArrowRadius * 2}`);
        arrowMarkD.setAttribute('markerUnits', 'strokeWidth');
        arrowMarkD.setAttribute('orient', 'auto');
        const arrowPathD : SVGElement = this.createSvgElement('path');
        arrowPathD.setAttribute('d', 'M 0 0 L '+ `${this.svgDefaultArrowRadius * 2}` + ' ' + `${this.svgDefaultArrowRadius}` + ' L 0 ' + `${this.svgDefaultArrowRadius * 2}` + ' z');
        arrowPathD.setAttribute('fill', this.svgDefaultArcColor);
        const arrowMarkM : SVGElement = this.createSvgElement('marker');
        arrowMarkM.setAttribute('id', 'arrow_head_marked');
        arrowMarkM.setAttribute('viewBox', ('0 0 ' + `${this.svgDefaultArrowRadius * 2}` + ' ' + `${this.svgDefaultArrowRadius * 2}`));
        arrowMarkM.setAttribute('refX', `${(this.svgDefaultArrowRadius * 2) + Math.floor(this.svgDefaultNodeRadius / 6)}`);
        arrowMarkM.setAttribute('refY', `${this.svgDefaultArrowRadius}`);
        arrowMarkM.setAttribute('markerHeight', `${this.svgDefaultArrowRadius * 2}`);
        arrowMarkM.setAttribute('markerWidth', `${this.svgDefaultArrowRadius * 2}`);
        arrowMarkM.setAttribute('markerUnits', 'strokeWidth');
        arrowMarkM.setAttribute('orient', 'auto');
        const arrowPathM : SVGElement = this.createSvgElement('path');
        arrowPathM.setAttribute('d', 'M 0 0 L '+ `${this.svgDefaultArrowRadius * 2}` + ' ' + `${this.svgDefaultArrowRadius}` + ' L 0 ' + `${this.svgDefaultArrowRadius * 2}` + ' z');
        arrowPathM.setAttribute('fill', this.svgMarkedArcColor);
        arrowMarkD.appendChild(arrowPathD);
        arrowDefs.appendChild(arrowMarkD);
        arrowMarkM.appendChild(arrowPathM);
        arrowDefs.appendChild(arrowMarkM);
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