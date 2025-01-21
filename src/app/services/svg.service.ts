import {Injectable, OnDestroy} from '@angular/core';

import {Subscription} from 'rxjs';

import {DisplaySettingsSingleton} from "../classes/display/display-settings.singleton";
import {GraphGraphicsConfig} from "../classes/display/graph-graphics.config";
import {Graph} from '../classes/graph-representation/graph';
import {Node} from '../classes/graph-representation/node';
import {Arc} from '../classes/graph-representation/arc';

@Injectable({
    providedIn: 'root'
})
export class SvgService implements OnDestroy {

    /* attributes */

    private readonly _sub : Subscription;

    private readonly arrowSVG : SVGElement = this.createSvgElement('svg');
    private readonly infosSVG : SVGElement = this.createSvgElement('svg');

    private _displayMode : 'dfg' | 'changes' = 'dfg';
    private _infoOverride : boolean = false;
    private _animations : boolean = false;
    private _weights : boolean = false;

    /* methods - constructor */

    public constructor(
        private displaySettings: DisplaySettingsSingleton,
        private graphicsConfig: GraphGraphicsConfig
    ) {
        this.initArrow();
        this.initInfos();
        this._sub = this.displaySettings.state$.subscribe(
            (state) => {
                this._displayMode = state.mode;
                this._infoOverride = !(state.infoOverrideDisabled);
                this._animations = !(state.traceAnimationsDisabled);
                this._weights = !(state.arcWeightsDisabled);
            }
        );
    };

    /* methods - on destroy */

    ngOnDestroy(): void {
        this._sub.unsubscribe();
    };

    /* methods - getters */

    public get nodeRadius() : number {
        return this.graphicsConfig.defaultNodeRadius;
    };

    /* methods - other */

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

    public createSvgWeights(inGraph : Graph) : Array<SVGElement> {
        const weightSvgArray: Array<SVGElement> = [];
        if (this._weights) {
            for (const arc of inGraph.arcs) {
                if (arc !== undefined) {
                    weightSvgArray.push(this.createSvgWeight(arc));
                } else {
                    /* skip undefined arc */
                };
            };
        };
        return weightSvgArray;
    };

