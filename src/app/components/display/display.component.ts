import { Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { catchError, of, Subscription, take } from 'rxjs';

import { FileReaderService } from "../../services/file-reader.service";
import { DisplayService } from '../../services/display.service';
import { SvgService } from '../../services/svg.service';

import { ExampleFileComponent } from "../../components/example-file/example-file.component";

import { Graph } from '../../classes/graph-representation/graph';
import { Cut } from '../../classes/graph-representation/cut';

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
    private _graph: Graph | undefined;
    private _cut: Cut | undefined;

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
                console.log('display_component noticed new graph');
                this._graph = graph;
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
        };
    };

    public prevent(inEvent: DragEvent): void {
        // dragover must be prevented for drop to work
        inEvent.preventDefault();
    };

    public startCut(inEvent: MouseEvent): void {
        this._cut = new Cut(inEvent.offsetX, inEvent.offsetY, true);
    };

    public drawCut(inEvent: MouseEvent): void {
        if (!this._cut?.isDrawing) return;
        const cutLine = this._svgService.createSvgCut(this._cut.tempX, this._cut.tempY, inEvent.offsetX, inEvent.offsetY);
        this._cut.tempCutLines.push({ x1: this._cut.tempX, y1: this._cut.tempY, x2: inEvent.offsetX, y2: inEvent.offsetY });
        this.drawingArea?.nativeElement.appendChild(cutLine);
        this._cut.tempX = inEvent.offsetX;
        this._cut.tempY = inEvent.offsetY;
    };

    public endCut(inEvent: MouseEvent): void {
        if (!this._cut?.isDrawing) return;
        this._cut.isDrawing = false;
        if (this._graph?.arcs) {
            for (const arc of this._graph.arcs) {
                const existingLine = { x1: arc[0].x, y1: arc[0].y, x2: arc[1].x, y2: arc[1].y };
                for (const cutLine of this._cut.tempCutLines) {
                    if (this._cut.cutArcs.some(cutArc => cutArc[0].id == arc[0].id && cutArc[1].id == arc[1].id)) {
                        continue;
                    }
                    if (this._cut.checkIntersection(cutLine, existingLine)) {
                        this._cut.cutArcs.push(arc);
                    }
                }
            }
            // hier muss dann der Inductive Miner aufgerufen werden zur Prüfung des Cuts
            if (this._cut.cutArcs.length > 0) {
                console.log('Folgende Kanten wurden geschnitten: ')
                this._cut.cutArcs.forEach(cutArc => {
                    console.log(cutArc);
                });
            }
            this._cut.removeSvgCuts(this.drawingArea?.nativeElement)
            this._cut = undefined;
        }
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
                };
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
        };
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
        };
    };

    private emitFileData(inFileType: string | undefined, inFileContent: string | undefined): void {
        if (inFileType === undefined || inFileContent === undefined) {
            return;
        };
        this.fileData.emit([inFileType, inFileContent]);
    };

    private draw(): void {
        if (this.drawingArea === undefined) {
            console.debug('drawing area not ready yet')
            return;
        };
        this.clearDrawingArea();
        const arcs = this._svgService.createSvgArcs(this._displayService.graph);
        for (const arc of arcs) {
            this.drawingArea.nativeElement.appendChild(arc);
        };
        const nodes = this._svgService.createSvgNodes(this._displayService.graph);
        for (const node of nodes) {
            this.drawingArea.nativeElement.appendChild(node);
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

};
