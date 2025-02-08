import { Injectable } from '@angular/core';
import {LayoutAlgorithmInterface} from './layout-algorithm.interface';
import { Graph } from '../graph-representation/graph';

@Injectable({
    providedIn: 'root'
})
export class NoAlgorithm implements LayoutAlgorithmInterface {
    public applyLayout(graph: Graph): Graph {
        return graph;
    }
}
