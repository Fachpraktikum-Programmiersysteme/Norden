import {Node} from './node';
import {Arc} from './arc';
import {DFG} from './dfg';

export class Graph {

    /* attributes */
    
    private _nodes : Array<Node | undefined>;
    private _nodeCount : number;
    private _supportCount : number;
    private _eventCount : number;
    private _placeCount : number;
    private _transitionCount : number;

    private _arcs : Array<Arc>;
    private _arcCount : number;

    private _markedNodes : Array<Node>;
    private _markedArcs : Array<Arc>;

    private _logArray : Array<Array<Node>>;

    private _dfgArray : Array<DFG>;
    private _dfgCount : number;
    private _dfgMax : number;

    private _initialState : boolean;

    /* methods : constructor */
    
    public constructor(
        /* to be removed - start*/
        // inNodes? : Array<Node>, 
        // inArcs? : Array<Arc>, 
        // inDFGs? : Array<[Node, Node, Node[], Arc[]]>, 
        // inEventLog? : Array<Node[]>
        /* to be removed - end*/
    ) {
        this._nodes = [];
        this._nodeCount = 0;
        this._supportCount = 0;
        this._eventCount = 0;
        this._placeCount = 0;
        this._transitionCount = 0;
        this._arcs = [];
        this._arcCount = 0;
        this._markedNodes = [];
        this._markedArcs = [];
        this._logArray = [];
        this._dfgArray = [];
        this._dfgCount = 0;
        this._dfgMax = 0;
        this._initialState = true;
        /* to be removed - start*/
        // if ((inNodes !== undefined) && (inNodes.length > 0)) {
        //     for (const node of inNodes) {
        //         this.addNode(node.type, node.label, node.x, node.y);
        //     };
        //     this._initialState = false;
        // };
        // if ((inArcs !== undefined) && (inArcs.length > 0)) {
        //     for (const arc of inArcs) {
        //         this.addArc(arc.target, arc.source, arc.dfg, arc.weight);
        //     };
        //     this._initialState = false;
        // };
        // if ((inEventLog !== undefined) && (inEventLog.length > 0)) {
        //     let eventFound : boolean = false;
        //     for (const trace of inEventLog) {
        //         if (trace.length > 0) {
        //             eventFound = true;
        //             const traceArray : Node[] = [];
        //             for (const event of trace) {
        //                 traceArray.push(event);
        //             };
        //             this._logArray.push(traceArray);
        //         };
        //     };
        //     if (eventFound) {
        //         this._initialState = false;
        //     };
        // };
        // if ((inDFGs !== undefined) && (inDFGs.length > 0)) {
        //     let dfgFound : boolean = false;
        //     for (const dfg of inDFGs) {
        //         if (dfg.length === 4) {
        //             dfgFound = true;
        //             this._dfgMax++;
        //             const newDFG : DFG = new DFG(this._dfgMax, dfg[0], dfg[1], dfg[2], dfg[3])
        //             this._dfgArray.push(newDFG);
        //         };
        //     };
        //     if (dfgFound) {
        //         this._initialState = false;
        //     };
        // };
        /* to be removed - end*/
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

    public get arcs(): Array<Arc> {
        return this._arcs;
    };

    public get arcCount(): number {
        return this._arcCount;
    };

    public get markedNodes() : Array<Node> {
        return this._markedNodes;
    };

    public get markedArcs() : Array<Arc> {
        return this._markedArcs;
    };

    public get logArray() : Array<Array<Node>> {
        return this._logArray;
    };

    public get dfgArray() : Array<DFG> {
        return this._dfgArray;
    };

    public get initialState(): boolean {
        return this._initialState;
    };

    /* methods : setters */

    public set markedNodes(inMarkedNodes : Node[]) {
        this._markedNodes = inMarkedNodes;
        if (this._initialState) {
            this._initialState = false;
        };
    };

    public set markedArcs(inMarkedArcs : Arc[]) {
        this._markedArcs = inMarkedArcs;
        if (this._initialState) {
            this._initialState = false;
        };
    };

    public set logArray(inEventLog : Node[][]) {
        this._logArray = inEventLog;
        if (this._initialState) {
            this._initialState = false;
        };
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
        inDFG : number | undefined, 
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
        nodesLength = this._nodes.push(new Node(this._nodes.length, inType, inLabel, inDFG, x, y));
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
        inDFG : number | undefined, 
        inX? : number, 
        inY? : number
    ) : [boolean, number] {
        switch (inType) {
            case 'support' : {
                return this.appendNode(inType, inLabel, inDFG, inX, inY);
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
                    return this.appendNode(inType, inLabel, inDFG, inX, inY);
                }
            }
            case 'place' : {
                return this.appendNode(inType, inLabel, inDFG, inX, inY);
            }
            case 'transition' : {
                return this.appendNode(inType, inLabel, inDFG, inX, inY);
            };
        };
    };

