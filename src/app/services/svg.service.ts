import {Injectable} from '@angular/core';

import {CssColorName} from '../classes/display/css-color-names';
import {Graph} from '../classes/graph-representation/graph';
import {Node} from '../classes/graph-representation/node';

@Injectable({
    providedIn: 'root'
})
export class SvgService {

    /* attributes */

    private readonly svgDefaultRadius : number = 20;
    private readonly svgDefaultStrokeWidth : number = 5;
    private readonly svgDefaultStroke : CssColorName = 'Black';
    private readonly svgDefaultFill : CssColorName = 'Silver';

    /* methods : other */

    public createSvgNodes(inGraph : Graph) : Array<SVGElement> {
        const nodeSvgArray: Array<SVGElement> = [];
        for (const node of inGraph.nodes) {
            if (node !== undefined) {
                nodeSvgArray.push(this.createSvgForNode(node));
            } else {
                /* skip undefined node */
            };
        };
        return nodeSvgArray;
    };

    public createSvgArcs(inGraph : Graph) : Array<SVGElement> {
        const arcSvgArray: Array<SVGElement> = [];
        for (const arc of inGraph.arcs) {
            if (arc !== undefined) {
                arcSvgArray.push(this.createSvgForArc([arc[0], arc[1]]));
            } else {
                /* skip undefined arc */
            };
        };
        return arcSvgArray;
    };

    private createSvgForNode(inNode : Node) : SVGElement {
        let svg : SVGElement;
        switch (inNode.type) {
            case 'support' : {
                svg = this.createSvgElement('rect');
                svg.setAttribute('x', `${inNode.x - this.svgDefaultRadius + 1}`);
                svg.setAttribute('y', `${inNode.y - this.svgDefaultRadius + 1}`);
                svg.setAttribute('width', `${(this.svgDefaultRadius * 2) - 1}`);
                svg.setAttribute('height', `${(this.svgDefaultRadius * 2) - 1}`);
                svg.setAttribute('rx', `${Math.floor(this.svgDefaultRadius / 2)}`);
                break;
            }
            case 'event' : {
                svg = this.createSvgElement('rect');
                svg.setAttribute('x', `${inNode.x - this.svgDefaultRadius + 1}`);
                svg.setAttribute('y', `${inNode.y - this.svgDefaultRadius + 1}`);
                svg.setAttribute('width', `${(this.svgDefaultRadius * 2) - 1}`);
                svg.setAttribute('height', `${(this.svgDefaultRadius * 2) - 1}`);
                svg.setAttribute('rx', `${Math.floor(this.svgDefaultRadius / 2)}`);
                break;
            }
            case 'place' : {
                svg = this.createSvgElement('circle');
                svg.setAttribute('cx', `${inNode.x}`);
                svg.setAttribute('cy', `${inNode.y}`);
                svg.setAttribute('r', `${this.svgDefaultRadius}`);
                break;
            }
            case 'transition' : {
                svg = this.createSvgElement('rect');
                svg.setAttribute('x', `${inNode.x - this.svgDefaultRadius + 1}`);
                svg.setAttribute('y', `${inNode.y - this.svgDefaultRadius + 1}`);
                svg.setAttribute('width', `${(this.svgDefaultRadius * 2) - 1}`);
                svg.setAttribute('height', `${(this.svgDefaultRadius * 2) - 1}`);
                svg.setAttribute('rx', `${0}`);
                break;
            }
        };
        svg.setAttribute('stroke-width', `${this.svgDefaultStrokeWidth}`);
        svg.setAttribute('stroke', this.svgDefaultStroke);
        svg.setAttribute('fill', this.svgDefaultFill);
        inNode.registerSvg(svg);
        return(svg);
    };

    private createSvgForArc(inNodes : [Node, Node]) : SVGElement {
        const svg : SVGElement = this.createSvgElement('line');
        svg.setAttribute('x1', `${inNodes[0].x}`);
        svg.setAttribute('y1', `${inNodes[0].y}`);
        svg.setAttribute('x2', `${inNodes[1].x}`);
        svg.setAttribute('y2', `${inNodes[1].y}`);
        svg.setAttribute('stroke-width', `${this.svgDefaultStrokeWidth}`);
        svg.setAttribute('stroke', this.svgDefaultStroke);
        return svg;
    }

    private createSvgElement(name: string): SVGElement {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    };
};