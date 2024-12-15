import {Node} from './node';
import {Arc} from './arc';

export class DFG {

    /* attributes */

    private readonly _id : number;
    private _startNode : Node;
    private _endNode : Node;
    private _nodes : Node[];
    private _arcs : Arc[];

    /* methods : constructor */
    
    public constructor(
        inId : number, 
        inStartNode: Node, 
        inEndNode: Node, 
        inNodes: Node[], 
        inArcs: Arc[]
    ) {
        this._id = inId;
        this._startNode = inStartNode;
        this._endNode = inEndNode;
        this._nodes = inNodes;
        this._arcs = inArcs;
    };

    /* methods : getters */

     public get id() : number {
        return this._id;
    };

    public get startNode() : Node {
        return this._startNode;
    };

    public get endNode() : Node {
        return this._endNode;
    };

    public get nodes() : Node[] {
        return this._nodes;
    };

    public get arcs() : Arc[] {
        return this._arcs;
    };

    /* methods : setters */

    public set startNode(inNode : Node) {
        this._startNode = inNode;
    };

    public set endNode(inNode : Node) {
        this._endNode = inNode;
    };

    public set nodes(inNodes : Node[]) {
        this._nodes = inNodes;
    };

    public set arcs(inArcs : Arc[]) {
        this._arcs = inArcs;
    };

    /* methods : other */

    /* TODO - if the feature is not needed by the IM, remove the following comments */
    // public update(
    //     inStartNode: Node, 
    //     inEndNode: Node, 
    //     inNodes: Node[], 
    //     inArcs: Arc[]
    // ) : void {
    //     this._startNode = inStartNode;
    //     this._endNode = inEndNode;
    //     this._nodes = inNodes;
    //     this._arcs = inArcs;
    // };

};