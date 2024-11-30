export class Node {

    /* attributes */

    private readonly _id : number;
    private readonly _type : 'support' | 'event' | 'place' | 'transition';
    private readonly _label : string;

    private _x_coordinate : number;
    private _y_coordinate : number;

    private _svgNodeElement : SVGElement | undefined;
    private _svgInfoElement : SVGElement | undefined;

    private _active : boolean;
    private _marked : boolean;
    private _visited : boolean;

    private _infoActive : boolean;
    private _hoverActive : boolean;
    private _hoverCancelled : boolean;
    // private _beingClicked : boolean;
    // private _beingDragged : boolean;

    /* methods : constructor */

    public constructor(
        inId : number, 
        inType : 'support' | 'event' | 'place' | 'transition', 
        inLabel : string, 
        inX : number, 
        inY : number,
        inNodeSVG? : SVGElement,
        inInfoSVG? : SVGElement
    ) {
        this._id = inId;
        this._type = inType;
        this._label = inLabel;
        this._x_coordinate = inX;
        this._y_coordinate = inY;
        this._svgNodeElement = inNodeSVG;
        this._svgInfoElement = inInfoSVG;
        this._active = false;
        this._marked = false;
        this._visited = false;
        this._infoActive = false;
        this._hoverActive = false;
        this._hoverCancelled = false;
        // this._beingClicked = false;
        // this._beingDragged = false;
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

    /* to be removed - the following comments may all be deleted once the new display mechanism using the "display.component" has been approved*/

    public registerNodeSvg(inSVG: SVGElement) {
        this._svgNodeElement = inSVG;
        // this._svgElement.onmouseenter = () => {
        //     this.processMouseEnter();
        // };
        // this._svgElement.onmouseleave = () => {
        //     this.processMouseLeave();
        // };
        // this._svgElement.onmousedown = () => {
        //     this.processMouseDown();
        // };
        // this._svgElement.onmousemove = (inEvent : MouseEvent) => {
        //     this.processMouseMove(inEvent.offsetX, inEvent.offsetY);
        // };
        // this._svgElement.onmouseup = () => {
        //     this.processMouseUp();
        // };
    };

    public registerInfoSvg(inSVG: SVGElement) {
        this._svgInfoElement = inSVG;
    };

    // private processMouseEnter() : void  {
    //     if (this._svgElement === undefined) {
    //         return;
    //     };
    //     if (!this.active) {
    //         this.active = true;
    //     };
    //     if (!this.visited) {
    //         this.visited = true;
    //     };
    //     if (!this.marked) {
    //         this._svgElement.setAttribute('stroke', 'green');
    //     };
    //     this._svgElement.setAttribute('fill', 'lime');
    // };

    // private processMouseLeave() : void  {
    //     if (this._svgElement === undefined) {
    //         return;
    //     };
    //     if (this.active) {
    //         this.active = false;
    //     };
    //     if (!this.marked) {
    //         this._svgElement.setAttribute('stroke', 'black');
    //     };
    //     this._svgElement.setAttribute('fill', 'cyan');
    //     this._beingClicked = false;
    // };

    // private processMouseDown() : void {
    //     if (this._svgElement === undefined) {
    //         return;
    //     };
    //     this._beingClicked = true;
    // };

    // private processMouseMove(inX : number, inY : number) : void {
    //     if (this._svgElement === undefined) {
    //         return;
    //     };
    //     if (this._beingClicked) {
    //         this._beingDragged = true;
    //         /* to be removed - start*/
    //         console.log();
    //         console.log('node element handles MouseMoveEvent');
    //         console.log(' >> old position : (' + this._x_coordinate + '|' + this._y_coordinate + ')');
    //         /* to be removed - end*/
    //         this._x_coordinate = inX;
    //         this._y_coordinate = inY;
    //         /* to be removed - start*/
    //         console.log(' >> new position : (' + this._x_coordinate + '|' + this._y_coordinate + ')');
    //         console.log();
    //         /* to be removed - end*/
    //     };
    // };

    // private processMouseUp() : void {
    //     if (this._svgElement === undefined) {
    //         return;
    //     }
    //     if (!this._beingClicked) {
    //         return;
    //     };
    //     if (this._beingDragged) {
    //         this._beingDragged = false;
    //     } else {
    //         switch (this.marked) {
    //             case false : {
    //                 this._svgElement.setAttribute('stroke', 'orange');
    //                 this.marked = true;
    //                 break;
    //             }
    //             case true : {
    //                 this._svgElement.setAttribute('stroke', 'green');
    //                 this.marked = false;
    //                 break;
    //             };
    //         };
    //     };
    //     this._beingClicked = false;
    // };

};