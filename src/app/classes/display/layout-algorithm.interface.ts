import { Graph } from '../graph-representation/graph';

export interface LayoutAlgorithmInterface {
    applyLayout(graph: Graph): Graph;
    nextTick(graph: Graph): void;
    isStable(graph: Graph): boolean;
}
