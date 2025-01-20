import {Node} from './node';
import {Arc} from './arc';

export class DFG {

    /* attributes */

    private readonly _id : number;
    private _startNode : Node;
    private _endNode : Node;
    private _nodes : Node[];
    private _arcs : Arc[];
    private _log : Node[][];

    /* methods : constructor */
    
    public constructor(
        inId : number, 
        inStartNode : Node, 
        inEndNode : Node, 
        inNodes : Node[], 
        inArcs : Arc[], 
        inLog : Node[][]
    ) {
        this._id = inId;
        if (inNodes.length < 2) {
            throw new Error('#cls.dfg.ini.000: ' + 'initializing dfg failed - number of nodes given (' + inNodes.length + ') is less than two');
        };
        if (inArcs.length < 1) {
            throw new Error('#cls.dfg.ini.001: ' + 'initializing dfg failed - number of arcs given (' + inArcs.length + ') is less than one');
        };
        if (inStartNode.type !== 'support') {
            throw new Error('#cls.dfg.ini.002: ' + 'initializing dfg failed - type of given start node (\'' + inStartNode.type + '\') is not \'support\')');
        };
        if (inStartNode.label !== 'play') {
            throw new Error('#cls.dfg.ini.003: ' + 'initializing dfg failed - label of given start node (\'' + inStartNode.label + '\') is not \'play\')');
        };
        if (inEndNode.type !== 'support') {
            throw new Error('#cls.dfg.ini.004: ' + 'initializing dfg failed - type of given end node (\'' + inEndNode.type + '\') is not \'support\')');
        };
        if (inEndNode.label !== 'stop') {
            throw new Error('#cls.dfg.ini.005: ' + 'initializing dfg failed - label of given end node (\'' + inEndNode.label + '\') is not \'stop\')');
        };
        let startNotFound : boolean = true;
        let endNotFound : boolean = true;
        for (const node of inNodes) {
            if (node === inStartNode) {
                startNotFound = false;
            } else if (node === inEndNode) {
                endNotFound = false;
            };
        };
        if (startNotFound) {
            if (endNotFound) {
                throw new Error('#cls.dfg.ini.006: ' + 'initializing dfg failed - neither the given start node (' + inStartNode + '), nor the given end node (' + inEndNode + ') is part of the given array of nodes (' + inNodes + ')');
            } else {
                throw new Error('#cls.dfg.ini.007: ' + 'initializing dfg failed - the given start node (' + inStartNode + ') is not part of the given array of nodes (' + inNodes + ')');
            }
        } else if (endNotFound) {
            throw new Error('#cls.dfg.ini.008: ' + 'initializing dfg failed - the given end node (' + inEndNode + ') is not part of the given array of nodes (' + inNodes + ')');
        };
        for (const node of inNodes) {
            node.dfg = this._id;
        };
        for (const arc of inArcs) {
            arc.dfg = this._id;
        };
        this._startNode = inStartNode;
        this._endNode = inEndNode;
        this._nodes = inNodes;
        this._arcs = inArcs;
        this._log = inLog;
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

    public get log() : Node[][] {
        return this._log;
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

    public set log(inLog : Node[][]) {
        this._log = inLog;
    };

    /* methods : other */

    public update(
        inStartNode: Node, 
        inEndNode: Node, 
        inNodes: Node[], 
        inArcs: Arc[], 
        inLog : Node[][]
    ) : void {
        if (inNodes.length < 2) {
            throw new Error('#cls.dfg.upd.000: ' + 'updating dfg failed - number of nodes given (' + inNodes.length + ') is less than two');
        };
        if (inArcs.length < 1) {
            throw new Error('#cls.dfg.upd.001: ' + 'updating dfg failed - number of arcs given (' + inArcs.length + ') is less than one');
        };
        if (inStartNode.type !== 'support') {
            throw new Error('#cls.dfg.upd.002: ' + 'updating dfg failed - type of given start node (\'' + inStartNode.type + '\') is not \'support\')');
        };
        if (inStartNode.label !== 'play') {
            throw new Error('#cls.dfg.upd.003: ' + 'updating dfg failed - label of given start node (\'' + inStartNode.label + '\') is not \'play\')');
        };
        if (inEndNode.type !== 'support') {
            throw new Error('#cls.dfg.upd.004: ' + 'updating dfg failed - type of given end node (\'' + inEndNode.type + '\') is not \'support\')');
        };
        if (inEndNode.label !== 'stop') {
            throw new Error('#cls.dfg.upd.005: ' + 'updating dfg failed - label of given end node (\'' + inEndNode.label + '\') is not \'stop\')');
        };
        let startNotFound : boolean = true;
        let endNotFound : boolean = true;
        for (const node of inNodes) {
            if (node === inStartNode) {
                startNotFound = false;
            } else if (node === inEndNode) {
                endNotFound = false;
            };
        };
        if (startNotFound) {
            if (endNotFound) {
                throw new Error('#cls.dfg.upd.006: ' + 'updating dfg failed - neither the given start node (' + inStartNode + '), nor the given end node (' + inEndNode + ') is part of the given array of nodes (' + inNodes + ')');
            } else {
                throw new Error('#cls.dfg.upd.007: ' + 'updating dfg failed - the given start node (' + inStartNode + ') is not part of the given array of nodes (' + inNodes + ')');
            }
        } else if (endNotFound) {
            throw new Error('#cls.dfg.upd.008: ' + 'updating dfg failed - the given end node (' + inEndNode + ') is not part of the given array of nodes (' + inNodes + ')');
        };
        for (const node of inNodes) {
            node.dfg = this._id;
        };
        for (const arc of inArcs) {
            arc.dfg = this._id;
        };
        this._startNode = inStartNode;
        this._endNode = inEndNode;
        this._nodes = inNodes;
        this._arcs = inArcs;
        this._log = inLog;
    };

};