    public createSvgTraces(inGraph : Graph) : Array<SVGElement> {
        const traceSvgArray: Array<SVGElement> = [];
        if (this._animations) {
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
        svg.setAttribute('stroke', this.graphicsConfig.defaultCutStroke);
        return svg;
    };

    private createSvgNode(inNode : Node, inNodeId : number) : SVGElement {
        let svg : SVGElement;
        switch (inNode.type) {
            case 'support' : {
                svg = this.createSvgElement('rect');
                svg.setAttribute('customType', 'support-node');
                svg.setAttribute('id', ('support_' + inNodeId));
                svg.setAttribute('x', `${inNode.x - this.graphicsConfig.defaultNodeRadius + 1}`);
                svg.setAttribute('y', `${inNode.y - this.graphicsConfig.defaultNodeRadius + 1}`);
                svg.setAttribute('width', `${(this.graphicsConfig.defaultNodeRadius * 2) - 1}`);
                svg.setAttribute('height', `${(this.graphicsConfig.defaultNodeRadius * 2) - 1}`);
                svg.setAttribute('rx', `${Math.floor(this.graphicsConfig.defaultNodeRadius / 2)}`);
                break;
            }
            case 'event' : {
                svg = this.createSvgElement('rect');
                svg.setAttribute('customType', 'event-node');
                svg.setAttribute('id', ('event_' + inNodeId));
                svg.setAttribute('x', `${inNode.x - this.graphicsConfig.defaultNodeRadius + 1}`);
                svg.setAttribute('y', `${inNode.y - this.graphicsConfig.defaultNodeRadius + 1}`);
                svg.setAttribute('width', `${(this.graphicsConfig.defaultNodeRadius * 2) - 1}`);
                svg.setAttribute('height', `${(this.graphicsConfig.defaultNodeRadius * 2) - 1}`);
                svg.setAttribute('rx', `${Math.floor(this.graphicsConfig.defaultNodeRadius / 2)}`);
                break;
            }
            case 'place' : {
                svg = this.createSvgElement('circle');
                svg.setAttribute('customType', 'place-node');
                svg.setAttribute('id', ('place_' + inNodeId));
                svg.setAttribute('cx', `${inNode.x}`);
                svg.setAttribute('cy', `${inNode.y}`);
                svg.setAttribute('r', `${this.graphicsConfig.defaultNodeRadius}`);
                break;
            }
            case 'transition' : {
                svg = this.createSvgElement('rect');
                svg.setAttribute('customType', 'transition-node');
                svg.setAttribute('id', ('transition_' + inNodeId));
                svg.setAttribute('x', `${inNode.x - this.graphicsConfig.defaultNodeRadius + 1}`);
                svg.setAttribute('y', `${inNode.y - this.graphicsConfig.defaultNodeRadius + 1}`);
                svg.setAttribute('width', `${(this.graphicsConfig.defaultNodeRadius * 2) - 1}`);
                svg.setAttribute('height', `${(this.graphicsConfig.defaultNodeRadius * 2) - 1}`);
                svg.setAttribute('rx', `${0}`);
                break;
            }
        };
        svg.setAttribute('stroke-width', `${this.graphicsConfig.defaultStrokeWidth}`);
        if (this._displayMode === 'dfg') {
            if (inNode.marked) {
                svg.setAttribute('stroke', this.graphicsConfig.markedNodeStroke);
            } else {
                svg.setAttribute('stroke', this.graphicsConfig.defaultNodeStroke);
            };
            if (inNode.active) {
                svg.setAttribute('fill', this.graphicsConfig.activeNodeFill);
            } else {
                if (inNode.dfg !== undefined) {
                    svg.setAttribute('fill', GraphGraphicsConfig.getDfgColor(inNode.dfg))
                } else {
                    svg.setAttribute('fill', this.graphicsConfig.defaultNodeFill);
                };
            };
        } else {
            if (inNode.marked) {
                svg.setAttribute('stroke', this.graphicsConfig.markedNodeStroke);
                if (inNode.active) {
                    svg.setAttribute('fill', this.graphicsConfig.activeNodeFill);
                } else if (inNode.changed) {
                    svg.setAttribute('fill', this.graphicsConfig.changedNodeFill);
                } else if (inNode.newlyCreated) {
                    svg.setAttribute('fill', this.graphicsConfig.newNodeFill);
                } else {
                    svg.setAttribute('fill', this.graphicsConfig.defaultNodeFill);
                };
            } else {
                if (inNode.active) {
                    svg.setAttribute('stroke', this.graphicsConfig.activeNodeStroke);
                    svg.setAttribute('fill', this.graphicsConfig.activeNodeFill);
                } else if (inNode.changed) {
                    svg.setAttribute('stroke', this.graphicsConfig.changedNodeStroke);
                    svg.setAttribute('fill', this.graphicsConfig.changedNodeFill);
                } else if (inNode.newlyCreated) {
                    svg.setAttribute('stroke', this.graphicsConfig.newNodeStroke);
                    svg.setAttribute('fill', this.graphicsConfig.newNodeFill);
                } else {
                    svg.setAttribute('stroke', this.graphicsConfig.defaultNodeStroke);
                    svg.setAttribute('fill', this.graphicsConfig.defaultNodeFill);
                };
            };
        };
        inNode.registerNodeSvg(svg);
        return(svg);
    };

    private createSvgInfo(inNode : Node, inNodeId : number) : SVGElement {
        let x : number;
        let y : number;
        if (inNode.x < Math.ceil(this.graphicsConfig.canvasWidth / 2)) {
            if (inNode.y < Math.ceil(this.graphicsConfig.canvasHeight / 2)) {
                x = inNode.x + (this.graphicsConfig.defaultNodeRadius + 3);
                y = inNode.y + (this.graphicsConfig.defaultNodeRadius + 3);
                x = inNode.x + (this.graphicsConfig.defaultNodeRadius + 3);
                y = inNode.y + (this.graphicsConfig.defaultNodeRadius + 3);
            } else {
                x = inNode.x + (this.graphicsConfig.defaultNodeRadius + 3);
                y = inNode.y - (this.graphicsConfig.defaultNodeRadius + 3 + this.graphicsConfig.defaultTextBoxHeight);
                x = inNode.x + (this.graphicsConfig.defaultNodeRadius + 3);
                y = inNode.y - (this.graphicsConfig.defaultNodeRadius + 3 + this.graphicsConfig.defaultTextBoxHeight);
            };
        } else {
            if (inNode.y < Math.ceil(this.graphicsConfig.canvasHeight / 2)) {
                x = inNode.x - (this.graphicsConfig.defaultNodeRadius + 3 + this.graphicsConfig.defaultTextBoxWidth);
                y = inNode.y + (this.graphicsConfig.defaultNodeRadius + 3);
                x = inNode.x - (this.graphicsConfig.defaultNodeRadius + 3 + this.graphicsConfig.defaultTextBoxWidth);
                y = inNode.y + (this.graphicsConfig.defaultNodeRadius + 3);
            } else {
                x = inNode.x - (this.graphicsConfig.defaultNodeRadius + 3 + this.graphicsConfig.defaultTextBoxWidth);
                y = inNode.y - (this.graphicsConfig.defaultNodeRadius + 3 + this.graphicsConfig.defaultTextBoxHeight);
                x = inNode.x - (this.graphicsConfig.defaultNodeRadius + 3 + this.graphicsConfig.defaultTextBoxWidth);
                y = inNode.y - (this.graphicsConfig.defaultNodeRadius + 3 + this.graphicsConfig.defaultTextBoxHeight);
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
        if (this._infoOverride || inNode.infoOverride || inNode.infoActive) {
            svg.setAttribute('visibility', 'visible');
        } else {
            svg.setAttribute('visibility', 'hidden');
        };
        rect.setAttribute('x', `${x}`);
        rect.setAttribute('y', `${y}`);
        rect.setAttribute('width', `${this.graphicsConfig.defaultTextBoxWidth}`);
        rect.setAttribute('height', `${this.graphicsConfig.defaultTextBoxHeight}`);
        rect.setAttribute('fill', this.graphicsConfig.defaultTextBoxFill);
        rect.setAttribute('stroke', this.graphicsConfig.defaultTextBoxStroke);
        rect.setAttribute('stroke-width', '2');
        rect.setAttribute('rx', '10');
        cont.setAttribute('x', `${x}`);
        cont.setAttribute('y', `${y}`);
        cont.setAttribute('width', `${this.graphicsConfig.defaultTextBoxWidth}`);
        cont.setAttribute('height', `${this.graphicsConfig.defaultTextBoxHeight}`);
        text0.setAttribute('x', `${x + 10}`);
        text0.setAttribute('y', `${y}`);
        text0.setAttribute('dy', '0.4em');
        text0.setAttribute('fill', this.graphicsConfig.defaultTextBoxFill);
        text0.textContent = ('...');
        text1.setAttribute('x', `${x + 10}`);
        text1.setAttribute('y', `${y}`);
        text1.setAttribute('dy', '1.1em');
        text1.setAttribute('fill', 'Black');
        text1.textContent = (`label : ` + `'${inNode.label}'`);
        if (text1.textContent.length > this.graphicsConfig.defaultMaxTextWidth) {
            text1.setAttribute('textLength', `${this.graphicsConfig.defaultTextBoxWidth - 20}`);
            text1.setAttribute('lengthAdjust', 'spacingAndGlyphs');
        };
        text2.setAttribute('x', `${x + 10}`);
        text2.setAttribute('y', `${y}`);
        text2.setAttribute('dy', '2.1em');
        text2.setAttribute('fill', this.graphicsConfig.defaultTextFill);
        text2.textContent = (`type : ` + `'${inNode.type}'`);
        if (text2.textContent.length > this.graphicsConfig.defaultMaxTextWidth) {
            text2.setAttribute('textLength', `${this.graphicsConfig.defaultTextBoxWidth - 20}`);
            text2.setAttribute('lengthAdjust', 'spacingAndGlyphs');
        };
        text3.setAttribute('x', `${x + 10}`);
        text3.setAttribute('y', `${y}`);
        text3.setAttribute('dy', '3.1em');
        text3.setAttribute('fill', this.graphicsConfig.defaultTextFill);
        text3.textContent = (`id : ` + `'${inNode.id}' (attr.) ` + `'${inNodeId}' (array)`);
        if (text3.textContent.length > this.graphicsConfig.defaultMaxTextWidth) {
            text3.setAttribute('textLength', `${this.graphicsConfig.defaultTextBoxWidth - 20}`);
            text3.setAttribute('lengthAdjust', 'spacingAndGlyphs');
        };
        text4.setAttribute('x', `${x + 10}`);
        text4.setAttribute('y', `${y}`);
        text4.setAttribute('dy', '4.1em');
        text4.setAttribute('fill', this.graphicsConfig.defaultTextFill);
        text4.textContent = (`coords : ` + `(${inNode.x}`+ `|`+ `${inNode.y})`);
        if (text4.textContent.length > this.graphicsConfig.defaultMaxTextWidth) {
            text4.setAttribute('textLength', `${this.graphicsConfig.defaultTextBoxWidth - 20}`);
            text4.setAttribute('lengthAdjust', 'spacingAndGlyphs');
        };
        text5.setAttribute('x', `${x + 10}`);
        text5.setAttribute('y', `${y}`);
        text5.setAttribute('dy', '5.1em');
        text5.setAttribute('fill', this.graphicsConfig.defaultTextFill);
        if (inNode.dfg !== undefined) {
            text5.textContent = (`dfg : ` + `'${inNode.dfg}'`);
        } else {
            text5.textContent = (`dfg : ` + `'none'`);
        };
        if (text5.textContent.length > this.graphicsConfig.defaultMaxTextWidth) {
            text5.setAttribute('textLength', `${this.graphicsConfig.defaultTextBoxWidth - 20}`);
            text5.setAttribute('lengthAdjust', 'spacingAndGlyphs');
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

    private createSvgArc(inArc: Arc, inArcId: number): SVGElement {
        const svg: SVGElement = this.createSvgElement('line');
        svg.setAttribute('customType', 'arc');
        svg.setAttribute('id', ('arc_' + inArcId));
        svg.setAttribute('stroke-width', `${this.graphicsConfig.defaultStrokeWidth}`);
        const arcVectorX : number = ((inArc.target.x) - (inArc.source.x));
        const arcVectorY : number = ((inArc.target.y) - (inArc.source.y));
        const arcVectorLength : number = (Math.sqrt((arcVectorX * arcVectorX) + (arcVectorY * arcVectorY)));
        const offVectorLength : number = ((this.graphicsConfig.defaultNodeRadius / 4) / arcVectorLength);
        const offsetX : number = (Math.floor(offVectorLength * arcVectorY * (-1)));
        const offsetY : number = (Math.floor(offVectorLength * arcVectorX));
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
        if (this._displayMode === 'dfg') {
            if (inArc.active  && !(inArc.overrideMarking)) {
                svg.setAttribute('stroke', this.graphicsConfig.activeArcStroke);
                svg.setAttribute('marker-end', 'url(#arrow_head_active)');
            } else if (inArc.marked) {
                svg.setAttribute('stroke', this.graphicsConfig.markedArcStroke);
                svg.setAttribute('marker-end', 'url(#arrow_head_marked)');
            } else if (inArc.dfg !== undefined) {
                svg.setAttribute('stroke', GraphGraphicsConfig.getDfgColor(inArc.dfg));
                svg.setAttribute('marker-end', 'url(#arrow_head_dfg)');
            } else {
                svg.setAttribute('stroke', this.graphicsConfig.defaultArcStroke);
                svg.setAttribute('marker-end', 'url(#arrow_head_default)');
            };
        } else {
            if (inArc.active) {
                svg.setAttribute('stroke', this.graphicsConfig.activeArcStroke);
                svg.setAttribute('marker-end', 'url(#arrow_head_active)');
            } else if (inArc.changed) {
                svg.setAttribute('stroke', this.graphicsConfig.changedArcStroke);
                svg.setAttribute('marker-end', 'url(#arrow_head_changed)');
            }else if (inArc.newlyCreated) {
                svg.setAttribute('stroke', this.graphicsConfig.newArcStroke);
                svg.setAttribute('marker-end', 'url(#arrow_head_new)');
            } else {
                svg.setAttribute('stroke', this.graphicsConfig.defaultArcStroke);
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
    //     svg.setAttribute('stroke-width', `${this.graphicsConfig.defaultStrokeWidth}`);
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

    private createSvgWeight(inArc : Arc) : SVGElement {
        const svg: SVGElement = this.createSvgElement('text');
        const arcVectorX : number = ((inArc.target.x) - (inArc.source.x));
        const arcVectorY : number = ((inArc.target.y) - (inArc.source.y));
        const halfVectorX : number = ((arcVectorX) / (2));
        const halfVectorY : number = ((arcVectorY) / (2));
        const svgX : number = (Math.floor((inArc.source.x) + (halfVectorX) - (0)));
        const svgY : number = (Math.floor((inArc.source.y) + (halfVectorY) + (0)));
        svg.setAttribute('x', `${svgX}`);
        svg.setAttribute('y', `${svgY}`);
        svg.setAttribute('fill', 'Black');
        svg.textContent = (`[${inArc.weight}]`);
        this.arrowSVG.appendChild(svg);
        return svg;
    };

    private createSvgTrace(inTrace : Node[], inAnimationDelay : number, inAnimationDuration : number) : SVGElement {
        const svg : SVGElement = this.createSvgElement('circle');
        svg.setAttribute('customType', 'trace-animation');
        svg.setAttribute('cx', '0');
        svg.setAttribute('cy', '0');
        svg.setAttribute('r', `${this.graphicsConfig.defaultTraceRadius}`);
        svg.setAttribute('stroke-width', '2');
        if (this._displayMode === 'dfg') {
            svg.setAttribute('stroke', `${this.graphicsConfig.dfgTraceStroke}`);
            svg.setAttribute('fill', `${this.graphicsConfig.dfgTraceFill}`);
        } else {
            svg.setAttribute('stroke', `${this.graphicsConfig.defaultTraceStroke}`);
            svg.setAttribute('fill', `${this.graphicsConfig.defaultTraceFill}`);
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
        arrowMarkD.setAttribute('viewBox', ('0 0 ' + `${this.graphicsConfig.defaultArrowRadius * 2}` + ' ' + `${this.graphicsConfig.defaultArrowRadius * 2}`));
        arrowMarkD.setAttribute('refX', `${(this.graphicsConfig.defaultArrowRadius * 2) + Math.floor(this.graphicsConfig.defaultNodeRadius / 6)}`);
        arrowMarkD.setAttribute('refY', `${this.graphicsConfig.defaultArrowRadius}`);
        arrowMarkD.setAttribute('markerHeight', `${this.graphicsConfig.defaultArrowRadius * 2}`);
        arrowMarkD.setAttribute('markerWidth', `${this.graphicsConfig.defaultArrowRadius * 2}`);
        arrowMarkD.setAttribute('markerUnits', 'strokeWidth');
        arrowMarkD.setAttribute('orient', 'auto');
        const arrowPathD : SVGElement = this.createSvgElement('path');
        arrowPathD.setAttribute('d', 'M 0 0 L '+ `${this.graphicsConfig.defaultArrowRadius * 2}` + ' ' + `${this.graphicsConfig.defaultArrowRadius}` + ' L 0 ' + `${this.graphicsConfig.defaultArrowRadius * 2}` + ' z');
        arrowPathD.setAttribute('fill', this.graphicsConfig.defaultArcStroke);
        const arrowMarkM : SVGElement = this.createSvgElement('marker');
        arrowMarkM.setAttribute('id', 'arrow_head_marked');
        arrowMarkM.setAttribute('viewBox', ('0 0 ' + `${this.graphicsConfig.defaultArrowRadius * 2}` + ' ' + `${this.graphicsConfig.defaultArrowRadius * 2}`));
        arrowMarkM.setAttribute('refX', `${(this.graphicsConfig.defaultArrowRadius * 2) + Math.floor(this.graphicsConfig.defaultNodeRadius / 6)}`);
        arrowMarkM.setAttribute('refY', `${this.graphicsConfig.defaultArrowRadius}`);
        arrowMarkM.setAttribute('markerHeight', `${this.graphicsConfig.defaultArrowRadius * 2}`);
        arrowMarkM.setAttribute('markerWidth', `${this.graphicsConfig.defaultArrowRadius * 2}`);
        arrowMarkM.setAttribute('markerUnits', 'strokeWidth');
        arrowMarkM.setAttribute('orient', 'auto');
        const arrowPathM : SVGElement = this.createSvgElement('path');
        arrowPathM.setAttribute('d', 'M 0 0 L '+ `${this.graphicsConfig.defaultArrowRadius * 2}` + ' ' + `${this.graphicsConfig.defaultArrowRadius}` + ' L 0 ' + `${this.graphicsConfig.defaultArrowRadius * 2}` + ' z');
        arrowPathM.setAttribute('fill', this.graphicsConfig.markedArcStroke);
        const arrowMarkA : SVGElement = this.createSvgElement('marker');
        arrowMarkA.setAttribute('id', 'arrow_head_active');
        arrowMarkA.setAttribute('viewBox', ('0 0 ' + `${this.graphicsConfig.defaultArrowRadius * 2}` + ' ' + `${this.graphicsConfig.defaultArrowRadius * 2}`));
        arrowMarkA.setAttribute('refX', `${(this.graphicsConfig.defaultArrowRadius * 2) + Math.floor(this.graphicsConfig.defaultNodeRadius / 6)}`);
        arrowMarkA.setAttribute('refY', `${this.graphicsConfig.defaultArrowRadius}`);
        arrowMarkA.setAttribute('markerHeight', `${this.graphicsConfig.defaultArrowRadius * 2}`);
        arrowMarkA.setAttribute('markerWidth', `${this.graphicsConfig.defaultArrowRadius * 2}`);
        arrowMarkA.setAttribute('markerUnits', 'strokeWidth');
        arrowMarkA.setAttribute('orient', 'auto');
        const arrowPathA : SVGElement = this.createSvgElement('path');
        arrowPathA.setAttribute('d', 'M 0 0 L '+ `${this.graphicsConfig.defaultArrowRadius * 2}` + ' ' + `${this.graphicsConfig.defaultArrowRadius}` + ' L 0 ' + `${this.graphicsConfig.defaultArrowRadius * 2}` + ' z');
        arrowPathA.setAttribute('fill', this.graphicsConfig.activeArcStroke);
        const arrowMarkV : SVGElement = this.createSvgElement('marker');
        arrowMarkV.setAttribute('id', 'arrow_head_visited');
        arrowMarkV.setAttribute('viewBox', ('0 0 ' + `${this.graphicsConfig.defaultArrowRadius * 2}` + ' ' + `${this.graphicsConfig.defaultArrowRadius * 2}`));
        arrowMarkV.setAttribute('refX', `${(this.graphicsConfig.defaultArrowRadius * 2) + Math.floor(this.graphicsConfig.defaultNodeRadius / 6)}`);
        arrowMarkV.setAttribute('refY', `${this.graphicsConfig.defaultArrowRadius}`);
        arrowMarkV.setAttribute('markerHeight', `${this.graphicsConfig.defaultArrowRadius * 2}`);
        arrowMarkV.setAttribute('markerWidth', `${this.graphicsConfig.defaultArrowRadius * 2}`);
        arrowMarkV.setAttribute('markerUnits', 'strokeWidth');
        arrowMarkV.setAttribute('orient', 'auto');
        const arrowPathV : SVGElement = this.createSvgElement('path');
        arrowPathV.setAttribute('d', 'M 0 0 L '+ `${this.graphicsConfig.defaultArrowRadius * 2}` + ' ' + `${this.graphicsConfig.defaultArrowRadius}` + ' L 0 ' + `${this.graphicsConfig.defaultArrowRadius * 2}` + ' z');
        arrowPathV.setAttribute('fill', this.graphicsConfig.visitedArcStroke);
        const arrowMarkC : SVGElement = this.createSvgElement('marker');
        arrowMarkC.setAttribute('id', 'arrow_head_changed');
        arrowMarkC.setAttribute('viewBox', ('0 0 ' + `${this.graphicsConfig.defaultArrowRadius * 2}` + ' ' + `${this.graphicsConfig.defaultArrowRadius * 2}`));
        arrowMarkC.setAttribute('refX', `${(this.graphicsConfig.defaultArrowRadius * 2) + Math.floor(this.graphicsConfig.defaultNodeRadius / 6)}`);
        arrowMarkC.setAttribute('refY', `${this.graphicsConfig.defaultArrowRadius}`);
        arrowMarkC.setAttribute('markerHeight', `${this.graphicsConfig.defaultArrowRadius * 2}`);
        arrowMarkC.setAttribute('markerWidth', `${this.graphicsConfig.defaultArrowRadius * 2}`);
        arrowMarkC.setAttribute('markerUnits', 'strokeWidth');
        arrowMarkC.setAttribute('orient', 'auto');
        const arrowPathC : SVGElement = this.createSvgElement('path');
        arrowPathC.setAttribute('d', 'M 0 0 L '+ `${this.graphicsConfig.defaultArrowRadius * 2}` + ' ' + `${this.graphicsConfig.defaultArrowRadius}` + ' L 0 ' + `${this.graphicsConfig.defaultArrowRadius * 2}` + ' z');
        arrowPathC.setAttribute('fill', this.graphicsConfig.changedArcStroke);
        const arrowMarkN : SVGElement = this.createSvgElement('marker');
        arrowMarkN.setAttribute('id', 'arrow_head_new');
        arrowMarkN.setAttribute('viewBox', ('0 0 ' + `${this.graphicsConfig.defaultArrowRadius * 2}` + ' ' + `${this.graphicsConfig.defaultArrowRadius * 2}`));
        arrowMarkN.setAttribute('refX', `${(this.graphicsConfig.defaultArrowRadius * 2) + Math.floor(this.graphicsConfig.defaultNodeRadius / 6)}`);
        arrowMarkN.setAttribute('refY', `${this.graphicsConfig.defaultArrowRadius}`);
        arrowMarkN.setAttribute('markerHeight', `${this.graphicsConfig.defaultArrowRadius * 2}`);
        arrowMarkN.setAttribute('markerWidth', `${this.graphicsConfig.defaultArrowRadius * 2}`);
        arrowMarkN.setAttribute('markerUnits', 'strokeWidth');
        arrowMarkN.setAttribute('orient', 'auto');
        const arrowPathN : SVGElement = this.createSvgElement('path');
        arrowPathN.setAttribute('d', 'M 0 0 L '+ `${this.graphicsConfig.defaultArrowRadius * 2}` + ' ' + `${this.graphicsConfig.defaultArrowRadius}` + ' L 0 ' + `${this.graphicsConfig.defaultArrowRadius * 2}` + ' z');
        arrowPathN.setAttribute('fill', this.graphicsConfig.newArcStroke);
        const arrowMarkDFG : SVGElement = this.createSvgElement('marker');
        arrowMarkDFG.setAttribute('id', 'arrow_head_dfg');
        arrowMarkDFG.setAttribute('viewBox', ('0 0 ' + `${this.graphicsConfig.defaultArrowRadius * 2}` + ' ' + `${this.graphicsConfig.defaultArrowRadius * 2}`));
        arrowMarkDFG.setAttribute('refX', `${(this.graphicsConfig.defaultArrowRadius * 2) + Math.floor(this.graphicsConfig.defaultNodeRadius / 6)}`);
        arrowMarkDFG.setAttribute('refY', `${this.graphicsConfig.defaultArrowRadius}`);
        arrowMarkDFG.setAttribute('markerHeight', `${this.graphicsConfig.defaultArrowRadius * 2}`);
        arrowMarkDFG.setAttribute('markerWidth', `${this.graphicsConfig.defaultArrowRadius * 2}`);
        arrowMarkDFG.setAttribute('markerUnits', 'strokeWidth');
        arrowMarkDFG.setAttribute('orient', 'auto');
        const arrowPathDFG : SVGElement = this.createSvgElement('path');
        arrowPathDFG.setAttribute('d', 'M 0 0 L '+ `${this.graphicsConfig.defaultArrowRadius * 2}` + ' ' + `${this.graphicsConfig.defaultArrowRadius}` + ' L 0 ' + `${this.graphicsConfig.defaultArrowRadius * 2}` + ' z');
        arrowPathDFG.setAttribute('fill', this.graphicsConfig.defaultNodeStroke);
        arrowMarkD.appendChild(arrowPathD);
        arrowDefs.appendChild(arrowMarkD);
        arrowMarkM.appendChild(arrowPathM);
        arrowDefs.appendChild(arrowMarkM);
        arrowMarkA.appendChild(arrowPathA);
        arrowDefs.appendChild(arrowMarkA);
        arrowMarkV.appendChild(arrowPathV);
        arrowDefs.appendChild(arrowMarkV);
        arrowMarkC.appendChild(arrowPathC);
        arrowDefs.appendChild(arrowMarkC);
        arrowMarkN.appendChild(arrowPathN);
        arrowDefs.appendChild(arrowMarkN);
        arrowMarkDFG.appendChild(arrowPathDFG);
        arrowDefs.appendChild(arrowMarkDFG);
        this.arrowSVG.appendChild(arrowDefs);
        this.arrowSVG.setAttribute('width', `0`);
        this.arrowSVG.setAttribute('height', `0`);
        const div = document.getElementById('canvas');
        if (div !== null) {
            div.appendChild(this.arrowSVG);
        } else {
            throw new Error('#srv.svg.ina.000: ' + 'initialization of arrow-svg failed - main drawing area div (identifier: "canvas") could not be located');
        };
    };

    private initInfos() : void {
        this.infosSVG.setAttribute('width', `0`);
        this.infosSVG.setAttribute('height', `0`);
        const div = document.getElementById('canvas');
        if (div !== null) {
            div.appendChild(this.infosSVG);
        } else {
            throw new Error('#srv.svg.ini.000: ' + 'initialization of infos-svg failed - main drawing area div (identifier: "canvas") could not be located');
        };
    };

};