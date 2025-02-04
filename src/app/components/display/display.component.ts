import {
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    OnDestroy,
    AfterViewInit,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { catchError, of, Subscription, take } from 'rxjs';

import { FileReaderService } from "../../services/file-reader.service";
import { DisplayService } from '../../services/display.service';
import { SvgService } from '../../services/svg.service';

import { ExampleFileComponent } from "../example-file/example-file.component";

import { SpringEmbedderAlgorithm } from "../../classes/display/spring-embedder.algorithm";
import { NoLayoutAlgorithm } from "../../classes/display/no-layout.algorithm";
import { LayoutAlgorithmInterface } from "../../classes/display/layout-algorithm.interface";

import { SettingsSingleton } from "../../classes/settings/settings.singleton";
import { Graph } from '../../classes/graph-representation/graph';
import { Node } from '../../classes/graph-representation/node';
import { Arc } from '../../classes/graph-representation/arc';
import { Cut } from '../../classes/graph-representation/cut';

/**
 * Demonstrates real-time spring layout, node dragging, arc interactions, etc.
 */
@Component({
    selector: 'app-display',
    templateUrl: './display.component.html',
    styleUrls: ['./display.component.css']
})
export class DisplayComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('drawingArea') drawingArea: ElementRef<SVGElement> | undefined;

    @Output('fileData') fileData: EventEmitter<[string, string]> = new EventEmitter<[string, string]>();

    @HostListener("window:keyup", ['$event'])
    onKeyUp(event: KeyboardEvent) {
        this.processKeyPress(event);
    }

    // Subscriptions
    private _graphSub: Subscription;      // Subscribed to DisplayService
    private _settingsSub: Subscription | null = null;

    // Keep track of the previous `springEmbedderDisabled` to detect changes
    private prevSpringEmbedderDisabled: boolean;

    // The actual in-memory Graph reference
    private _graph: Graph = new Graph();

    // Animation handle
    private animationFrameId: number | undefined;

    // Node/Arc UI flags
    private arcActive: boolean = false;
    private activeArc: Arc | undefined;

    private arcHeld: boolean = false;
    private heldArc: Arc | undefined;

    private nodeActive: boolean = false;
    private activeNode: Node | undefined;

    private nodeHeld: boolean = false;
    private heldNode: Node | undefined;

    private infoActive: boolean = false;
    private activeInfo: Node | undefined;

    private dragInProgress: boolean = false;
    private draggedNode: Node | undefined;

    private cutActive: boolean = false;
    private activeCut: Cut | undefined;

    constructor(
        private _svgService: SvgService,
        private _displayService: DisplayService,
        private _fileReaderService: FileReaderService,

        private _springEmbedder: SpringEmbedderAlgorithm,
        private _noLayout: NoLayoutAlgorithm,

        private _settings: SettingsSingleton,   // <--- We subscribe to this
        private _http: HttpClient
    ) {
        // 1) Subscribe to graph changes from DisplayService
        this._graphSub = this._displayService.graph$.subscribe(graph => {
            // Update local reference
            this._graph = this._displayService.graph;
            // Redraw
            this.draw();
        });

        // 2) Track the initial springEmbedderDisabled
        this.prevSpringEmbedderDisabled = this._settings.currentState.springEmbedderDisabled;
    }

    // -------------------------------------------------------------
    //  A) Subscribe to Settings changes so we can re-run layout if
    //     springEmbedderDisabled has changed.
    // -------------------------------------------------------------
    public ngOnInit(): void {
        this._settingsSub = this._settings.state$.subscribe(newState => {
            if (newState.springEmbedderDisabled !== this.prevSpringEmbedderDisabled) {
                // If embedder setting changed, re-run layout
                this.onLayoutAlgorithmChanged();
                this.prevSpringEmbedderDisabled = newState.springEmbedderDisabled;
            }
        });
    }

    /**
     * Called after the view (drawingArea, etc.) is initialized.
     * We can now safely get its width/height.
     */
    public ngAfterViewInit(): void {
        // On init, apply the current layout
        this.layoutAlgorithm.applyLayout(this._graph);
        // Then start the incremental animation
        this.startLayoutAnimation();
    }

    /**
     * Make sure to cancel animation & unsub on destroy.
     */
    public ngOnDestroy(): void {
        // unsubscribe from DisplayService
        this._graphSub.unsubscribe();

        // unsubscribe from Settings
        if (this._settingsSub) {
            this._settingsSub.unsubscribe();
        }

        // complete fileData emitter
        this.fileData.complete();

        // stop animation
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    // -------------------------------------------------------------
    //  B) A method to re-apply the chosen layout and restart animation
    // -------------------------------------------------------------
    private onLayoutAlgorithmChanged(): void {
        // Cancel any existing animation
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        // Re-apply layout initialization
        this.layoutAlgorithm.applyLayout(this._graph);
        // Restart animation so the physics can move nodes again
        this.startLayoutAnimation();
    }

    /**
     * Decide which LayoutAlgorithm to use.
     */
    private get layoutAlgorithm(): LayoutAlgorithmInterface {
        if (this._settings.currentState.springEmbedderDisabled) {
            return this._noLayout;
        } else {
            return this._springEmbedder;
        }
    }

    /**
     * Start a requestAnimationFrame loop that repeatedly calls
     * layoutAlgorithm.nextTick(this._graph) and re-draws.
     */
    private startLayoutAnimation(): void {
        const animate = () => {
            // One iteration of the layout
            this.layoutAlgorithm.nextTick(this._graph);

            // Re-render
            this.update();

            // If not stable, request another frame
            if (!this.layoutAlgorithm.isStable(this._graph)) {
                this.animationFrameId = requestAnimationFrame(animate);
            } else {
                console.log('Layout converged / stable enough to stop.');
            }
        };
        // Kick off the first frame
        this.animationFrameId = requestAnimationFrame(animate);
    }

    private getNode(inId: number): Node {
        const node: Node | undefined = this._graph.nodes[inId];
        if (!node) {
            throw new Error('#cmp.dsp.000: node retrieval failed - undefined id=' + inId);
        }
        return node;
    }

    private getArc(inPos: number): Arc {
        return this._graph.arcs[inPos];
    }

    // (The following methods are mostly unchanged from your code)
    // ------------------------------------------------------------------

    private async checkMouseHover(inNode: Node) {
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
        }
    }

    private getMouseTarget(inEvent: MouseEvent): ['node' | 'arc' | 'else', number] {
        inEvent.preventDefault();
        const target = inEvent.target;
        if (target instanceof SVGElement) {
            const targetId: string | null = target.getAttribute('id');
            if (targetId !== null) {
                const svgId: string[] = targetId.split('_');
                if (svgId[0] === 'support' || svgId[0] === 'event' ||
                    svgId[0] === 'place' || svgId[0] === 'transition') {
                    return ['node', parseInt(svgId[1])];
                } else if (svgId[0] === 'arc') {
                    return ['arc', parseInt(svgId[1])];
                }
            }
        }
        return ['else', 0];
    }

    public processMouseEvent(inEvent: MouseEvent): void {
        inEvent.preventDefault();
    }

    public processMouseEnter(inEvent: MouseEvent): void {
        inEvent.preventDefault();
    }

    public processMouseDown(inEvent: MouseEvent) {
        inEvent.preventDefault();
        let redrawNeeded = false;
        const targetInfo: ['node' | 'arc' | 'else', number] = this.getMouseTarget(inEvent);

        switch (targetInfo[0]) {
            case 'node': {
                const clickedNode = this.getNode(targetInfo[1]);
                if (this.nodeActive) {
                    if (this.activeNode && this.activeNode !== clickedNode) {
                        if (this.infoActive && this.activeInfo) {
                            this.activeInfo.infoActive = false;
                            this.activeInfo = undefined;
                            this.infoActive = false;
                        } else if (this.activeNode.hoverActive) {
                            this.activeNode.hoverCancelled = true;
                        }
                        this.activeNode.active = false;
                        this.activeNode = clickedNode;
                        this.activeNode.active = true;
                        this.activeNode.visited = true;
                        this.activeNode.hoverActive = true;
                        this.checkMouseHover(this.activeNode);
                        redrawNeeded = true;
                    }
                } else {
                    if (this.arcActive && this.activeArc) {
                        this.activeArc.active = false;
                        this.activeArc = undefined;
                        this.arcActive = false;
                    }
                    this.nodeActive = true;
                    this.activeNode = clickedNode;
                    this.activeNode.active = true;
                    this.activeNode.visited = true;
                    this.activeNode.hoverActive = true;
                    this.checkMouseHover(this.activeNode);
                    redrawNeeded = true;
                }
                this.nodeHeld = true;
                this.heldNode = this.activeNode;
                if (this.heldNode) {
                    this.heldNode.isBeingDragged = true;
                }
                break;
            }

            case 'arc': {
                const clickedArc = this.getArc(targetInfo[1]);
                if (this.arcActive) {
                    if (this.activeArc && this.activeArc !== clickedArc) {
                        this.activeArc.active = false;
                        this.activeArc = clickedArc;
                        this.activeArc.active = true;
                        this.activeArc.visited = true;
                        redrawNeeded = true;
                    }
                } else {
                    if (this.nodeActive && this.activeNode) {
                        if (this.infoActive && this.activeInfo) {
                            this.activeInfo.infoActive = false;
                            this.activeInfo = undefined;
                            this.infoActive = false;
                        } else if (this.activeNode.hoverActive) {
                            this.activeNode.hoverCancelled = true;
                        }
                        this.activeNode.active = false;
                        this.activeNode = undefined;
                        this.nodeActive = false;
                    }
                    this.arcActive = true;
                    this.activeArc = clickedArc;
                    this.activeArc.active = true;
                    this.activeArc.visited = true;
                    redrawNeeded = true;
                }
                this.arcHeld = true;
                this.heldArc = this.activeArc;
                break;
            }

            case 'else': {
                if (this.nodeActive && this.activeNode) {
                    if (this.infoActive && this.activeInfo) {
                        this.activeInfo.infoActive = false;
                        this.activeInfo = undefined;
                        this.infoActive = false;
                    } else if (this.activeNode.hoverActive) {
                        this.activeNode.hoverCancelled = true;
                    }
                    this.activeNode.active = false;
                    this.activeNode = undefined;
                    this.nodeActive = false;
                    redrawNeeded = true;
                } else if (this.arcActive && this.activeArc) {
                    this.activeArc.active = false;
                    this.activeArc = undefined;
                    this.arcActive = false;
                    redrawNeeded = true;
                }
                break;
            }
        }

        if (redrawNeeded) {
            this.update();
        }

        if (!(this.nodeHeld || this.arcHeld)) {
            this.cutActive = true;
            this.startCut(inEvent);
        }
    }

    public processMouseMove(inEvent: MouseEvent) {
        inEvent.preventDefault();
        let redrawNeeded = false;

        if (this.nodeHeld && this.heldNode) {
            this.dragInProgress = true;
            this.draggedNode = this.heldNode;
            this.draggedNode.x = inEvent.offsetX;
            this.draggedNode.y = inEvent.offsetY;
            redrawNeeded = true;
        } else {
            if (this.cutActive) {
                this.drawCut(inEvent);
            } else {
                const targetInfo: ['node' | 'arc' | 'else', number] = this.getMouseTarget(inEvent);
                switch (targetInfo[0]) {
                    case 'node': {
                        const hoveredNode = this.getNode(targetInfo[1]);
                        if (this.nodeActive) {
                            if (this.activeNode && this.activeNode !== hoveredNode) {
                                if (this.infoActive && this.activeInfo) {
                                    this.activeInfo.infoActive = false;
                                    this.activeInfo = undefined;
                                    this.infoActive = false;
                                } else if (this.activeNode.hoverActive) {
                                    this.activeNode.hoverCancelled = true;
                                }
                                this.activeNode.active = false;
                                this.activeNode = hoveredNode;
                                this.activeNode.active = true;
                                this.activeNode.visited = true;
                                this.activeNode.hoverActive = true;
                                this.checkMouseHover(this.activeNode);
                                redrawNeeded = true;
                            }
                        } else {
                            if (this.arcActive) {
                                if (this.arcHeld) {
                                    this.heldArc = undefined;
                                    this.arcHeld = false;
                                }
                                if (this.activeArc) {
                                    this.activeArc.active = false;
                                    this.activeArc = undefined;
                                    this.arcActive = false;
                                }
                            }
                            this.nodeActive = true;
                            this.activeNode = hoveredNode;
                            this.activeNode.active = true;
                            this.activeNode.visited = true;
                            this.activeNode.hoverActive = true;
                            this.checkMouseHover(this.activeNode);
                            redrawNeeded = true;
                        }
                        break;
                    }
                    case 'arc': {
                        const hoveredArc = this.getArc(targetInfo[1]);
                        if (this.arcActive) {
                            if (this.activeArc && this.activeArc !== hoveredArc) {
                                if (this.arcHeld) {
                                    this.heldArc = undefined;
                                    this.arcHeld = false;
                                }
                                this.activeArc.active = false;
                                this.activeArc = hoveredArc;
                                this.activeArc.active = true;
                                this.activeArc.visited = true;
                                redrawNeeded = true;
                            }
                        } else {
                            if (this.nodeActive && this.activeNode) {
                                if (this.infoActive && this.activeInfo) {
                                    this.activeInfo.infoActive = false;
                                    this.activeInfo = undefined;
                                    this.infoActive = false;
                                } else if (this.activeNode.hoverActive) {
                                    this.activeNode.hoverCancelled = true;
                                }
                                this.activeNode.active = false;
                                this.activeNode = undefined;
                                this.nodeActive = false;
                            }
                            this.arcActive = true;
                            this.activeArc = hoveredArc;
                            this.activeArc.active = true;
                            this.activeArc.visited = true;
                            redrawNeeded = true;
                        }
                        break;
                    }
                    case 'else': {
                        if (this.nodeActive && this.activeNode) {
                            if (this.infoActive && this.activeInfo) {
                                this.activeInfo.infoActive = false;
                                this.activeInfo = undefined;
                                this.infoActive = false;
                            } else if (this.activeNode.hoverActive) {
                                this.activeNode.hoverCancelled = true;
                            }
                            this.activeNode.active = false;
                            this.activeNode = undefined;
                            this.nodeActive = false;
                            redrawNeeded = true;
                        } else if (this.arcActive && this.activeArc) {
                            if (this.arcHeld) {
                                this.heldArc = undefined;
                                this.arcHeld = false;
                            }
                            this.activeArc.active = false;
                            this.activeArc = undefined;
                            this.arcActive = false;
                            redrawNeeded = true;
                        }
                        break;
                    }
                }
            }
        }

        if (redrawNeeded) {
            this.update();
        }
    }

    public processMouseUp(inEvent: MouseEvent) {
        inEvent.preventDefault();

        if (this.nodeHeld && this.heldNode) {
            this.heldNode.isBeingDragged = false;
            this.heldNode.x_velocity = 0;
            this.heldNode.y_velocity = 0;

            this.heldNode.isBeingDragged = false;
            this.heldNode = undefined;
            this.nodeHeld = false;
        }
        if (this.nodeHeld) {
            if (this.dragInProgress) {
                this.dragInProgress = false;
                this.draggedNode = undefined;
            } else if (this.heldNode) {
                this._graph.setElementMarkedFlag(this.heldNode, !this.heldNode.marked);
            }
            if (this.heldNode) {
                this.heldNode.isBeingDragged = false;
            }
            this.heldNode = undefined;
            this.nodeHeld = false;
            this.update();
        } else if (this.arcHeld) {
            if (this.heldArc) {
                this._graph.setElementMarkedFlag(this.heldArc, !this.heldArc.marked);
                this.heldArc.overrideMarking = true;
                this.update();
                this.heldArc.overrideMarking = false;
            }
            this.heldArc = undefined;
            this.arcHeld = false;
        } else if (this.cutActive) {
            this.endCut(inEvent);
            this.cutActive = false;
        }
    }

    public processMouseLeave(inEvent: MouseEvent) {
        inEvent.preventDefault();
        if (this.nodeActive) {
            if (this.nodeHeld) {
                if (this.dragInProgress) {
                    this.draggedNode = undefined;
                    this.dragInProgress = false;
                }
                if (this.heldNode) {
                    this.heldNode.isBeingDragged = false;
                }
                this.heldNode = undefined;
                this.nodeHeld = false;
            }
            if (this.arcHeld) {
                this.heldArc = undefined;
                this.arcHeld = false;
            }
            if (this.activeNode) {
                if (this.infoActive && this.activeInfo) {
                    this.activeInfo.infoActive = false;
                    this.activeInfo = undefined;
                    this.infoActive = false;
                } else if (this.activeNode.hoverActive) {
                    this.activeNode.hoverCancelled = true;
                }
                this.activeNode.active = false;
                this.activeNode = undefined;
                this.nodeActive = false;
            }
            this.update();
        }
        if (this.cutActive) {
            this.endCut(inEvent);
            this.cutActive = false;
        }
    }

    public processKeyPress(inEvent: KeyboardEvent) {
        inEvent.preventDefault();
        if ((inEvent.key === 'i') || (inEvent.key === 'I')) {
            if (this.nodeActive && this.activeNode) {
                this.activeNode.infoOverride = !this.activeNode.infoOverride;
                this.update();
            }
        }
    }

    public processDropEvent(inEvent: DragEvent): void {
        inEvent.preventDefault();
        const fileLocation = inEvent.dataTransfer?.getData(ExampleFileComponent.META_DATA_CODE);
        if (fileLocation) {
            this.fetchFile(fileLocation);
        } else {
            this.readFile(inEvent.dataTransfer?.files);
        }
        this._settings.updateState({ resetInputForm: true });
    }

    public prevent(inEvent: DragEvent): void {
        inEvent.preventDefault();
    }

    public startCut(inEvent: MouseEvent): void {
        this.activeCut = new Cut(inEvent.offsetX, inEvent.offsetY, true);
    }

    public drawCut(inEvent: MouseEvent): void {
        if (!this.activeCut?.isDrawing) return;
        const cutLine = this._svgService.createSvgCut(
            this.activeCut.tempX,
            this.activeCut.tempY,
            inEvent.offsetX,
            inEvent.offsetY
        );
        this.activeCut.tempCutLines.push({
            x1: this.activeCut.tempX,
            y1: this.activeCut.tempY,
            x2: inEvent.offsetX,
            y2: inEvent.offsetY
        });
        this.drawingArea?.nativeElement.appendChild(cutLine);
        this.activeCut.tempX = inEvent.offsetX;
        this.activeCut.tempY = inEvent.offsetY;
    }

    public endCut(inEvent: MouseEvent): void {
        if (!this.activeCut?.isDrawing) return;
        this.activeCut.isDrawing = false;
        if (this._graph?.arcs) {
            for (const arc of this._graph.arcs) {
                const existingLine = { x1: arc.sourceX, y1: arc.sourceY, x2: arc.targetX, y2: arc.targetY };
                for (const cutLine of this.activeCut.tempCutLines) {
                    if (this.activeCut.cutArcs.some(c => c.source.id == arc.source.id && c.target.id == arc.target.id)) {
                        continue;
                    }
                    if (this.activeCut.checkIntersection(cutLine, existingLine)) {
                        this.activeCut.cutArcs.push(arc);
                    }
                }
            }
            if (this.activeCut.cutArcs.length > 0) {
                this.activeCut.cutArcs.forEach(cutArc => {
                    // Toggle arc marking
                    this._graph.setElementMarkedFlag(cutArc, !cutArc.marked);
                });
                this.update();
            }
            this.activeCut.removeCutSvgs(this.drawingArea?.nativeElement);
            this.activeCut = undefined;
        }
    }

    private fetchFile(inLink: string): void {
        this._http.get(inLink, { responseType: 'text' })
            .pipe(
                catchError(error => {
                    console.error('Error fetching file', inLink, error);
                    return of(undefined);
                }),
                take(1)
            )
            .subscribe(fileContent => {
                const fileType: string | undefined = inLink.split('.').pop();
                if (fileType !== undefined && fileContent !== undefined) {
                    this.emitFileData(fileType, fileContent);
                }
            });
    }

    private readFile(files: FileList | undefined | null): void {
        if (!files || files.length === 0) return;
        const fileType: string | undefined = files[0].name.split('.').pop();
        if (fileType) {
            this._fileReaderService.readFile(files[0])
                .pipe(take(1))
                .subscribe(fileContent => {
                    if (fileContent !== undefined) {
                        this.emitFileData(fileType, fileContent);
                    }
                });
        }
    }

    private emitFileData(inFileType: string | undefined, inFileContent: string | undefined): void {
        if (!inFileType || !inFileContent) {
            return;
        }
        this.fileData.emit([inFileType, inFileContent]);
    }

    private update(): void {
        this._displayService.updateData(this._graph);
    }

    private draw(): void {
        if (!this.drawingArea) {
            return;
        }
        const canvasWidth = this.drawingArea.nativeElement.clientWidth;
        const canvasHeight = this.drawingArea.nativeElement.clientHeight;
        this.resizeGraphToFitCanvas(this._graph, canvasWidth, canvasHeight);

        this.clearDrawingArea();

        // Draw arcs / nodes in two layers
        const [layerOne, layerTwo] = this._svgService.createSvgStatics(this._graph);
        for (const svg of layerOne) {
            this.drawingArea.nativeElement.appendChild(svg);
        }
        for (const svg of layerTwo) {
            this.drawingArea.nativeElement.appendChild(svg);
        }

        // Possibly draw "traces"
        if (!this.dragInProgress) {
            const svgTraces = this._svgService.createSvgTraces(this._graph);
            for (const svg of svgTraces) {
                this.drawingArea.nativeElement.appendChild(svg);
            }
        }
    }

    private clearDrawingArea(): void {
        const svgEl = this.drawingArea?.nativeElement;
        if (!svgEl) return;
        while (svgEl.childElementCount > 0) {
            svgEl.removeChild(svgEl.lastChild as ChildNode);
        }
    }

    private resizeGraphToFitCanvas(graph: Graph, canvasWidth: number, canvasHeight: number): void {
        const margin = 20;
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        graph.nodes.forEach(node => {
            if (node) {
                minX = Math.min(minX, node.x);
                minY = Math.min(minY, node.y);
                maxX = Math.max(maxX, node.x);
                maxY = Math.max(maxY, node.y);
            }
        });

        if (minX === Infinity || minY === Infinity || maxX === -Infinity || maxY === -Infinity) {
            return; // no nodes
        }

        const graphWidth = maxX - minX;
        const graphHeight = maxY - minY;
        if (graphWidth < 1 || graphHeight < 1) return;

        const scaleX = (canvasWidth - margin * 2) / graphWidth;
        const scaleY = (canvasHeight - margin * 2) / graphHeight;
        const scale = Math.min(scaleX, scaleY);

        const offsetX = (canvasWidth - graphWidth * scale) / 2 - minX * scale;
        const offsetY = (canvasHeight - graphHeight * scale) / 2 - minY * scale;

        graph.nodes.forEach(node => {
            if (node) {
                node.x = Math.floor(node.x * scale + offsetX);
                node.y = Math.floor(node.y * scale + offsetY);
            }
        });
    }
}
