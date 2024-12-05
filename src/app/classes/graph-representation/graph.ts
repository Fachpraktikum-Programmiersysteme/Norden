import {Node} from './node';

export class Graph {

    /* attributes */
    
    private _nodes : Array<Node | undefined>;
    private _nodeCount : number;
    private _supportCount : number;
    private _eventCount : number;
    private _placeCount : number;
    private _transitionCount : number;

    private _arcs : Array<[Node, Node, number]>;
    private _arcCount : number;

    private _initialState : boolean;

    /* methods : constructor */
    
    public constructor(inNodes?: Array<Node>) {
        this._nodes = [];
        this._nodeCount = 0;
        this._supportCount = 0;
        this._eventCount = 0;
        this._placeCount = 0;
        this._transitionCount = 0;
        this._arcs = [];
        this._arcCount = 0;
        if (inNodes !== undefined) {
            for (const node of inNodes) {
                this.addNode(node.type, node.label, node.x, node.y);
            };
            this._initialState = false;
        } else {
            this._initialState = true;
        };
    };

    /* methods : getters */

    public get nodes(): Array<Node | undefined> {
        return this._nodes;
    };

    public get nodeCount(): number {
        return this._nodeCount;
    };

    public get supportCount(): number {
        return this._supportCount;
    };

    public get eventCount(): number {
        return this._eventCount;
    };

    public get placeCount(): number {
        return this._placeCount;
    };

    public get transitionCount(): number {
        return this._transitionCount;
    };

    public get arcs(): Array<[Node, Node, number]> {
        return this._arcs;
    };

    public get arcCount(): number {
        return this._arcCount;
    };

    public get initialState(): boolean {
        return this._initialState;
    };

    /* methods : other */

    public checkNode(
        inType : 'support' | 'event' | 'place' | 'transition', 
        inLabel : string
    ) : [boolean, number?] {
        for (let i = 0; i < this._nodes.length; i++) {
            let node = this._nodes[i];
            if (node !== undefined) {
                if (node.type === inType) {
                    if (node.label === inLabel) {
                        if (node.id === i) {
                            return [true, node.id];
                        } else {
                            throw new Error('#cls.grp.ccn.000: ' + 'node check failed - matching node was found, but node id (' + node.id + ') does not match node position (' + i + ')');
                        };
                    };
                };
            };
        };
        return [false];
    };

    private appendNode(
        inType : 'support' | 'event' | 'place' | 'transition', 
        inLabel : string, 
        inX? : number, 
        inY? : number
    ) : [boolean, number] {
        let nodesLength : number;
        let x : number;
        let y : number;
        if (inX === undefined) {
            x = (Math.floor(Math.random() * 1700) + 100);
        } else {
            x = inX;
        };
        if (inY === undefined) {
            y = (Math.floor(Math.random() * 200) + 100);
        } else {
            y = inY;
        };
        nodesLength = this._nodes.push(new Node(this._nodes.length, inType, inLabel, x, y));
        this._nodeCount++;
        switch (inType) {
            case 'support' : {
                this._supportCount++;
                break;
            }
            case 'event' : {
                this._eventCount++;
                break;
            }
            case 'place' : {
                this._placeCount++;
                break;
            }
            case 'transition' : {
                this._transitionCount++;
                break;
            };
        };
        if (this._initialState) {
            this._initialState = false;
        };
        return [true, (nodesLength - 1)];
    };

    public addNode(
        inType : 'support' | 'event' | 'place' | 'transition', 
        inLabel : string, 
        inX? : number, 
        inY? : number
    ) : [boolean, number] {
        switch (inType) {
            case 'support' : {
                return this.appendNode(inType, inLabel, inX, inY);
            }
            case 'event' : {
                let nodeExists : [boolean, number?] = this.checkNode(inType, inLabel);
                if (nodeExists[0]) {
                    if (nodeExists[1] !== undefined) {
                        return [false, nodeExists[1]];
                    } else {
                        throw new Error('#cls.grp.adn.000: ' + 'node addition failed - impossible error')
                    };
                } else {
                    return this.appendNode(inType, inLabel, inX, inY);
                }
            }
            case 'place' : {
                return this.appendNode(inType, inLabel, inX, inY);
            }
            case 'transition' : {
                return this.appendNode(inType, inLabel, inX, inY);
            };
        };
    };

