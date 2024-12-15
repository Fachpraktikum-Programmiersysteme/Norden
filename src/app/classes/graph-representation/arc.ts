import {Node} from './node';

export class Arc {

    /* attributes */

    // private readonly _id : number;
    private readonly _sourceNode : Node;
    private readonly _targetNode : Node;

    private _weight : number;

    private _reverseExists : boolean;

    private _dfg : number | undefined;

    private _svgArcElement : SVGElement | undefined;

    private _active : boolean;
    private _marked : boolean;
    private _visited : boolean;
    private _overrideMarking : boolean;

    // private _hoverActive : boolean;
    // private _hoverCancelled : boolean;

    /* methods : constructor */

    public constructor(
        // inId : number, 
        inSource : Node, 
        inTarget : Node, 
        inWeight : number,
        inReverseExists : boolean,  
        inDFG : number | undefined, 
        inArcSVG? : SVGElement
    ) {
        // this._id = inId;
        this._sourceNode = inSource;
        this._targetNode = inTarget;
        this._weight = inWeight;
        this._reverseExists = inReverseExists;
        this._dfg = inDFG;
        this._svgArcElement = inArcSVG;
        this._active = false;
        this._marked = false;
        this._visited = false;
        this._overrideMarking = false;
        // this._hoverActive = false;
        // this._hoverCancelled = false;
    };

    /* methods : getters */

    // public get id() : number {
    //     return this._id;
    // };

    public get source() : Node {
        return this._sourceNode;
    };

    public get target() : Node {
        return this._targetNode;
    };

    public get weight() : number {
        return this._weight;
    };

    public get reverseExists() : boolean {
        return this._reverseExists;
    };

    public get dfg() : number | undefined {
        return this._dfg;
    };

    public get sourceX() : number {
        return this._sourceNode.x;
    };

    public get sourceY() : number {
        return this._sourceNode.y;
    };

    public get targetX() : number {
        return this._targetNode.x;
    };

    public get targetY() : number {
        return this._targetNode.y;
    };

    public get svgArcElement() : SVGElement | undefined {
        return this._svgArcElement;
    };

    public get isActive() : boolean {
        return this._active;
    };

    public get isMarked() : boolean {
        return this._marked;
    };

    public get wasVisited() : boolean {
        return this._visited;
    };

    public get overrideActive() : boolean {
        return this._overrideMarking;
    };

    // public get isHoverActive() : boolean {
    //     return this._hoverActive;
    // };

    // public get wasHoverCancelled() : boolean {
    //     return this._hoverCancelled;
    // };
    
    /* methods : setters */

    public set weight(inWeight : number) {
        this._weight = inWeight;
    };

    public set reverseExists(inValue: boolean) {
        this._reverseExists = inValue;
    };

    public set dfg(inDFG : number | undefined) {
        this._dfg = inDFG;
    };

    public set active(inValue : boolean) {
        this._active = inValue;
    };

    public set marked(inValue : boolean) {
        this._marked = inValue;
    };

    public set visited(inValue : boolean) {
        this._visited = inValue;
    };

    public set overrideMarking(inValue : boolean) {
        this._overrideMarking = inValue;
    };

    // public set hoverActive(inValue : boolean) {
    //     this._hoverActive = inValue;
    // };

    // public set hoverCancelled(inValue : boolean) {
    //     this._hoverCancelled = inValue;
    // };

    /* methods : other */

    public registerArcSvg(inSVG: SVGElement) {
        this._svgArcElement = inSVG;
    };

};