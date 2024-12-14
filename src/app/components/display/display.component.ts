import {Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";

import {catchError, of, Subscription, take} from 'rxjs';

import {FileReaderService} from "../../services/file-reader.service";
import {DisplayService} from '../../services/display.service';
import {SvgService} from '../../services/svg.service';

import {ExampleFileComponent} from "../../components/example-file/example-file.component";

import {Graph} from '../../classes/graph-representation/graph';
import {Node} from 'src/app/classes/graph-representation/node';
import {Cut} from '../../classes/graph-representation/cut';



@Component({
    selector: 'app-display',
    templateUrl: './display.component.html',
    styleUrls: ['./display.component.css']
})
export class DisplayComponent implements OnDestroy {

    /* properties */

    @ViewChild('drawingArea') drawingArea: ElementRef<SVGElement> | undefined;

    @Output('fileData') fileData: EventEmitter<[string, string]>;

    /* attributes */

    private _sub: Subscription;

    private _graph : Graph = new Graph();
    private _log : number[][] = [];
    private _max : number = 0;

    private arcActive  : boolean = false;
    private activeArc : [Node, Node, number, boolean, boolean] | undefined;

    private nodeActive  : boolean = false;
    private activeNode : Node | undefined;

    private nodeHeld : boolean = false;
    private heldNode : Node | undefined;

    private dragInProgress : boolean = false;
    private draggedNode : Node | undefined;

    private infoActive  : boolean = false;
    private activeInfo : Node | undefined;

    private cutActive: boolean = false;
    private activeCut: Cut | undefined;

    /* methods - constructor */

    public constructor(
        private _svgService: SvgService,
        private _displayService: DisplayService,
        private _fileReaderService: FileReaderService,
        private _http: HttpClient
    ) {
        this.fileData = new EventEmitter<[string, string]>();
        this._sub = this._displayService.graph$.subscribe(
            graph => {
                /* to be removed - start*/
                console.log('display_component noticed new graph through subscription');
                /* to be removed - end*/
                this._graph = this._displayService.graph;
                this._log = this._displayService.log;
                this._max = this._displayService.maxTraceLength;
                this.draw();
            }
        );
    };

    /* methods - on destroy */

    ngOnDestroy(): void {
        this._sub.unsubscribe();
        this.fileData.complete();
    };

    /* methods - other */

    public processDropEvent(inEvent: DragEvent): void {
        inEvent.preventDefault();
        const fileLocation = inEvent.dataTransfer?.getData(ExampleFileComponent.META_DATA_CODE);
        if (fileLocation) {
            this.fetchFile(fileLocation);
        } else {
            this.readFile(inEvent.dataTransfer?.files);
        }
    };

    private getNode(inId : number) : Node {
        const node : Node |undefined = this._graph.nodes[inId];
        if (node !== undefined) {
            return node;
        } else {
            throw new Error('#cmp.dsp.pmm.000: ' + 'node retrieval failed - node with given id is undefined');
        }
    };

    private getArc(inId : number) : [Node, Node, number, boolean, boolean] {
        const arc : [Node, Node, number, boolean, boolean] |undefined = this._graph.arcs[inId];
        if (arc !== undefined) {
            return arc;
        } else {
            throw new Error('#cmp.dsp.pmm.000: ' + 'node retrieval failed - arc with given id is undefined');
        }
    };

    private getMousePosition(inEvent : MouseEvent) : void {
        inEvent.preventDefault();
        console.log ('event.client   : (' + inEvent.clientX + '|' + inEvent.clientY + ')');
        console.log ('event.layer    : (' + inEvent.layerX + '|' + inEvent.layerY + ')');
        console.log ('event.movement : (' + inEvent.movementX + '|' + inEvent.movementY + ')');
        console.log ('event.offset   : (' + inEvent.offsetX + '|' + inEvent.offsetY + ')');
        console.log ('event.page     : (' + inEvent.pageX + '|' + inEvent.pageY + ')');
        console.log ('event.screen   : (' + inEvent.screenX + '|' + inEvent.screenY + ')');
        console.log ('event.xy       : (' + inEvent.x + '|' + inEvent.y + ')');
    };

    private getMouseTarget(inEvent : MouseEvent) : ['node' | 'arc' | 'else', number] {
        inEvent.preventDefault();
        const target = inEvent.target;
        if (target instanceof SVGElement) {
            const targetId : string | null = target.getAttribute('id');
            if (targetId !== null) {
                const svgId : string[]  = targetId.split('_');
                if (svgId[0] === 'support' || svgId[0] === 'event' || svgId[0] === 'place' || svgId[0] === 'transition') {
                    /* to be removed - start */
                    console.log('display-component found target: node (' + svgId[0] + ')');
                    /* to be removed - end */
                    return ['node', parseInt(svgId[1])];
                } else if (svgId[0] === 'arc') {
                    /* to be removed - start */
                    console.log('display-component found target: arc');
                    /* to be removed - end */
                    return ['arc', parseInt(svgId[1])];
                }
            }
        }
        /* to be removed - start */
        console.log('display-component found target: neither node nor arc');
        /* to be removed - end */
        return ['else', 0];
    };

    private async checkMouseHover(inNode : Node) {
        /* to be removed - start*/
        // console.log('checking node ' + inNode.id);
        // console.log('[hoverActive : "' + inNode.isHoverActive + '", hoverCancelled : "' + inNode.wasHoverCancelled + '"');
        /* to be removed - end*/
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (inNode.isHoverActive) {
            /* to be removed - start*/
            // console.log('hover was active');
            /* to be removed - end*/
            if (inNode.wasHoverCancelled) {
                /* to be removed - start*/
                // console.log('hover was cancelled');
                /* to be removed - end*/
                inNode.hoverActive = false;
                /* to be removed - start*/
                // console.log(' >> check action set hover to "false" for Node ' + inNode.id);
                /* to be removed - end*/
                inNode.hoverCancelled = false;
                /* to be removed - start*/
                // console.log(' >> check action set cancel to "false" for Node ' + inNode.id);
                /* to be removed - end*/
            } else {
                /* to be removed - start*/
                // console.log('hover still active');
                /* to be removed - end*/
                this.activeInfo = inNode;
                this.activeInfo.infoActive = true;
                this.infoActive = true;
                /* to be removed - start*/
                // console.log(' >> check action set info to "true" for Node ' + this.activeInfo.id);
                /* to be removed - end*/
                inNode.hoverActive = false;
                inNode.hoverCancelled = false;
                /* to be removed - start*/
                // console.log(' >> check action set hover & cancel to "false" for Node ' + inNode.id);
                /* to be removed - end*/
                this.redraw();
            }
        } else {
            /* active hover was overwritten by old check --> case is ignored, move mouse to fix */
            /* to be removed - start*/
            console.log('hover was overwritten (move mouse onto node again to fix)');
            /* to be removed - end*/
        }
        /* to be removed - start*/
        // console.log('[hoverActive : "' + inNode.isHoverActive + '", hoverCancelled : "' + inNode.wasHoverCancelled + '"');
        /* to be removed - end*/
    };

    public processMouseEvent(inEvent : MouseEvent) : void {
        /* to be removed - start */
        // console.log('display-component processes MouseEvent');
        /* to be removed - end */
        inEvent.preventDefault();
        this.redraw();
    };

    public processMouseEnter(inEvent : MouseEvent) {
        /* to be removed - start */
        // console.log('display-component processes MouseEnter');
        /* to be removed - end */
        inEvent.preventDefault();
    };

    public processMouseDown(inEvent : MouseEvent) {
        /* to be removed - start */
        // console.log('display-component processes MouseDown');
        /* to be removed - end */
        inEvent.preventDefault();
        let redrawNeeded : boolean = false;
        const targetInfo : ['node' | 'arc' | 'else', number] = this.getMouseTarget(inEvent);
        switch (targetInfo[0]) {
            case 'node' : {
                if (this.nodeActive) {
                    if (this.activeNode !== undefined) {
                        if (this.activeNode !== this.getNode(targetInfo[1])) {
                            if (this.infoActive) {
                                if (this.activeInfo !== undefined) {
                                    /* to be removed - start*/
                                    // console.log(' >> down action will set info to "false" for Node ' + this.activeInfo.id);
                                    /* to be removed - end*/
                                    this.activeInfo.infoActive = false;
                                    this.activeInfo = undefined;
                                    this.infoActive = false;
                                } else {
                                    throw new Error('#cmp.dsp.pmd.000: ' + 'deactivation of info failed - affiliated node is undefined');
                                };
                            } else if (this.activeNode.isHoverActive) {
                                this.activeNode.hoverCancelled = true;
                                /* to be removed - start*/
                                // console.log(' >> down action set cancel to "true" for Node ' + this.activeNode.id);
                                /* to be removed - end*/
                            };
                            this.activeNode.active = false;
                            this.activeNode = this.getNode(targetInfo[1]);
                            this.activeNode.active = true;
                            this.activeNode.visited = true;
                            this.activeNode.hoverActive = true;
                            /* to be removed - start*/
                            // console.log(' >> down action set hover to "true" for Node ' + this.activeNode.id);
                            /* to be removed - end*/
                            this.checkMouseHover(this.activeNode);
                            redrawNeeded = true;
                        };
                    } else {
                        throw new Error('#cmp.dsp.pmd.001: ' + 'deactivation of node failed - node is undefined');
                    };
                } else {
                    if (this.arcActive) {
                        if (this.activeArc !== undefined) {
                            this.activeArc[4] = false;
                            this.activeArc = undefined;
                            this.arcActive = false;
                        } else {
                            throw new Error('#cmp.dsp.pmd.002: ' + 'deactivation of arc failed - arc is undefined');
                        };
                    };
                    this.nodeActive = true;
                    this.activeNode = this.getNode(targetInfo[1]);
                    this.activeNode.active = true;
                    this.activeNode.visited = true;
                    this.activeNode.hoverActive = true;
                    /* to be removed - start*/
                    // console.log(' >> down action set hover to "true" for Node ' + this.activeNode.id);
                    /* to be removed - end*/
                    this.checkMouseHover(this.activeNode);
                    redrawNeeded = true;
                };
                this.nodeHeld = true;
                this.heldNode = this.activeNode;
                break;
            }
            case 'arc' : {
                if (this.arcActive) {
                    if (this.activeArc !== undefined) {
                        if (this.activeArc !== this.getArc(targetInfo[1])) {
                            this.activeArc[4] = false;
                            this.activeArc = this.getArc(targetInfo[1]);
                            this.activeArc[4] = true;
                            redrawNeeded = true;
                        };
                    } else {
                        throw new Error('#cmp.dsp.pmd.003: ' + 'deactivation of arc failed - arc is undefined');
                    };
                } else {
                    if (this.nodeActive) {
                        if (this.activeNode !== undefined) {
                            if (this.infoActive) {
                                if (this.activeInfo !== undefined) {
                                    /* to be removed - start*/
                                    // console.log(' >> down action will set info to "false" for Node ' + this.activeInfo.id);
                                    /* to be removed - end*/
                                    this.activeInfo.infoActive = false;
                                    this.activeInfo = undefined;
                                    this.infoActive = false;
                                } else {
                                    throw new Error('#cmp.dsp.pmd.004: ' + 'deactivation of info failed - affiliated node is undefined');
                                };
                            } else if (this.activeNode.isHoverActive) {
                                this.activeNode.hoverCancelled = true;
                                /* to be removed - start*/
                                // console.log(' >> down action set cancel to "true" for Node ' + this.activeNode.id);
                                /* to be removed - end*/
                            };
                            this.activeNode.active = false;
                            this.activeNode = undefined;
                            this.nodeActive = false;
                        } else {
                            throw new Error('#cmp.dsp.pmd.005: ' + 'deactivation of node failed - node is undefined');
                        };
                    };
                    this.arcActive = true;
                    this.activeArc = this.getArc(targetInfo[1]);
                    this.activeArc[4] = true;
                    redrawNeeded = true;
                };
                break;
            }
            case 'else' : {
                if (this.nodeActive) {
                    if (this.activeNode !== undefined) {
                        if (this.infoActive) {
                            if (this.activeInfo !== undefined) {
                                /* to be removed - start*/
                                // console.log(' >> down action will set info to "false" for Node ' + this.activeInfo.id);
                                /* to be removed - end*/
                                this.activeInfo.infoActive = false;
                                this.activeInfo = undefined;
                                this.infoActive = false;
                            } else {
                                throw new Error('#cmp.dsp.pmd.006: ' + 'deactivation of info failed - affiliated node is undefined');
                            };
                        } else if (this.activeNode.isHoverActive) {
                            this.activeNode.hoverCancelled = true;
                            /* to be removed - start*/
                            // console.log(' >> down action set cancel to "true" for Node ' + this.activeNode.id);
                            /* to be removed - end*/
                        };
                        this.activeNode.active = false;
                        this.activeNode = undefined;
                        this.nodeActive = false;
                    } else {
                        throw new Error('#cmp.dsp.pmd.007: ' + 'deactivation of node failed - node is undefined');
                    };
                    redrawNeeded = true;
                } else if (this.arcActive) {
                    if (this.activeArc !== undefined) {
                        this.activeArc[4] = false;
                        this.activeArc = undefined;
                        this.arcActive = false;
                    } else {
                        throw new Error('#cmp.dsp.pmd.008: ' + 'deactivation of arc failed - arc is undefined');
                    };
                    redrawNeeded = true;
                };
                break;
            }
        };
        if (redrawNeeded) {
            this.redraw();
        };
        if (!(this.nodeHeld)) {
            this.cutActive = true;
            this.startCut(inEvent);
        };
    };

    public processMouseMove(inEvent : MouseEvent) {
        /* to be removed - start */
        // console.log('display-component processes MouseMove');
        /* to be removed - end */
        inEvent.preventDefault();
        let redrawNeeded : boolean = false;
        if (this.nodeHeld) {
            this.dragInProgress = true;
            this.draggedNode = this.heldNode;
            if (this.draggedNode !== undefined) {
                this.draggedNode.x = inEvent.offsetX;
                this.draggedNode.y = inEvent.offsetY;
            } else {
                throw new Error('#cmp.dsp.pmm.000: ' + 'drag of node failed - node is undefined');
            };
            redrawNeeded = true;
        } else {
            if (this.cutActive) {
                this.drawCut(inEvent);
            } else {
                const targetInfo : ['node' | 'arc' | 'else', number] = this.getMouseTarget(inEvent);
                switch (targetInfo[0]) {
                    case 'node' : {
                        if (this.nodeActive) {
                            if (this.activeNode !== undefined) {
                                if (this.activeNode !== this.getNode(targetInfo[1])) {
                                    if (this.infoActive) {
                                        if (this.activeInfo !== undefined) {
                                            /* to be removed - start*/
                                            // console.log(' >> move action will set info to "false" for Node ' + this.activeInfo.id);
                                            /* to be removed - end*/
                                            this.activeInfo.infoActive = false;
                                            this.activeInfo = undefined;
                                            this.infoActive = false;
                                        } else {
                                            throw new Error('#cmp.dsp.pmm.001: ' + 'deactivation of info failed - affiliated node is undefined');
                                        };
                                    } else if (this.activeNode.isHoverActive) {
                                        this.activeNode.hoverCancelled = true;
                                        /* to be removed - start*/
                                        // console.log(' >> move action set cancel to "true" for Node ' + this.activeNode.id);
                                        /* to be removed - end*/
                                    };
                                    this.activeNode.active = false;
                                    this.activeNode = this.getNode(targetInfo[1]);
                                    this.activeNode.active = true;
                                    this.activeNode.visited = true;
                                    this.activeNode.hoverActive = true;
                                    /* to be removed - start*/
                                    // console.log(' >> move action set hover to "true" for Node ' + this.activeNode.id);
                                    /* to be removed - end*/
                                    this.checkMouseHover(this.activeNode);
                                    redrawNeeded = true;
                                };
                            } else {
                                throw new Error('#cmp.dsp.pmm.002: ' + 'deactivation of node failed - node is undefined');
                            };
                        } else {
                            if (this.arcActive) {
                                if (this.activeArc !== undefined) {
                                    this.activeArc[4] = false;
                                    this.activeArc = undefined;
                                    this.arcActive = false;
                                } else {
                                    throw new Error('#cmp.dsp.pmm.003: ' + 'deactivation of arc failed - arc is undefined');
                                };
                            };
                            this.nodeActive = true;
                            this.activeNode = this.getNode(targetInfo[1]);
                            this.activeNode.active = true;
                            this.activeNode.visited = true;
                            this.activeNode.hoverActive = true;
                            /* to be removed - start*/
                            // console.log(' >> move action set hover to "true" for Node ' + this.activeNode.id);
                            /* to be removed - end*/
                            this.checkMouseHover(this.activeNode);
                            redrawNeeded = true;
                        };
                        break;
                    }
                    case 'arc' : {
                        if (this.arcActive) {
                            if (this.activeArc !== undefined) {
                                if (this.activeArc !== this.getArc(targetInfo[1])) {
                                    this.activeArc[4] = false;
                                    this.activeArc = this.getArc(targetInfo[1]);
                                    this.activeArc[4] = true;
                                    redrawNeeded = true;
                                };
                            } else {
                                throw new Error('#cmp.dsp.pmm.004: ' + 'deactivation of arc failed - arc is undefined');
                            };
                        } else {
                            if (this.nodeActive) {
                                if (this.activeNode !== undefined) {
                                    if (this.infoActive) {
                                        if (this.activeInfo !== undefined) {
                                            /* to be removed - start*/
                                            // console.log(' >> move action will set info to "false" for Node ' + this.activeInfo.id);
                                            /* to be removed - end*/
                                            this.activeInfo.infoActive = false;
                                            this.activeInfo = undefined;
                                            this.infoActive = false;
                                        } else {
                                            throw new Error('#cmp.dsp.pmm.005: ' + 'deactivation of info failed - affiliated node is undefined');
                                        };
                                    } else if (this.activeNode.isHoverActive) {
                                        this.activeNode.hoverCancelled = true;
                                        /* to be removed - start*/
                                        // console.log(' >> move action set cancel to "true" for Node ' + this.activeNode.id);
                                        /* to be removed - end*/
                                    };
                                    this.activeNode.active = false;
                                    this.activeNode = undefined;
                                    this.nodeActive = false;
                                } else {
                                    throw new Error('#cmp.dsp.pmm.006: ' + 'deactivation of node failed - node is undefined');
                                };
                            };
                            this.arcActive = true;
                            this.activeArc = this.getArc(targetInfo[1]);
                            this.activeArc[4] = true;
                            redrawNeeded = true;
                        };
                        break;
                    }
                    case 'else' : {
                        if (this.nodeActive) {
                            if (this.activeNode !== undefined) {
                                if (this.infoActive) {
                                    if (this.activeInfo !== undefined) {
                                        /* to be removed - start*/
                                        // console.log(' >> move action will set info to "false" for Node ' + this.activeInfo.id);
                                        /* to be removed - end*/
                                        this.activeInfo.infoActive = false;
                                        this.activeInfo = undefined;
                                        this.infoActive = false;
                                    } else {
                                        throw new Error('#cmp.dsp.pmm.008: ' + 'deactivation of info failed - affiliated node is undefined');
                                    };
                                } else if (this.activeNode.isHoverActive) {
                                    this.activeNode.hoverCancelled = true;
                                    /* to be removed - start*/
                                    // console.log(' >> move action set cancel to "true" for Node ' + this.activeNode.id);
                                    /* to be removed - end*/
                                };
                                this.activeNode.active = false;
                                this.activeNode = undefined;
                                this.nodeActive = false;
                            } else {
                                throw new Error('#cmp.dsp.pmm.009: ' + 'deactivation of node failed - node is undefined');
                            };
                            redrawNeeded = true;
                        } else if (this.arcActive) {
                            if (this.activeArc !== undefined) {
                                this.activeArc[4] = false;
                                this.activeArc = undefined;
                                this.arcActive = false;
                            } else {
                                throw new Error('#cmp.dsp.pmm.010: ' + 'deactivation of arc failed - arc is undefined');
                            };
                            redrawNeeded = true;
                        };
                        break;
                    }
                };
            };
        };
        if (redrawNeeded) {
            this.redraw();
        };
    };

    public processMouseUp(inEvent : MouseEvent) {
        /* to be removed - start */
        // console.log('display-component processes MouseUp');
        /* to be removed - end */
        inEvent.preventDefault();
        if (this.nodeHeld) {
            if (this.dragInProgress) {
                this.dragInProgress = false;
                this.draggedNode = undefined;
            } else {
                if (this.heldNode !== undefined) {
                    this.heldNode.marked = !(this.heldNode.isMarked);
                } else {
                    throw new Error('#cmp.dsp.pmu.000: ' + 'click of node failed - node is undefined');
                };
            };
            this.nodeHeld = false;
            this.heldNode = undefined;
            this.redraw();
        } else if (this.cutActive) {
            this.endCut(inEvent);
            this.cutActive = false;
        };
    };

    public processMouseLeave(inEvent : MouseEvent) {
        /* to be removed - start */
        // console.log('display-component processes MouseLeave');
        /* to be removed - end */
        inEvent.preventDefault();
        if (this.nodeActive) {
            if (this.nodeHeld) {
                if (this.dragInProgress) {
                    this.draggedNode = undefined;
                    this.dragInProgress = false;
                }
                this.heldNode = undefined;
                this.nodeHeld = false;
            };
            if (this.activeNode !== undefined) {
                if (this.infoActive) {
                    if (this.activeInfo !== undefined) {
                        /* to be removed - start*/
                        // console.log(' >> leave action will set info to "false" for Node ' + this.activeInfo.id)
                        /* to be removed - end*/
                        this.activeInfo.infoActive = false;
                        this.activeInfo = undefined;
                        this.infoActive = false;
                    } else {
                        throw new Error('#cmp.dsp.pml.000: ' + 'deactivation of info failed - affiliated node is undefined');
                    };
                } else if (this.activeNode.isHoverActive) {
                    this.activeNode.hoverCancelled = true;
                    /* to be removed - start*/
                    // console.log(' >> leave action set cancel to "true" for Node ' + this.activeNode.id);
                    /* to be removed - end*/
                };
                this.activeNode.active = false;
            } else {
                throw new Error('#cmp.dsp.pml.001: ' + 'deactivation of node failed - node is undefined');
            };
            this.activeNode = undefined;
            this.nodeActive = false;
            this.redraw();
        };
        if (this.cutActive) {
            this.endCut(inEvent);
            this.cutActive = false;
        };
    };

    public prevent(inEvent: DragEvent): void {
        // dragover must be prevented for drop to work
        inEvent.preventDefault();
    };

    public startCut(inEvent: MouseEvent): void {
        this.activeCut = new Cut(inEvent.offsetX, inEvent.offsetY, true);
    };

    public drawCut(inEvent: MouseEvent): void {
        if (!this.activeCut?.isDrawing) return;
        const cutLine = this._svgService.createSvgCut(this.activeCut.tempX, this.activeCut.tempY, inEvent.offsetX, inEvent.offsetY);
        this.activeCut.tempCutLines.push({ x1: this.activeCut.tempX, y1: this.activeCut.tempY, x2: inEvent.offsetX, y2: inEvent.offsetY });
        this.drawingArea?.nativeElement.appendChild(cutLine);
        this.activeCut.tempX = inEvent.offsetX;
        this.activeCut.tempY = inEvent.offsetY;
    };

    public endCut(inEvent: MouseEvent): void {
        if (!this.activeCut?.isDrawing) return;
        this.activeCut.isDrawing = false;
        if (this._graph?.arcs) {
            for (const arc of this._graph.arcs) {
                const existingLine = { x1: arc[0].x, y1: arc[0].y, x2: arc[1].x, y2: arc[1].y };
                for (const cutLine of this.activeCut.tempCutLines) {
                    if (this.activeCut.cutArcs.some(cutArc => cutArc[0].id == arc[0].id && cutArc[1].id == arc[1].id)) {
                        continue;
                    };
                    if (this.activeCut.checkIntersection(cutLine, existingLine)) {
                        this.activeCut.cutArcs.push(arc);
                    };
                };
            };
            // TODO - call inductive miner here
            if (this.activeCut.cutArcs.length > 0) {
                console.log('Folgende Kanten wurden geschnitten: ')
                this.activeCut.cutArcs.forEach(
                    cutArc => {
                        cutArc[4] = true;
                        console.log(cutArc);
                    }
                );
                this.redraw();
            };
            this.activeCut.removeCutSvgs(this.drawingArea?.nativeElement)
            this.activeCut = undefined;
        };
    };

    private fetchFile(inLink: string): void {
        this._http.get(
            inLink,
            { responseType: 'text' }
        ).pipe(
            catchError(
                error => {
                    console.error('Error while fetching file from link', inLink, error);
                    return of(undefined);
                }
            ),
            take(1)
        ).subscribe(
            fileContent => {
                const fileType: string | undefined = inLink.split('.').pop();
                if (fileType !== undefined) {
                    this.emitFileData(fileType, fileContent);
                    /* to be removed - start */
                    console.log();
                    console.log('"fetchFile" prompted emit of type "' + fileType + /*'" and content "' + fileContent +*/ '" for link "' + inLink + '"');
                    console.log();
                    /* to be removed - start */
                } else {
                    throw new Error('#cmp.dsp.ftf.000: ' + 'fetching file failed - filetype was assigned "undefined"');
                }
            }
        )
    };

    private readFile(files: FileList | undefined | null) : void {
        if (files === undefined || files === null || files.length === 0) {
            /* to be removed - start */
            console.log();
            console.log('"readFile" could not detect file');
            console.log();
            /* to be removed - start */
            return;
        }
        /* to be removed - start */
        console.log();
        console.log('"readFile" detected file "' + files[0] + '" with name "' + files[0].name + '"');
        console.log();
        /* to be removed - start */
        const fileType : string | undefined = files[0].name.split('.').pop();
        if (fileType !== undefined) {
            this._fileReaderService.readFile(files[0]).pipe(take(1)).subscribe(
                fileContent => {
                    this.emitFileData(fileType, fileContent);
                    /* to be removed - start */
                    console.log();
                    console.log('"readFile" prompted emit of type "' + fileType + /*'" and content "' + fileContent +*/ '" for link "' + files[0] + '"');
                    console.log();
                    /* to be removed - start */
                }
            );
        } else {
            throw new Error('#cmp.dsp.rdf.000: ' + 'reading file failed - filetype was assigned "undefined"');
        }
    };

    private emitFileData(inFileType: string | undefined, inFileContent: string | undefined): void {
        if (inFileType === undefined || inFileContent === undefined) {
            return;
        }
        this.fileData.emit([inFileType, inFileContent]);
    };

    private redraw() : void {
        this._displayService.updateData(this._graph, this._log);
    };

    private draw() : void {
        if (this.drawingArea === undefined) {
            console.debug('drawing area not ready yet')
            return;
        };
        this.clearDrawingArea();
        const arcs: SVGElement[] = this._svgService.createSvgArcs(this._graph);
        for (const arc of arcs) {
            this.drawingArea.nativeElement.appendChild(arc);
        };
        const nodes: SVGElement[] = this._svgService.createSvgNodes(this._graph);
        for (const node of nodes) {
            this.drawingArea.nativeElement.appendChild(node);
        };
        const infos : SVGElement[] = this._svgService.createSvgInfos(this._graph);
        for (const info of infos) {
            this.drawingArea.nativeElement.appendChild(info);
        };
        if (!(this.dragInProgress)) {
            /* for improving performance, trace-elements are not loaded while a node is being dragged around the canvas,
                they are rendered again after the drag has ended */
            const traces : SVGElement[] = this._svgService.createSvgTraces(this._graph, this._log, this._max);
            for (const trace of traces) {
                this.drawingArea.nativeElement.appendChild(trace);
            };
        };
    };

    private clearDrawingArea(): void {
        const drawingArea = this.drawingArea?.nativeElement;
        if (drawingArea?.childElementCount === undefined) {
            return;
        }
        while (drawingArea.childElementCount > 0) {
            drawingArea.removeChild(drawingArea.lastChild as ChildNode);
        }
    };

}