    public deleteNode(inIndex : number) : void {
        if (inIndex > 0) {
            if (inIndex < (this._nodes.length)) {
                this._nodes[inIndex] = undefined;
                this._nodeCount--;
            } else {
                throw new Error('#cls.grp.rmn.000: ' + 'node deletion failed - given index (' + inIndex + ') is greater than the highest within the array (' + (this._nodes.length - 1) + ')');
            };
        } else {
            throw new Error('#cls.grp.rmn.001: ' + 'node deletion failed - given index (' + inIndex + ') is less than zero');
        };
    };

    private checkArc(inSource : Node, inTarget : Node) : [boolean, number?] {
        for (let i = 0; i < this._arcs.length; i++) {
            if (this._arcs[i][0] === inSource) {
                if (this._arcs[i][1] === inTarget) {
                    return [true, i];
                };
            };
        };
        return [false];
    };

    public addArc(inSource : Node, inTarget : Node, inWeight? : number) : void  {
        if (inWeight === undefined) {
            const arcExists : [boolean, number?] = this.checkArc(inSource, inTarget);
            if (arcExists[0]) {
                if (arcExists[1] !== undefined) {
                    this._arcs[arcExists[1]][2]++;
                    this._arcCount++;
                } else {
                    throw new Error('#cls.grp.ada.000: ' + 'arc addition failed - impossible error');
                };
            } else {
                this._arcs.push([inSource, inTarget, 1]);
                this._arcCount++;
            };
        } else {
            if (inWeight > 0) {
                const arcExists : [boolean, number?] = this.checkArc(inSource, inTarget);
                if (arcExists[0]) {
                    if (arcExists[1] !== undefined) {
                        this._arcs[arcExists[1]][2] = this._arcs[arcExists[1]][2] + inWeight;
                        this._arcCount = this._arcCount + inWeight;
                    } else {
                        throw new Error('#cls.grp.ada.001: ' + 'arc addition failed - impossible error');
                    };
                } else {
                    this._arcs.push([inSource, inTarget, inWeight]);
                    this._arcCount = this._arcCount + inWeight;
                };
            } else if (inWeight === 0) {
                return;
            } else {
                throw new Error('#cls.grp.ada.002: ' + 'arc addition failed - cannot add arc with negative weight');
            };
        };
        if (this._initialState) {
            this._initialState = false;
        };
    };

    public deleteArc(inSource : Node, inTarget : Node) : number {

        if (inSource.id > 0) {
            if (inTarget.id > 0) {
                if (inSource.id < (this._nodes.length)) {
                    if (inTarget.id < (this._nodes.length)) {
                        let arcExists : [boolean, number?] = this.checkArc(inSource, inTarget);
                        if (arcExists[0]) {
                            if (arcExists[1] !== undefined) {
                                const foundArcs = this._arcs[arcExists[1]][2];
                                this._arcs[arcExists[1]][2] = 0;
                                this._arcCount = (this._arcCount - foundArcs);
                                this._arcs.splice(arcExists[1], 1);
                                return foundArcs;
                            } else {
                                throw new Error('#cls.grp.ada.000: ' + 'arc deletion failed - impossible error');
                            };
                        } else {
                            throw new Error('#cls.grp.rma.001: ' + 'arc deletion failed - no arc exists from source node (' + inSource.id + ') to target node (' + inTarget.id + ')');
                        };
                    } else {
                        throw new Error('#cls.grp.rma.002: ' + 'arc deletion failed - given index of target node (' + inTarget.id + ') is greater than the highest within the array (' + (this._nodes.length - 1) + ')');
                    };
                } else {
                    throw new Error('#cls.grp.rma.003: ' + 'arc deletion failed - given index of source node (' + inSource.id + ') is greater than the highest within the array (' + (this._nodes.length - 1) + ')');
                };
            } else {
                throw new Error('#cls.grp.rma.004: ' + 'arc deletion failed - given index of target node (' + inTarget.id + ') is less than zero');
            };
        } else {
            throw new Error('#cls.grp.rma.005: ' + 'arc deletion failed - given index of source node  (' + inSource.id + ') is less than zero');
        };
    };

};