import {Node} from '../../classes/graph-representation/node';
import {Arc} from './arc';

export class Cut {

    /* attributes */

    private _tempX: number = 0;
    private _tempY: number = 0;
    private _isDrawing = false;
    private _tempCutLines: Array<{ x1: number; y1: number; x2: number; y2: number; }> = [];
    private _cutArcs: Array<Arc> = [];

    /* methods : constructor */

    public constructor(
        inX: number,
        inY: number,
        inIsDrawing: boolean
    ) {
        this._tempX = inX;
        this._tempY = inY;
        this._isDrawing = inIsDrawing;
    };

    /* methods : getters */

    public get tempX(): number {
        return this._tempX;
    };

    public get tempY(): number {
        return this._tempY;
    };

    public get isDrawing() {
        return this._isDrawing;
    };

    public get tempCutLines(): Array<{ x1: number; y1: number; x2: number; y2: number; }> {
        return this._tempCutLines;
    };

    public get cutArcs(): Array<Arc> {
        return this._cutArcs;
    };

    /* methods : setters */

    public set tempX(value: number) {
        this._tempX = value;
    };

    public set tempY(value: number) {
        this._tempY = value;
    };

    public set isDrawing(value) {
        this._isDrawing = value;
    };

    // public set tempCutLines(value: Array<{ x1: number; y1: number; x2: number; y2: number; }>) {
    //     this._tempCutLines = value;
    // };

    // public set cutArcs(value: Array<[Node, Node, number, boolean, boolean]>) {
    //     this._cutArcs = value;
    // };

    /* methods : other */

    public checkIntersection(
        line1: { x1: number, y1: number, x2: number, y2: number },
        line2: { x1: number, y1: number, x2: number, y2: number }
    ) : boolean {
        const det = (a: number, b: number, c: number, d: number) => a * d - b * c;

        let x1 = line1.x1, y1 = line1.y1,
            x2 = line1.x2, y2 = line1.y2,
            x3 = line2.x1, y3 = line2.y1,
            x4 = line2.x2, y4 = line2.y2;

        let det1 = det(x2 - x1, y2 - y1, x4 - x3, y4 - y3);
        if (det1 === 0) {
            return false; // lines are parallel
        };

        let det2 = det(x3 - x1, y3 - y1, x4 - x3, y4 - y3) / det1;
        let det3 = det(x3 - x1, y3 - y1, x2 - x1, y2 - y1) / det1;

        return (0 <= det2 && det2 <= 1) && (0 <= det3 && det3 <= 1);
    };

    public removeCutSvgs(drawingArea: SVGElement | undefined) {
        if (!drawingArea) return;
        const elements = Array.from(drawingArea.querySelectorAll(`[customType="cut"]`));
        elements.forEach(element => element.remove());
    };

};