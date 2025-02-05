import { Injectable } from '@angular/core';
import {LayoutAlgorithmInterface} from './layout-algorithm.interface';
import { Graph } from '../graph-representation/graph';

@Injectable({
    providedIn: 'root'
})
export class NoLayoutAlgorithm implements LayoutAlgorithmInterface
{
    public applyLayout(graph: Graph): Graph {
        return graph;
    }

    public nextTick(graph: Graph): void {
    }

    public isStable(graph: Graph): boolean {
        return true;
    }
}
