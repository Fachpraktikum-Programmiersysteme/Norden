import {Component, ElementRef, EventEmitter, HostListener, OnDestroy, Output, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";

import {catchError, of, Subscription, take} from 'rxjs';

import {FileReaderService} from "../../services/file-reader.service";
import {DisplayService} from '../../services/display.service';
import {SvgService} from '../../services/svg.service';

import {ExampleFileComponent} from "../example-file/example-file.component";

import {SpringEmbedderAlgorithm} from "../../classes/display/spring-embedder.algorithm";
import {SettingsSingleton} from "../../classes/settings/settings.singleton";
import {Graph} from '../../classes/graph-representation/graph';
import {Node} from '../../classes/graph-representation/node';
import {Arc} from '../../classes/graph-representation/arc';
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

    @HostListener("window:keyup", ['$event'])
        onKeyUp(event:KeyboardEvent) {
            this.processKeyPress(event);
        };

    /* attributes */

    private _sub: Subscription;

    private _graph : Graph = new Graph();

    private arcActive : boolean = false;
    private activeArc : Arc | undefined;

    private arcHeld : boolean = false;
    private heldArc : Arc | undefined;

    private nodeActive : boolean = false;
    private activeNode : Node | undefined;

    private nodeHeld : boolean = false;
    private heldNode : Node | undefined;

    private dragInProgress : boolean = false;
    private draggedNode : Node | undefined;

    private infoActive : boolean = false;
    private activeInfo : Node | undefined;

    private cutActive: boolean = false;
    private activeCut: Cut | undefined;

    /* methods - constructor */

    public constructor(
        private _svgService: SvgService,
        private _displayService: DisplayService,
        private _fileReaderService: FileReaderService,
        private _renderAlgorithm: SpringEmbedderAlgorithm,
        private _settings: SettingsSingleton,
        private _http: HttpClient
    ) {
        this.fileData = new EventEmitter<[string, string]>();
        this._sub = this._displayService.graph$.subscribe(
            graph => {
                this._graph = this._displayService.graph;
                this.draw();
            }
        );
    };

    /* methods - on destroy */

    ngOnDestroy() : void {
        this._sub.unsubscribe();
        this.fileData.complete();
    };

    /* methods - other */

    private getNode(inId : number) : Node {
        const node : Node |undefined = this._graph.nodes[inId];
        if (node !== undefined) {
            return node;
        } else {
            throw new Error('#cmp.dsp.pmm.000: ' + 'node retrieval failed - node with given id is undefined');
        }
    };

    private getArc(inPos : number) : Arc {
            return this._graph.arcs[inPos];
    };

    private getMousePosition(inEvent : MouseEvent) : void {
        inEvent.preventDefault();
    };

    private getMouseTarget(inEvent : MouseEvent) : ['node' | 'arc' | 'else', number] {
        inEvent.preventDefault();
        const target = inEvent.target;
        if (target instanceof SVGElement) {
            const targetId : string | null = target.getAttribute('id');
            if (targetId !== null) {
                const svgId : string[]  = targetId.split('_');
                if (svgId[0] === 'support' || svgId[0] === 'event' || svgId[0] === 'place' || svgId[0] === 'transition') {
                    return ['node', parseInt(svgId[1])];
                } else if (svgId[0] === 'arc') {
                    return ['arc', parseInt(svgId[1])];
                };
            };
        };
        return ['else', 0];
    };

    private async checkMouseHover(inNode : Node) {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (inNode.hoverActive) {
            if (inNode.hoverCancelled) {
                inNode.hoverActive = false;
                inNode.hoverCancelled = false;
            } else {
                this.activeInfo = inNode;
                this.activeInfo.infoActive = true;
                this.infoActive = true;
                inNode.hoverActive = false;
                inNode.hoverCancelled = false;
                this.update();
            }
        } else {
        }
    };

    public processMouseEvent(inEvent : MouseEvent) : void {
        inEvent.preventDefault();
    };

    public processMouseEnter(inEvent : MouseEvent) {
        inEvent.preventDefault();
    };

    public processMouseDown(inEvent : MouseEvent) {
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
                                    this.activeInfo.infoActive = false;
                                    this.activeInfo = undefined;
                                    this.infoActive = false;
                                } else {
                                    throw new Error('#cmp.dsp.pmd.000: ' + 'deactivation of info failed - affiliated node is undefined');
                                };
                            } else if (this.activeNode.hoverActive) {
                                this.activeNode.hoverCancelled = true;
                            };
                            this.activeNode.active = false;
                            this.activeNode = this.getNode(targetInfo[1]);
                            this.activeNode.active = true;
                            this.activeNode.visited = true;
                            this.activeNode.hoverActive = true;
                            this.checkMouseHover(this.activeNode);
                            redrawNeeded = true;
                        };
                    } else {
                        throw new Error('#cmp.dsp.pmd.001: ' + 'deactivation of node failed - node is undefined');
                    };
                } else {
                    if (this.arcActive) {
                        if (this.activeArc !== undefined) {
                            this.activeArc.active = false;
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
                            this.activeArc.active = false;
                            this.activeArc = this.getArc(targetInfo[1]);
                            this.activeArc.active = true;
                            this.activeArc.visited = true;
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
                                    this.activeInfo.infoActive = false;
                                    this.activeInfo = undefined;
                                    this.infoActive = false;
                                } else {
                                    throw new Error('#cmp.dsp.pmd.004: ' + 'deactivation of info failed - affiliated node is undefined');
                                };
                            } else if (this.activeNode.hoverActive) {
                                this.activeNode.hoverCancelled = true;
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
                    this.activeArc.active = true;
                    this.activeArc.visited = true;
                    redrawNeeded = true;
                };
                this.arcHeld = true;
                this.heldArc = this.activeArc;
                break;
            }
            case 'else' : {
                if (this.nodeActive) {
                    if (this.activeNode !== undefined) {
                        if (this.infoActive) {
                            if (this.activeInfo !== undefined) {
                                this.activeInfo.infoActive = false;
                                this.activeInfo = undefined;
                                this.infoActive = false;
                            } else {
                                throw new Error('#cmp.dsp.pmd.006: ' + 'deactivation of info failed - affiliated node is undefined');
                            };
                        } else if (this.activeNode.hoverActive) {
                            this.activeNode.hoverCancelled = true;
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
                        this.activeArc.active = false;
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
            this.update();
        };
        if (!(this.nodeHeld || this.arcHeld)) {
            this.cutActive = true;
            this.startCut(inEvent);
        };
    };

    public processMouseMove(inEvent : MouseEvent) {
        inEvent.preventDefault();
        let redrawNeeded : boolean = false;
        if (this.nodeHeld) {
            this.dragInProgress = true;
            this.draggedNode = this.heldNode;
            if (this.draggedNode !== undefined) {
                this.draggedNode.x = inEvent.offsetX;
                this.draggedNode.y = inEvent.offsetY;
                //
                /* do not remove - alternative implementation */
                //
                // const nodeX : number = this.draggedNode.x;
                // const nodeY : number = this.draggedNode.y;
                // const mouseX : number = inEvent.offsetX;
                // const mouseY : number = inEvent.offsetY;
                // const radiusH : number = (this._svgService.nodeRadius / 2);
                // if (mouseX < (nodeX - radiusH)) {
                //     this.draggedNode.x = inEvent.offsetX;
                //     this.draggedNode.y = inEvent.offsetY;
                // } else if (mouseX > (nodeX + radiusH)) {
                //     this.draggedNode.x = inEvent.offsetX;
                //     this.draggedNode.y = inEvent.offsetY;
                // } else if (mouseY < (nodeY - radiusH)) {
                //     this.draggedNode.x = inEvent.offsetX;
                //     this.draggedNode.y = inEvent.offsetY;
                // } else if (mouseY > (nodeY + radiusH)) {
                //     this.draggedNode.x = inEvent.offsetX;
                //     this.draggedNode.y = inEvent.offsetY;
                // } else {
                //     /* node is only dragged a minimal amount --> "drag" is probably a "click" --> ignore "drag" */
                // };
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
                                            this.activeInfo.infoActive = false;
                                            this.activeInfo = undefined;
                                            this.infoActive = false;
                                        } else {
                                            throw new Error('#cmp.dsp.pmm.001: ' + 'deactivation of info failed - affiliated node is undefined');
                                        };
                                    } else if (this.activeNode.hoverActive) {
                                        this.activeNode.hoverCancelled = true;
                                    };
                                    this.activeNode.active = false;
                                    this.activeNode = this.getNode(targetInfo[1]);
                                    this.activeNode.active = true;
                                    this.activeNode.visited = true;
                                    this.activeNode.hoverActive = true;
                                    this.checkMouseHover(this.activeNode);
                                    redrawNeeded = true;
                                };
                            } else {
                                throw new Error('#cmp.dsp.pmm.002: ' + 'deactivation of node failed - node is undefined');
                            };
                        } else {
                            if (this.arcActive) {
                                if (this.arcHeld) {
                                    this.heldArc = undefined;
                                    this.arcHeld = false;
                                };
                                if (this.activeArc !== undefined) {
                                    this.activeArc.active = false;
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
                            this.checkMouseHover(this.activeNode);
                            redrawNeeded = true;
                        };
                        break;
                    }
                    case 'arc' : {
                        if (this.arcActive) {
                            if (this.activeArc !== undefined) {
                                if (this.activeArc !== this.getArc(targetInfo[1])) {
                                    if (this.arcHeld) {
                                        this.heldArc = undefined;
                                        this.arcHeld = false;
                                    };
                                    this.activeArc.active = false;
                                    this.activeArc = this.getArc(targetInfo[1]);
                                    this.activeArc.active = true;
                                    this.activeArc.visited = true;
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
                                            this.activeInfo.infoActive = false;
                                            this.activeInfo = undefined;
                                            this.infoActive = false;
                                        } else {
                                            throw new Error('#cmp.dsp.pmm.005: ' + 'deactivation of info failed - affiliated node is undefined');
                                        };
                                    } else if (this.activeNode.hoverActive) {
                                        this.activeNode.hoverCancelled = true;
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
                            this.activeArc.active = true;
                            this.activeArc.visited = true;
                            redrawNeeded = true;
                        };
                        break;
                    }
                    case 'else' : {
                        if (this.nodeActive) {
                            if (this.activeNode !== undefined) {
                                if (this.infoActive) {
                                    if (this.activeInfo !== undefined) {
                                        this.activeInfo.infoActive = false;
                                        this.activeInfo = undefined;
                                        this.infoActive = false;
                                    } else {
                                        throw new Error('#cmp.dsp.pmm.008: ' + 'deactivation of info failed - affiliated node is undefined');
                                    };
                                } else if (this.activeNode.hoverActive) {
                                    this.activeNode.hoverCancelled = true;
                                };
                                this.activeNode.active = false;
                                this.activeNode = undefined;
                                this.nodeActive = false;
                            } else {
                                throw new Error('#cmp.dsp.pmm.009: ' + 'deactivation of node failed - node is undefined');
                            };
                            redrawNeeded = true;
                        } else if (this.arcActive) {
                            if (this.arcHeld) {
                                this.heldArc = undefined;
                                this.arcHeld = false;
                            };
                            if (this.activeArc !== undefined) {
                                this.activeArc.active = false;
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
            this.update();
        };
    };

    public processMouseUp(inEvent : MouseEvent) {
        inEvent.preventDefault();
        if (this.nodeHeld) {
            if (this.dragInProgress) {
                this.dragInProgress = false;
                this.draggedNode = undefined;
            } else {
                if (this.heldNode !== undefined) {
                    this._graph.setElementMarkedFlag(this.heldNode, (!(this.heldNode.marked)))
                } else {
                    throw new Error('#cmp.dsp.pmu.000: ' + 'click of node failed - clicked node is undefined');
                };
            };
            this.heldNode = undefined;
            this.nodeHeld = false;
            this.update();
        } else if (this.arcHeld) {
            if (this.heldArc !== undefined) {
                this._graph.setElementMarkedFlag(this.heldArc, (!(this.heldArc.marked)))
            } else {
                throw new Error('#cmp.dsp.pmu.001: ' + 'click of arc failed - clicked arc is undefined');
            };
            this.heldArc.overrideMarking = true;
            this.update();
            this.heldArc.overrideMarking = false;
            this.heldArc = undefined;
            this.arcHeld = false;
        } else if (this.cutActive) {
            this.endCut(inEvent);
            this.cutActive = false;
        };
    };

    public processMouseLeave(inEvent : MouseEvent) {
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
            if (this.arcHeld) {
                this.heldArc = undefined;
                this.arcHeld = false;
            };
            if (this.activeNode !== undefined) {
                if (this.infoActive) {
                    if (this.activeInfo !== undefined) {
                        this.activeInfo.infoActive = false;
                        this.activeInfo = undefined;
                        this.infoActive = false;
                    } else {
                        throw new Error('#cmp.dsp.pml.000: ' + 'deactivation of info failed - affiliated node is undefined');
                    };
                } else if (this.activeNode.hoverActive) {
                    this.activeNode.hoverCancelled = true;
                };
                this.activeNode.active = false;
            } else {
                throw new Error('#cmp.dsp.pml.001: ' + 'deactivation of node failed - node is undefined');
            };
            this.activeNode = undefined;
            this.nodeActive = false;
            this.update();
        };
        if (this.cutActive) {
            this.endCut(inEvent);
            this.cutActive = false;
        };
    };

    public processKeyPress(inEvent : KeyboardEvent) {
        inEvent.preventDefault();
        if ((inEvent.key === 'i') || (inEvent.key === 'I')) {
            if (this.nodeActive) {
                if (this.activeNode !== undefined) {
                    this.activeNode.infoOverride = (!(this.activeNode.infoOverride));
                    this.update();
                } else {
                    throw new Error('#cmp.dsp.pkp.000: ' + 'inversion of node info override failed - active node is undefined');
                };
            } else if (this.arcActive) {};
        };
    };

    public processDropEvent(inEvent: DragEvent) : void {
        inEvent.preventDefault();
        const fileLocation = inEvent.dataTransfer?.getData(ExampleFileComponent.META_DATA_CODE);
        if (fileLocation) {
            this.fetchFile(fileLocation);
        } else {
            this.readFile(inEvent.dataTransfer?.files);
        };
        this._settings.updateState({ resetInputForm : true });
    };

    public prevent(inEvent: DragEvent): void {
        /* dragover must be prevented for drop to work */
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
                const existingLine = { x1: arc.sourceX, y1: arc.sourceY, x2: arc.targetX, y2: arc.targetY };
                for (const cutLine of this.activeCut.tempCutLines) {
                    if (this.activeCut.cutArcs.some(cutArc => cutArc.source.id == arc.source.id && cutArc.target.id == arc.target.id)) {
                        continue;
                    };
                    if (this.activeCut.checkIntersection(cutLine, existingLine)) {
                        this.activeCut.cutArcs.push(arc);
                    };
                };
            };
            // TODO - call inductive miner here - No.
            if (this.activeCut.cutArcs.length > 0) {
                this.activeCut.cutArcs.forEach(
                    cutArc => {
                        if (cutArc.marked) {
                            this._graph.setElementMarkedFlag(cutArc, false);
                        } else {
                            this._graph.setElementMarkedFlag(cutArc, true);
                        };
                    }
                );
                this.update();
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
                    console.error('error occurred while fetching file from link', inLink, error);
                    return of(undefined);
                }
            ),
            take(1)
        ).subscribe(
            fileContent => {
                const fileType: string | undefined = inLink.split('.').pop();
                if (fileType !== undefined) {
                    this.emitFileData(fileType, fileContent);
                } else {
                    throw new Error('#cmp.dsp.ftf.000: ' + 'fetching file failed - filetype was assigned "undefined"');
                }
            }
        )
    };

    private readFile(files: FileList | undefined | null) : void {
        if (files === undefined || files === null || files.length === 0) {
            return;
        }
        const fileType : string | undefined = files[0].name.split('.').pop();
        if (fileType !== undefined) {
            this._fileReaderService.readFile(files[0]).pipe(take(1)).subscribe(
                fileContent => {
                    this.emitFileData(fileType, fileContent);
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

    private update() : void {
        this._displayService.updateData(this._graph);
    };

    private draw(): void {
        if (this.drawingArea === undefined) {
            console.debug('drawing area not ready yet');
            return;
        };
        if (!(this._settings.currentState.springEmbedderDisabled)) {
            this._graph = this._renderAlgorithm.applyLayout(this._graph);
            const canvasWidth = this.drawingArea.nativeElement.clientWidth;
            const canvasHeight = this.drawingArea.nativeElement.clientHeight;
            this.resizeGraphToFitCanvas(this._graph, canvasWidth, canvasHeight);
        };
        this.clearDrawingArea();
        const svgLayers : [SVGElement[], SVGElement[], SVGElement[]] = this._svgService.createSvgStatics(this._graph);
        const layerOne : SVGElement[] = svgLayers[0];
        const layerTwo : SVGElement[] = svgLayers[1];
        const layerThr : SVGElement[] = svgLayers[2];
        for (const svg of layerOne) {
            this.drawingArea.nativeElement.appendChild(svg);
        };
        for (const svg of layerTwo) {
            this.drawingArea.nativeElement.appendChild(svg);
        };
        for (const svg of layerThr) {
            this.drawingArea.nativeElement.appendChild(svg);
        };
        if (!(this.dragInProgress)) {
            const svgTraces: SVGElement[] = this._svgService.createSvgTraces(this._graph);
            for (const svg of svgTraces) {
                this.drawingArea.nativeElement.appendChild(svg);
            };
        };
    };

    private clearDrawingArea(): void {
        const drawingArea = this.drawingArea?.nativeElement;
        if (drawingArea?.childElementCount === undefined) {
            return;
        };
        while (drawingArea.childElementCount > 0) {
            drawingArea.removeChild(drawingArea.lastChild as ChildNode);
        };
    };

    private resizeGraphToFitCanvas(graph: Graph, canvasWidth: number, canvasHeight: number): void {
        /* Margin around the graph */
        const margin = 20;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        /* Calculate bounding box of the graph */
        graph.nodes.forEach(
            (node) => {
                if (node) {
                    minX = Math.min(minX, node.x);
                    minY = Math.min(minY, node.y);
                    maxX = Math.max(maxX, node.x);
                    maxY = Math.max(maxY, node.y);
                };
            }
        );
        const graphWidth = maxX - minX;
        const graphHeight = maxY - minY;
        /* Calculate scaling factors to fit graph within canvas */
        const scaleX = (canvasWidth - margin * 2) / graphWidth;
        const scaleY = (canvasHeight - margin * 2) / graphHeight;
        /* Maintain aspect ratio */
        const scale = Math.min(scaleX, scaleY);
        /* Calculate offsets to center the graph in the canvas */
        const offsetX = (canvasWidth - graphWidth * scale) / 2 - minX * scale;
        const offsetY = (canvasHeight - graphHeight * scale) / 2 - minY * scale;
        /* Apply scaling and centering */
        graph.nodes.forEach(
            (node) => {
                if (node) {
                    node.x = Math.floor(node.x * scale + offsetX);
                    node.y = Math.floor(node.y * scale + offsetY);
                };
            }
        );
    };

};