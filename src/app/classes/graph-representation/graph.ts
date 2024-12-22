import {Node} from './node';
import {Arc} from './arc';
import {DFG} from './dfg';

export class Graph {

    /* attributes */
    
    private _nodes : Array<Node | undefined>;
    private _startNode : Node | undefined;
    private _endNode : Node | undefined;
    private _nodeCount : number;
    private _supportCount : number;
    private _eventCount : number;
    private _placeCount : number;
    private _transitionCount : number;

    private _arcs : Array<Arc>;
    private _arcCount : number;

    private _logArray : Array<Array<Node>>;

    private _dfgArray : Array<DFG>;
    private _dfgCount : number;
    private _dfgMax : number;

    private _markedNodes : Array<Node>;
    private _markedArcs : Array<Arc>;

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
        this._logArray = [];
        this._dfgArray = [];
        this._dfgCount = 0;
        this._dfgMax = 0;
        this._markedNodes = [];
        this._markedArcs = [];
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

    public get startNode(): Node | undefined {
        return this._startNode;
    };

    public get endNode(): Node | undefined {
        return this._endNode;
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

    public get logArray() : Array<Array<Node>> {
        return this._logArray;
    };

    public get dfgArray() : Array<DFG> {
        return this._dfgArray;
    };

    public get markedNodes() : Array<Node> {
        return this._markedNodes;
    };

    public get markedArcs() : Array<Arc> {
        return this._markedArcs;
    };

    public get initialState(): boolean {
        return this._initialState;
    };

    /* methods : setters */

    public set startNode(inNode : Node | undefined) {
        this._startNode = inNode;
    };

    public set endNode(inNode : Node | undefined) {
        this._endNode = inNode;
    };

    public set logArray(inEventLog : Node[][]) {
        this._logArray = inEventLog;
        if (this._initialState) {
            this._initialState = false;
        };
    };

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

    /* methods : other */

    public checkNode(
        inType : 'support' | 'event' | 'place' | 'transition', 
        inLabel : string
    ) : [
        boolean, 
        number?, 
        Node?
    ] {
        for (let i = 0; i < this._nodes.length; i++) {
            let node = this._nodes[i];
            if (node !== undefined) {
                if (node.type === inType) {
                    if (node.label === inLabel) {
                        if (node.id === i) {
                            return [true, node.id, this.nodes[node.id]];
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
    ) : [
        boolean, 
        number, 
        Node
    ] {
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
        const appendedNode : Node = new Node(this._nodes.length, inType, inLabel, x, y);
        const nodesLength : number = this._nodes.push(appendedNode);
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
        return [true, (nodesLength - 1), appendedNode];
    };

    public addNode(
        inType : 'support' | 'event' | 'place' | 'transition', 
        inLabel : string, 
        inX? : number, 
        inY? : number
    ) : [
        boolean, 
        number, 
        Node
    ] {
        switch (inType) {
            case 'support' : {
                return this.appendNode(inType, inLabel, inX, inY);
            }
            case 'event' : {
                let nodeExists : [boolean, number?, Node?] = this.checkNode(inType, inLabel);
                if (nodeExists[0]) {
                    if (nodeExists[1] !== undefined) {
                        if (nodeExists[2] !== undefined) {
                            return [false, nodeExists[1], nodeExists[2]];
                        } else {
                            throw new Error('#cls.grp.adn.000: ' + 'node addition failed - impossible error')
                        };
                    } else {
                        throw new Error('#cls.grp.adn.001: ' + 'node addition failed - impossible error')
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

    public deleteNode(
        inNode : Node
    ) : boolean {
        for (const node of this._nodes) {
            if (node === inNode) {
                if (node.marked) {
                    let nodeFound : boolean = false;
                    for (let nodePos = 0; nodePos < this.markedNodes.length; nodePos++) {
                        if (this.markedNodes[nodePos] === node) {
                            this.markedNodes.splice(nodePos, 1);
                            nodeFound = true;
                            break;
                        };
                    };
                    if (!(nodeFound)) {
                        throw new Error('#cls.grp.dln.000: ' + 'node deletion failed - node to be deleted is marked, but could not be found in the marked nodes array');
                    };
                };
                this._nodes[node.id] = undefined;
                switch (node.type) {
                    case 'support' : {
                        this._supportCount--;
                        break;
                    }
                    case 'event' : {
                        this._eventCount--;
                        break;
                    }
                    case 'place' : {
                        this._placeCount--;
                        break;
                    }
                    case 'transition' : {
                        this._transitionCount--;
                        break;
                    }
                };
                this._nodeCount--;
                if (this._initialState) {
                    this._initialState = false;
                };
                return true;
            };
        };
        return false;
    };

    /* TODO - if the service works as intended, remove the following comments */
    // 
    // public deleteNode(
    //     inIndex : number
    // ) : Node | undefined {
    //     if (inIndex > 0) {
    //         if (inIndex < (this._nodes.length)) {
    //             const deletedEntry : Node | undefined = this._nodes[inIndex];
    //             this._nodes[inIndex] = undefined;
    //             this._nodeCount--;
    //             if (this._initialState) {
    //                 this._initialState = false;
    //             };
    //             return deletedEntry;
    //         } else {
    //             throw new Error('#cls.grp.rmn.000: ' + 'node deletion failed - given index (' + inIndex + ') is greater than the highest within the array (' + (this._nodes.length - 1) + ')');
    //         };
    //     } else {
    //         throw new Error('#cls.grp.rmn.001: ' + 'node deletion failed - given index (' + inIndex + ') is less than zero');
    //     };
    // };

    private checkArc(
        inSource : Node, 
        inTarget : Node
    ) : [
        boolean, 
        number?, 
        Arc?
    ] {
        for (let i = 0; i < this._arcs.length; i++) {
            if (this._arcs[i].source === inSource) {
                if (this._arcs[i].target === inTarget) {
                    return [true, i, this._arcs[i]];
                };
            };
        };
        return [false];
    };

    public addArc(
        inSource : Node, 
        inTarget : Node, 
        inWeight? : number
    ) : [
        boolean, 
        number, 
        Arc
    ]  {
        if (inWeight === undefined) {
            const arcExists : [boolean, number?, Arc?] = this.checkArc(inSource, inTarget);
            if (arcExists[0]) {
                if (arcExists[1] !== undefined) {
                    if (arcExists[2] !== undefined) {
                        arcExists[2].weight++;
                        this._arcCount++;
                        if (this._initialState) {
                            this._initialState = false;
                        };
                        return [false, arcExists[1], arcExists[2]];
                    } else {
                        throw new Error('#cls.grp.ada.000: ' + 'arc addition failed - impossible error');
                    };
                } else {
                    throw new Error('#cls.grp.ada.001: ' + 'arc addition failed - impossible error');
                };
            } else {
                let addedArc : Arc;
                let arcsLength : number;
                const reverseExists : [boolean, number?, Arc?] = this.checkArc(inTarget, inSource);
                if (reverseExists[0]) {
                    if (reverseExists[2] !== undefined) {
                        reverseExists[2].reverseExists = true;
                    } else {
                        throw new Error('#cls.grp.ada.002: ' + 'arc addition failed - impossible error');
                    };
                    addedArc = new Arc(inSource, inTarget, 1, true);
                } else {
                    addedArc = new Arc(inSource, inTarget, 1, false);
                };
                arcsLength = this._arcs.push(addedArc);
                inSource.outArcs++;
                inTarget.inArcs++;
                this._arcCount++;
                if (this._initialState) {
                    this._initialState = false;
                };
                return [true, (arcsLength - 1), addedArc];
            };
        } else {
            if (inWeight > 0) {
                const arcExists : [boolean, number?, Arc?] = this.checkArc(inSource, inTarget);
                if (arcExists[0]) {
                    if (arcExists[1] !== undefined) {
                        if (arcExists[2] !== undefined) {
                            arcExists[2].weight = arcExists[2].weight + inWeight;
                            this._arcCount = this._arcCount + inWeight;
                            if (this._initialState) {
                                this._initialState = false;
                            };
                            return [false, arcExists[1], arcExists[2]];
                        } else {
                            throw new Error('#cls.grp.ada.003: ' + 'arc addition failed - impossible error');
                        };
                    } else {
                        throw new Error('#cls.grp.ada.004: ' + 'arc addition failed - impossible error');
                    };
                } else {
                    let addedArc : Arc;
                    let arcsLength : number;
                    const reverseExists : [boolean, number?, Arc?] = this.checkArc(inTarget, inSource);
                    if (reverseExists[0]) {
                        if (reverseExists[2] !== undefined) {
                            reverseExists[2].reverseExists = true;
                        } else {
                            throw new Error('#cls.grp.ada.005: ' + 'arc addition failed - impossible error');
                        };
                        addedArc = new Arc(inSource, inTarget, inWeight, true);
                    } else {
                        addedArc = new Arc(inSource, inTarget, inWeight, false);
                    };
                    arcsLength = this._arcs.push(addedArc);
                    inSource.outArcs++;
                    inTarget.inArcs++;
                    this._arcCount = this._arcCount + inWeight;
                    if (this._initialState) {
                        this._initialState = false;
                    };
                    return [true, (arcsLength - 1), addedArc];
                };
            } else if (inWeight === 0) {
                throw new Error('#cls.grp.ada.004: ' + 'arc addition failed - cannot add arc with weight of zero');
            } else {
                throw new Error('#cls.grp.ada.005: ' + 'arc addition failed - cannot add arc with negative weight');
            };
        };
    };

    public deleteArc(
        inArc : Arc
    ) : boolean {
        let arcIdx : number = 0;
        for (const arc of this._arcs) {
            if (arc === inArc) {
                if (arc.marked) {
                    let arcFound : boolean = false;
                    for (let arcPos = 0; arcPos < this.markedArcs.length; arcPos++) {
                        if (this.markedArcs[arcPos] === arc) {
                            this.markedArcs.splice(arcPos, 1);
                            arcFound = true;
                            break;
                        };
                    };
                    if (!(arcFound)) {
                        throw new Error('#cls.grp.dla.000: ' + 'arc deletion failed - arc to be deleted is marked, but could not be found in the marked arcs array');
                    };
                };
                if (arc.reverseExists) {
                    const reverseExists : [boolean, number?, Arc?] = this.checkArc(arc.target, arc.source);
                    if (reverseExists[0]) {
                        if (reverseExists[2] !== undefined) {
                            reverseExists[2].reverseExists = false;
                        } else {
                            throw new Error('#cls.grp.dla.001: ' + 'arc deletion failed - impossible error');
                        };
                    } else {
                        throw new Error('#cls.grp.dla.002: ' + 'arc deletion failed - arc to be deleted states that a reverse arc exists, but no such arc was found');
                    };
                };
                this._arcs.splice(arcIdx, 1);
                arc.source.outArcs--;
                arc.target.inArcs--;
                this._arcCount = (this._arcCount - arc.weight);
                if (this._initialState) {
                    this._initialState = false;
                };
                return true;
            };
            arcIdx++;
        };
        return false;
    };

    /* TODO - if the service works as intended, remove the following comments */
    // 
    // public deleteArc(
    //     inSource : Node, 
    //     inTarget : Node
    // ) : number {
    //     if (inSource.id > 0) {
    //         if (inTarget.id > 0) {
    //             if (inSource.id < (this._nodes.length)) {
    //                 if (inTarget.id < (this._nodes.length)) {
    //                     let arcExists : [boolean, number?] = this.checkArc(inSource, inTarget);
    //                     if (arcExists[0]) {
    //                         if (arcExists[1] !== undefined) {
    //                             if (this._arcs[arcExists[1]].reverseExists === true) {
    //                                 const reverseExists : [boolean, number?] = this.checkArc(inTarget, inSource);
    //                                 if (reverseExists[0]) {
    //                                     if (reverseExists[1] !== undefined) {
    //                                         this._arcs[reverseExists[1]].reverseExists = false;
    //                                     } else {
    //                                         throw new Error('#cls.grp.rma.000: ' + 'arc deletion failed - impossible error');
    //                                     };
    //                                 } else {
    //                                     throw new Error('#cls.grp.rma.001: ' + 'arc deletion failed - arc to be deleted states that a reverse arc exists, but no such arc was found');
    //                                 };
    //                             };
    //                             const foundArcs = this._arcs[arcExists[1]].weight;
    //                             this._arcs[arcExists[1]].weight = 0;
    //                             this._arcCount = (this._arcCount - foundArcs);
    //                             this._arcs.splice(arcExists[1], 1);
    //                             if (this._initialState) {
    //                                 this._initialState = false;
    //                             };
    //                             return foundArcs;
    //                         } else {
    //                             throw new Error('#cls.grp.rma.002: ' + 'arc deletion failed - impossible error');
    //                         };
    //                     } else {
    //                         throw new Error('#cls.grp.rma.003: ' + 'arc deletion failed - no arc exists from source node (' + inSource.id + ') to target node (' + inTarget.id + ')');
    //                     };
    //                 } else {
    //                     throw new Error('#cls.grp.rma.004: ' + 'arc deletion failed - given index of target node (' + inTarget.id + ') is greater than the highest within the array (' + (this._nodes.length - 1) + ')');
    //                 };
    //             } else {
    //                 throw new Error('#cls.grp.rma.005: ' + 'arc deletion failed - given index of source node (' + inSource.id + ') is greater than the highest within the array (' + (this._nodes.length - 1) + ')');
    //             };
    //         } else {
    //             throw new Error('#cls.grp.rma.006: ' + 'arc deletion failed - given index of target node (' + inTarget.id + ') is less than zero');
    //         };
    //     } else {
    //         throw new Error('#cls.grp.rma.007: ' + 'arc deletion failed - given index of source node  (' + inSource.id + ') is less than zero');
    //     };
    // };

    public appendDFG(
        inStartNode: Node, 
        inEndNode: Node, 
        inNodes: Node[], 
        inArcs: Arc[]
    ) : [
        number, 
        DFG
    ] {
        if (inNodes.length < 2) {
            throw new Error('#cls.grp.apd.000: ' + 'appending dfg failed - number of nodes given (' + inNodes.length + ') is less than two');
        };
        if (inArcs.length < 1) {
            throw new Error('#cls.grp.apd.001: ' + 'appending dfg failed - number of arcs given (' + inArcs.length + ') is less than one');
        };
        if (inStartNode.type !== 'support') {
            throw new Error('#cls.grp.apd.002: ' + 'appending dfg failed - type of given start node (\'' + inStartNode.type + '\') is not \'support\')');
        };
        if (inStartNode.label !== 'play') {
            throw new Error('#cls.grp.apd.003: ' + 'appending dfg failed - label of given start node (\'' + inStartNode.label + '\') is not \'play\')');
        };
        if (inEndNode.type !== 'support') {
            throw new Error('#cls.grp.apd.004: ' + 'appending dfg failed - type of given end node (\'' + inEndNode.type + '\') is not \'support\')');
        };
        if (inEndNode.label !== 'stop') {
            throw new Error('#cls.grp.apd.005: ' + 'appending dfg failed - label of given end node (\'' + inEndNode.label + '\') is not \'stop\')');
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
                throw new Error('#cls.grp.apd.006: ' + 'appending dfg failed - neither the given start node (' + inStartNode + '), nor the given end node (' + inEndNode + ') is part of the given array of nodes (' + inNodes + ')');
            } else {
                throw new Error('#cls.grp.apd.007: ' + 'appending dfg failed - the given start node (' + inStartNode + ') is not part of the given array of nodes (' + inNodes + ')');
            }
        } else if (endNotFound) {
            throw new Error('#cls.grp.apd.008: ' + 'appending dfg failed - the given end node (' + inEndNode + ') is not part of the given array of nodes (' + inNodes + ')');
        };
        const addedDFG : DFG = new DFG(this._dfgMax, inStartNode, inEndNode, inNodes, inArcs)
        const dfgLength : number = this.dfgArray.push(addedDFG);
        for (const node of inNodes) {
            node.dfg = this._dfgMax;
        };
        for (const arc of inArcs) {
            arc.dfg = this._dfgMax;
        };
        this._dfgCount++;
        this._dfgMax++;
        if (this._initialState) {
            this._initialState = false;
        };
        return [this.dfgArray[dfgLength - 1].id, addedDFG];
    };

    public deleteDFG(
        inDFG : DFG
    ) : boolean {
        let dfgIdx : number = 0;
        for (const dfg of this._dfgArray) {
            if (dfg === inDFG) {
                for (const node of dfg.nodes) {
                    node.dfg = undefined;
                };
                for (const arc of dfg.arcs) {
                    arc.dfg = undefined;
                };
                this._dfgArray.splice(dfgIdx, 1);
                this._dfgCount--;
                if (this._initialState) {
                    this._initialState = false;
                };
                return true;
            };
            dfgIdx++;
        };
        return false;
    };

    /* TODO - if the service works as intended, remove the following comments */
    // 
    // public deleteDFG(
    //     inPosition : number
    // ) : DFG[] {
    //     if (inPosition >= 0) {
    //         if (inPosition < this._dfgArray.length) {
    //             for (const node of this._dfgArray[inPosition].nodes) {
    //                 node.dfg = undefined;
    //             };
    //             for (const arc of this._dfgArray[inPosition].arcs) {
    //                 arc.dfg = undefined;
    //             };
    //             const splicedDFGs : DFG[] = this._dfgArray.splice(inPosition, 1);
    //             this._dfgCount--;
    //             if (this._initialState) {
    //                 this._initialState = false;
    //             };
    //             return splicedDFGs;
    //         } else {
    //             throw new Error('#cls.grp.rmd.000: ' + 'dfg deletion failed - given position (' + inPosition + ') is larger than array size (' + this._dfgArray.length + ')');
    //         };
    //     } else {
    //         throw new Error('#cls.grp.rmd.001: ' + 'dfg deletion failed - given position (' + inPosition + ') is less than zero'); 
    //     };
    // };

};