    public deleteNode(
        inIndex : number
    ) : Node | undefined {
        if (inIndex > 0) {
            if (inIndex < (this._nodes.length)) {
                const deletedEntry : Node | undefined = this._nodes[inIndex];
                this._nodes[inIndex] = undefined;
                this._nodeCount--;
                if (this._initialState) {
                    this._initialState = false;
                };
                return deletedEntry;
            } else {
                throw new Error('#cls.grp.rmn.000: ' + 'node deletion failed - given index (' + inIndex + ') is greater than the highest within the array (' + (this._nodes.length - 1) + ')');
            };
        } else {
            throw new Error('#cls.grp.rmn.001: ' + 'node deletion failed - given index (' + inIndex + ') is less than zero');
        };
    };

    private checkArc(
        inSource : Node, 
        inTarget : Node
    ) : [
        boolean, 
        number?
    ] {
        for (let i = 0; i < this._arcs.length; i++) {
            if (this._arcs[i].source === inSource) {
                if (this._arcs[i].target === inTarget) {
                    return [true, i];
                };
            };
        };
        return [false];
    };

    public addArc(
        inSource : Node, 
        inTarget : Node, 
        inDFG : number | undefined, 
        inWeight? : number
    ) : [boolean, number]  {
        if (inWeight === undefined) {
            const arcExists : [boolean, number?] = this.checkArc(inSource, inTarget);
            if (arcExists[0]) {
                if (arcExists[1] !== undefined) {
                    this._arcs[arcExists[1]].weight++;
                    this._arcCount++;
                    if (this._initialState) {
                        this._initialState = false;
                    };
                    return [false, arcExists[1]];
                } else {
                    throw new Error('#cls.grp.ada.000: ' + 'arc addition failed - impossible error');
                };
            } else {
                let arcsLength : number;
                const reverseExists : [boolean, number?] = this.checkArc(inTarget, inSource);
                if (reverseExists[0]) {
                    if (reverseExists[1] !== undefined) {
                        this._arcs[reverseExists[1]].reverseExists = true;
                    } else {
                        throw new Error('#cls.grp.ada.001: ' + 'arc addition failed - impossible error');
                    };
                    arcsLength = this._arcs.push(new Arc(inSource, inTarget, 1, true, inDFG));
                } else {
                    arcsLength = this._arcs.push(new Arc(inSource, inTarget, 1, false, inDFG));
                };
                this._arcCount++;
                if (this._initialState) {
                    this._initialState = false;
                };
                return [true, (arcsLength - 1)];
            };
        } else {
            if (inWeight > 0) {
                const arcExists : [boolean, number?] = this.checkArc(inSource, inTarget);
                if (arcExists[0]) {
                    if (arcExists[1] !== undefined) {
                        this._arcs[arcExists[1]].weight = this._arcs[arcExists[1]].weight + inWeight;
                        this._arcCount = this._arcCount + inWeight;
                        if (this._initialState) {
                            this._initialState = false;
                        };
                        return [false, arcExists[1]];
                    } else {
                        throw new Error('#cls.grp.ada.002: ' + 'arc addition failed - impossible error');
                    };
                } else {
                    let arcsLength : number;
                    const reverseExists : [boolean, number?] = this.checkArc(inTarget, inSource);
                    if (reverseExists[0]) {
                        if (reverseExists[1] !== undefined) {
                            this._arcs[reverseExists[1]].reverseExists = true;
                        } else {
                            throw new Error('#cls.grp.ada.003: ' + 'arc addition failed - impossible error');
                        };
                        arcsLength = this._arcs.push(new Arc(inSource, inTarget, inWeight, true, inDFG));
                    } else {
                        arcsLength = this._arcs.push(new Arc(inSource, inTarget, inWeight, false, inDFG));
                    };
                    this._arcCount = this._arcCount + inWeight;
                    if (this._initialState) {
                        this._initialState = false;
                    };
                    return [true, (arcsLength - 1)];
                };
            } else if (inWeight === 0) {
                throw new Error('#cls.grp.ada.004: ' + 'arc addition failed - cannot add arc with weight of zero');
            } else {
                throw new Error('#cls.grp.ada.005: ' + 'arc addition failed - cannot add arc with negative weight');
            };
        };
    };

