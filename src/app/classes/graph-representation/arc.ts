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

    private _marked : boolean;
    private _active : boolean;
    private _visited : boolean;
    private _changed : boolean;
    private _newlyCreated : boolean;
    private _overrideMarking : boolean;

    /* methods : constructor */

    public constructor(
        // inId : number, 
        inSource : Node, 
        inTarget : Node, 
        inWeight : number,
        inReverseExists : boolean
    ) {
        // this._id = inId;
        this._sourceNode = inSource;
        this._targetNode = inTarget;
        this._weight = inWeight;
        this._reverseExists = inReverseExists;
        this._dfg = undefined;
        this._svgArcElement = undefined;
        this._marked = false;
        this._active = false;
        this._visited = false;
        this._changed = false;
        this._newlyCreated = false;
        this._overrideMarking = false;
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

    public get marked() : boolean {
        return this._marked;
    };

    public get active() : boolean {
        return this._active;
    };

    public get visited() : boolean {
        return this._visited;
    };

    public get changed() : boolean {
        return this._changed;
    };

    public get newlyCreated() : boolean {
        return this._newlyCreated;
    };

    public get overrideMarking() : boolean {
        return this._overrideMarking;
    };
    
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

    public set marked(inValue : boolean) {
        this._marked = inValue;
    };

    public set active(inValue : boolean) {
        this._active = inValue;
    };

    public set visited(inValue : boolean) {
        this._visited = inValue;
    };

    public set changed(inValue : boolean) {
        this._changed = inValue;
    };

    public set newlyCreated(inValue : boolean) {
        this._newlyCreated = inValue;
    };

    public set overrideMarking(inValue : boolean) {
        this._overrideMarking = inValue;
    };

    /* methods : other */

    public registerArcSvg(inSVG: SVGElement) {
        this._svgArcElement = inSVG;
    };

};