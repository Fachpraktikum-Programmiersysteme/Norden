export class Node {

    /* attributes */

    private readonly _id : number;
    private readonly _type : 'support' | 'event' | 'place' | 'transition';
    private readonly _label : string;

    private _dfg : number | undefined;

    private _x_coordinate : number;
    private _y_coordinate : number;

    private _svgNodeElement : SVGElement | undefined;
    private _svgInfoElement : SVGElement | undefined;

    private _marked : boolean;
    private _active : boolean;
    private _visited : boolean;

    private _infoActive : boolean;
    private _hoverActive : boolean;
    private _hoverCancelled : boolean;

    /* methods : constructor */

    public constructor(
        inId : number, 
        inType : 'support' | 'event' | 'place' | 'transition', 
        inLabel : string, 
        inDFG : number | undefined, 
        inX : number,  
        inY : number, 
        inNodeSVG? : SVGElement, 
        inInfoSVG? : SVGElement
    ) {
        this._id = inId;
        this._type = inType;
        this._label = inLabel;
        this._dfg = inDFG;
        this._x_coordinate = inX;
        this._y_coordinate = inY;
        this._svgNodeElement = inNodeSVG;
        this._svgInfoElement = inInfoSVG;
        this._marked = false;
        this._active = false;
        this._visited = false;
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

    public get dfg() : number | undefined {
        return this._dfg;
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

    public get svgNodeElement() : SVGElement | undefined {
        return this._svgNodeElement;
    };

    public get svgInfoElement() : SVGElement | undefined {
        return this._svgInfoElement;
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

    public get isInfoActive() : boolean {
        return this._infoActive;
    };

    public get isHoverActive() : boolean {
        return this._hoverActive;
    };

    public get wasHoverCancelled() : boolean {
        return this._hoverCancelled;
    };
    
    /* methods : setters */

    public set dfg(inDFG : number | undefined) {
        this._dfg = inDFG;
    };

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

    public set active(inValue : boolean) {
        this._active = inValue;
    };

    public set marked(inValue : boolean) {
        this._marked = inValue;
    };

    public set visited(inValue : boolean) {
        this._visited = inValue;
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