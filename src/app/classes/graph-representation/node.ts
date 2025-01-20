export class Node {

    /* attributes */

    private readonly _id : number;
    private readonly _type : 'support' | 'event' | 'place' | 'transition';
    private readonly _label : string;

    private _x_coordinate : number;
    private _y_coordinate : number;

    private _incomingArcs : number;
    private _outgoingArcs : number;

    private _dfg : number | undefined;

    private _svgNodeElement : SVGElement | undefined;
    private _svgInfoElement : SVGElement | undefined;

    private _marked : boolean;
    private _active : boolean;
    private _visited : boolean;
    private _changed : boolean;
    private _newlyCreated : boolean;

    private _infoOverride : boolean;
    private _infoActive : boolean;
    private _hoverActive : boolean;
    private _hoverCancelled : boolean;

    /* methods : constructor */

    public constructor(
        inId : number, 
        inType : 'support' | 'event' | 'place' | 'transition', 
        inLabel : string, 
        inX : number,  
        inY : number
    ) {
        this._id = inId;
        this._type = inType;
        this._label = inLabel;
        this._x_coordinate = inX;
        this._y_coordinate = inY;
        this._incomingArcs = 0;
        this._outgoingArcs = 0;
        this._dfg = undefined;
        this._svgNodeElement = undefined;
        this._svgInfoElement = undefined;
        this._marked = false;
        this._active = false;
        this._visited = false;
        this._changed = false;
        this._newlyCreated = false;
        this._infoOverride = false;
        this._infoActive = false;
        this._hoverActive = false;
        this._hoverCancelled = false;
    };

    /* methods : getters */

    public get id() : number {
        return this._id;
    };

    public get type() : 'support' | 'event' | 'place' | 'transition' {
        return this._type;
    };

    public get label() : string {
        return this._label;
    };

    public get x() : number {
        return this._x_coordinate;
    };

    public get y() : number {
        return this._y_coordinate;
    };

    public get coordinates() : [number, number] {
        return [this._x_coordinate, this._y_coordinate];
    };

    public get inArcs() : number {
        return this._incomingArcs;
    };

    public get outArcs() : number {
        return this._outgoingArcs;
    };

    public get dfg() : number | undefined {
        return this._dfg;
    };

    public get svgNodeElement() : SVGElement | undefined {
        return this._svgNodeElement;
    };

    public get svgInfoElement() : SVGElement | undefined {
        return this._svgInfoElement;
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

    public get infoOverride() : boolean {
        return this._infoOverride;
    };

    public get infoActive() : boolean {
        return this._infoActive;
    };

    public get hoverActive() : boolean {
        return this._hoverActive;
    };

    public get hoverCancelled() : boolean {
        return this._hoverCancelled;
    };
    
    /* methods : setters */

    public set x(inX : number) {
        this._x_coordinate = inX;
    };

    public set y(inY : number) {
        this._y_coordinate = inY;
    };

    public set coordinates(inCoords : [number, number]) {
        this._x_coordinate = inCoords[0];
        this._y_coordinate = inCoords[1];
    };

    public set inArcs(inNumber : number) {
        this._incomingArcs = inNumber;
    };

    public set outArcs(inNumber : number) {
        this._outgoingArcs = inNumber;
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

    public set infoOverride(inValue : boolean) {
        this._infoOverride = inValue;
    };

    public set infoActive(inValue : boolean) {
        this._infoActive = inValue;
    };

    public set hoverActive(inValue : boolean) {
        this._hoverActive = inValue;
    };

    public set hoverCancelled(inValue : boolean) {
        this._hoverCancelled = inValue;
    };

    /* methods : other */

    public registerNodeSvg(inSVG: SVGElement) {
        this._svgNodeElement = inSVG;
    };

    public registerInfoSvg(inSVG: SVGElement) {
        this._svgInfoElement = inSVG;
    };

};