    public deleteArc(
        inSource : Node, 
        inTarget : Node
    ) : number {
        if (inSource.id > 0) {
            if (inTarget.id > 0) {
                if (inSource.id < (this._nodes.length)) {
                    if (inTarget.id < (this._nodes.length)) {
                        let arcExists : [boolean, number?] = this.checkArc(inSource, inTarget);
                        if (arcExists[0]) {
                            if (arcExists[1] !== undefined) {
                                if (this._arcs[arcExists[1]].reverseExists === true) {
                                    const reverseExists : [boolean, number?] = this.checkArc(inTarget, inSource);
                                    if (reverseExists[0]) {
                                        if (reverseExists[1] !== undefined) {
                                            this._arcs[reverseExists[1]].reverseExists = false;
                                        } else {
                                            throw new Error('#cls.grp.rma.000: ' + 'arc deletion failed - impossible error');
                                        };
                                    } else {
                                        throw new Error('#cls.grp.rma.001: ' + 'arc deletion failed - arc to be deleted states that a reverse arc exists, but no such arc was found');
                                    };
                                };
                                const foundArcs = this._arcs[arcExists[1]].weight;
                                this._arcs[arcExists[1]].weight = 0;
                                this._arcCount = (this._arcCount - foundArcs);
                                this._arcs.splice(arcExists[1], 1);
                                if (this._initialState) {
                                    this._initialState = false;
                                };
                                return foundArcs;
                            } else {
                                throw new Error('#cls.grp.rma.002: ' + 'arc deletion failed - impossible error');
                            };
                        } else {
                            throw new Error('#cls.grp.rma.003: ' + 'arc deletion failed - no arc exists from source node (' + inSource.id + ') to target node (' + inTarget.id + ')');
                        };
                    } else {
                        throw new Error('#cls.grp.rma.004: ' + 'arc deletion failed - given index of target node (' + inTarget.id + ') is greater than the highest within the array (' + (this._nodes.length - 1) + ')');
                    };
                } else {
                    throw new Error('#cls.grp.rma.005: ' + 'arc deletion failed - given index of source node (' + inSource.id + ') is greater than the highest within the array (' + (this._nodes.length - 1) + ')');
                };
            } else {
                throw new Error('#cls.grp.rma.006: ' + 'arc deletion failed - given index of target node (' + inTarget.id + ') is less than zero');
            };
        } else {
            throw new Error('#cls.grp.rma.007: ' + 'arc deletion failed - given index of source node  (' + inSource.id + ') is less than zero');
        };
    };

    public appendDFG(
        inStartNode: Node, 
        inEndNode: Node, 
        inNodes: Node[], 
        inArcs: Arc[]
    ) : number {
        this._dfgMax++;
        this._dfgCount++;
        const dfgLength : number = this.dfgArray.push(new DFG(this._dfgMax, inStartNode, inEndNode, inNodes, inArcs));
        if (this._initialState) {
            this._initialState = false;
        };
        return (this.dfgArray[dfgLength - 1].id);
    };

    public deleteDFG(
        inPosition : number
    ) : DFG[] {
        if (inPosition >= 0) {
            if (inPosition < this._dfgArray.length) {
                const splicedDFGs : DFG[] = this._dfgArray.splice(inPosition, 1);
                this._dfgCount--;
                if (this._initialState) {
                    this._initialState = false;
                };
                return splicedDFGs;
            } else {
                throw new Error('#cls.grp.rmd.000: ' + 'dfg deletion failed - given position (' + inPosition + ') is larger than array size (' + this._dfgArray.length + ')');
            };
        } else {
            throw new Error('#cls.grp.rmd.001: ' + 'dfg deletion failed - given position (' + inPosition + ') is less than zero'); 
        };
    };

};