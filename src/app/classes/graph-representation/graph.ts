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
    private _unmarkedNodes: Array<Node>
    private _markedArcs : Array<Arc>;

    private _changedNodes : Array<Node>;
    private _changedArcs : Array<Arc>;

    private _newNodes : Array<Node>;
    private _newArcs : Array<Arc>;

    private _initialState : boolean;

    /* methods : constructor */

    public constructor(
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
        this._unmarkedNodes = [];
        this._markedArcs = [];
        this._changedNodes = [];
        this._changedArcs = [];
        this._newNodes = [];
        this._newArcs = [];
        this._initialState = true;
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

    public get unmarkedNodes(): Array<Node>{
        return this._nodes.filter(node => node !== undefined && node.unmarked) as Array<Node>
    }


    public get markedArcs() : Array<Arc> {
        return this._markedArcs;
    };

    public get changedNodes() : Array<Node> {
        return this._changedNodes;
    };

    public get changedArcs() : Array<Arc> {
        return this._changedArcs;
    };

    public get newNodes() : Array<Node> {
        return this._newNodes;
    };

    public get newArcs() : Array<Arc> {
        return this._newArcs;
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

    public set changedNodes(inChangedNodes : Node[]) {
        this._changedNodes = inChangedNodes;
        if (this._initialState) {
            this._initialState = false;
        };
    };

    public set changedArcs(inChangedArcs : Arc[]) {
        this._changedArcs = inChangedArcs;
        if (this._initialState) {
            this._initialState = false;
        };
    };

    public set newNodes(inNewNodes : Node[]) {
        this._newNodes = inNewNodes;
        if (this._initialState) {
            this._initialState = false;
        };
    };

    public set newArcs(inNewArcs : Arc[]) {
        this._newArcs = inNewArcs;
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

    public appendDFG(
        inStartNode : Node,
        inEndNode : Node,
        inNodes : Node[],
        inArcs : Arc[],
        inLog : Node[][]
    ) : [
        number,
        DFG
    ] {
        const addedDFG : DFG = new DFG(this._dfgMax, inStartNode, inEndNode, inNodes, inArcs, inLog)
        const dfgLength : number = this.dfgArray.push(addedDFG);
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

    public setElementMarkedFlag(inElement : Node | Arc, inValue : boolean) {
        if (inValue !== inElement.marked) {
            if (inElement instanceof Node) {
                if (inValue) {
                    this.markedNodes.push(inElement);
                    inElement.marked = true;
                } else {
                    let nodeID : number = 0;
                    let foundElement : boolean = false;
                    for (const node of this.markedNodes) {
                        if (node !== inElement) {
                            nodeID++;
                        } else {
                            foundElement = true;
                            this.markedNodes.splice(nodeID, 1);
                            inElement.marked = false;
                        };
                    };
                    if (!foundElement) {
                        throw new Error('#cls.grp.sem.000: ' + 'reset of node marked flag failed - given node (' + inElement + ') is flagged as marked, but not a part of the marked nodes array (' + this.markedNodes + ')');
                    };
                };
            } else {
                if (inValue) {
                    this.markedArcs.push(inElement);
                    inElement.marked = true;
                } else {
                    let arcID : number = 0;
                    let foundElement : boolean = false;
                    for (const arc of this.markedArcs) {
                        if (arc !== inElement) {
                            arcID++;
                        } else {
                            foundElement = true;
                            this.markedArcs.splice(arcID, 1);
                            inElement.marked = false;
                        };
                    };
                    if (!foundElement) {
                        throw new Error('#cls.grp.sem.001: ' + 'reset of arc marked flag failed - given arc (' + inElement + ') is flagged as marked, but not a part of the marked arcs array (' + this.markedArcs + ')');
                    };
                };
            };
            if (this._initialState) {
                this._initialState = false;
            };
        };
    };

    public resetAllMarked() {
        for (const node of this.markedNodes) {
            if (node.marked) {
                node.marked = false;
            } else {
                throw new Error('#cls.grp.rsm.000: ' + 'resetting mark flag of all marked elements failed - the marked nodes array contains a node not flagged as marked: (' + node + ')');
            };
        };
        this.markedNodes = [];
        for (const arc of this.markedArcs) {
            if (arc.marked) {
                arc.marked = false;
            } else {
                throw new Error('#cls.grp.rsm.001: ' + 'resetting mark flag of all marked elements failed - the marked arcs array contains an arc not flagged as marked: (' + arc + ')');
            };
        };
        this.markedArcs = [];
        for (const node of this.nodes) {
            if (node !== undefined) {
                if (node.marked) {
                    throw new Error('#cls.grp.rsm.002: ' + 'resetting mark flag of all marked elements failed - found a marked node that is not part of the marked nodes array (' + node + ')');
                };
            };
        };
        for (const arc of this.arcs) {
            if (arc.marked) {
                throw new Error('#cls.grp.rsm.003: ' + 'resetting mark flag of all marked elements failed - found a marked arc that is not part of the marked arcs array (' + arc + ')');
            };
        };
        if (this._initialState) {
            this._initialState = false;
        };
    };

    public setElementChangedFlag(inElement : Node | Arc, inValue : boolean) {
        if (inValue !== inElement.changed) {
            if (inElement instanceof Node) {
                if (inValue) {
                    this.changedNodes.push(inElement);
                    inElement.changed = true;
                } else {
                    let nodeID : number = 0;
                    let foundElement : boolean = false;
                    for (const node of this.changedNodes) {
                        if (node !== inElement) {
                            nodeID++;
                        } else {
                            foundElement = true;
                            this.changedNodes.splice(nodeID, 1);
                            inElement.changed = false;
                        };
                    };
                    if (!foundElement) {
                        throw new Error('#cls.grp.sem.000: ' + 'reset of node changed flag failed - given node (' + inElement + ') is flagged as changed, but not a part of the changed nodes array (' + this.changedNodes + ')');
                    };
                };
            } else {
                if (inValue) {
                    this.changedArcs.push(inElement);
                    inElement.changed = true;
                } else {
                    let arcID : number = 0;
                    let foundElement : boolean = false;
                    for (const arc of this.changedArcs) {
                        if (arc !== inElement) {
                            arcID++;
                        } else {
                            foundElement = true;
                            this.changedArcs.splice(arcID, 1);
                            inElement.changed = false;
                        };
                    };
                    if (!foundElement) {
                        throw new Error('#cls.grp.sem.001: ' + 'reset of arc changed flag failed - given arc (' + inElement + ') is flagged as changed, but not a part of the changed arcs array (' + this.changedArcs + ')');
                    };
                };
            };
            if (this._initialState) {
                this._initialState = false;
            };
        };
    };

    public resetAllChanged() {
        for (const node of this.changedNodes) {
            if (node.changed) {
                node.changed = false;
            } else {
                throw new Error('#cls.grp.rsc.000: ' + 'resetting change flag of all changed elements failed - the changed nodes array contains a node not flagged as changed: (' + node + ')');
            };
        };
        this.changedNodes = [];
        for (const arc of this.changedArcs) {
            if (arc.changed) {
                arc.changed = false;
            } else {
                throw new Error('#cls.grp.rsc.001: ' + 'resetting change flag of all changed elements failed - the changed arcs array contains an arc not flagged as changed: (' + arc + ')');
            };
        };
        this.changedArcs = [];
        for (const node of this.nodes) {
            if (node !== undefined) {
                if (node.changed) {
                    throw new Error('#cls.grp.rsc.002: ' + 'resetting change flag of all changed elements failed - found a changed node that is not part of the changed nodes array (' + node + ')');
                };
            };
        };
        for (const arc of this.arcs) {
            if (arc.changed) {
                throw new Error('#cls.grp.rsc.003: ' + 'resetting change flag of all changed elements failed - found a changed arc that is not part of the changed arcs array (' + arc + ')');
            };
        };
        if (this._initialState) {
            this._initialState = false;
        };
    };

    public setElementNewFlag(inElement : Node | Arc, inValue : boolean) {
        if (inValue !== inElement.newlyCreated) {
            if (inElement instanceof Node) {
                if (inValue) {
                    this.newNodes.push(inElement);
                    inElement.newlyCreated = true;
                } else {
                    let nodeID : number = 0;
                    let foundElement : boolean = false;
                    for (const node of this.newNodes) {
                        if (node !== inElement) {
                            nodeID++;
                        } else {
                            foundElement = true;
                            this.newNodes.splice(nodeID, 1);
                            inElement.newlyCreated = false;
                        };
                    };
                    if (!foundElement) {
                        throw new Error('#cls.grp.sem.000: ' + 'reset of node new flag failed - given node (' + inElement + ') is flagged as new, but not a part of the new nodes array (' + this.newNodes + ')');
                    };
                };
            } else {
                if (inValue) {
                    this.newArcs.push(inElement);
                    inElement.newlyCreated = true;
                } else {
                    let arcID : number = 0;
                    let foundElement : boolean = false;
                    for (const arc of this.newArcs) {
                        if (arc !== inElement) {
                            arcID++;
                        } else {
                            foundElement = true;
                            this.newArcs.splice(arcID, 1);
                            inElement.newlyCreated = false;
                        };
                    };
                    if (!foundElement) {
                        throw new Error('#cls.grp.sem.001: ' + 'reset of arc new flag failed - given arc (' + inElement + ') is flagged as new, but not a part of the new arcs array (' + this.newArcs + ')');
                    };
                };
            };
            if (this._initialState) {
                this._initialState = false;
            };
        };
    };

    public resetAllNew() {
        for (const node of this.newNodes) {
            if (node.newlyCreated) {
                node.newlyCreated = false;
            } else {
                throw new Error('#cls.grp.rsc.000: ' + 'resetting change flag of all new elements failed - the new nodes array contains a node not flagged as new: (' + node + ')');
            };
        };
        this.newNodes = [];
        for (const arc of this.newArcs) {
            if (arc.newlyCreated) {
                arc.newlyCreated = false;
            } else {
                throw new Error('#cls.grp.rsc.001: ' + 'resetting change flag of all new elements failed - the new arcs array contains an arc not flagged as new: (' + arc + ')');
            };
        };
        this.newArcs = [];
        for (const node of this.nodes) {
            if (node !== undefined) {
                if (node.newlyCreated) {
                    throw new Error('#cls.grp.rsc.002: ' + 'resetting change flag of all new elements failed - found a new node that is not part of the new nodes array (' + node + ')');
                };
            };
        };
        for (const arc of this.arcs) {
            if (arc.newlyCreated) {
                throw new Error('#cls.grp.rsc.003: ' + 'resetting change flag of all new elements failed - found a new arc that is not part of the new arcs array (' + arc + ')');
            };
        };
        if (this._initialState) {
            this._initialState = false;
        };
    };

};
