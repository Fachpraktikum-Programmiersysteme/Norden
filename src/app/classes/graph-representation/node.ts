export class Node {

    /* attributes */

    private readonly _id : number;
    private readonly _type : 'support' | 'event' | 'place' | 'transition';
    private readonly _label : string;

    private _x_coordinate : number;
    private _y_coordinate : number;

    private _svgElement : SVGElement | undefined;

    private marked : boolean = false;
    private mouseClickDown : boolean = false;

    /* methods : constructor */

    public constructor(
        inId : number, 
        inType : 'support' | 'event' | 'place' | 'transition', 
        inLabel : string, 
        inX : number, 
        inY : number,
        inSVG? : SVGElement
    ) {
        this._id = inId;
        this._type = inType;
        this._label = inLabel;
        this._x_coordinate = inX;
        this._y_coordinate = inY;
        this._svgElement = inSVG;
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

    public get svgElement() : SVGElement | undefined {
        return this._svgElement;
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

    public set svgElement(inSVG : SVGElement | undefined) {
        this._svgElement = inSVG;
    };

    /* methods : other */

    public registerSvg(inSVG: SVGElement) {
        this._svgElement = inSVG;
        this._svgElement.onmouseenter = () => {
            this.processMouseEnter();
        };
        this._svgElement.onmouseleave = () => {
            this.processMouseLeave();
        };
        this._svgElement.onmousedown = () => {
            this.processMouseDown();
        };
        this._svgElement.onmouseup = () => {
            this.processMouseUp();
        };
    };

    private processMouseEnter() : void  {
        if (this._svgElement === undefined) {
            return;
        };
        if (!this.marked) {
            this._svgElement.setAttribute('stroke', 'green');
        };
        this._svgElement.setAttribute('fill', 'lime');
    };

    private processMouseLeave() : void  {
        if (this._svgElement === undefined) {
            return;
        };
        if (!this.marked) {
            this._svgElement.setAttribute('stroke', 'black');
        };
        this._svgElement.setAttribute('fill', 'cyan');
        this.mouseClickDown = false;
    };

    private processMouseDown() : void {
        if (this._svgElement === undefined) {
            return;
        };
        this.mouseClickDown = true;
    };

    private processMouseUp() : void {
        if (this._svgElement === undefined) {
            return;
        }
        if (!this.mouseClickDown) {
            return;
        };
        switch (this.marked) {
            case false : {
                this._svgElement.setAttribute('stroke', 'orange');
                this.marked = true;
                break;
            }
            case true : {
                this._svgElement.setAttribute('stroke', 'green');
                this.marked = false;
                break;
            };
        };
        this.mouseClickDown = false;
    };

};