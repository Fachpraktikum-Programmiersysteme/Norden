import { Injectable } from "@angular/core";

import { GraphUiConfig } from "../graph-ui/graph-ui.config";
import { Graph } from '../graph-representation/graph';
import { Node } from '../graph-representation/node';
import { Arc } from '../graph-representation/arc';

@Injectable({
    providedIn: 'root',
})
export class SpringEmbedderAlgorithm {
    private readonly SPRING_CONSTANT = 0.01;
    private readonly REPULSION_CONSTANT = 100;
    private readonly DAMPING_FACTOR = 0.9;
    private readonly MAX_ITERATIONS = 1000;

    constructor(private graphUiConfig: GraphUiConfig) {}

    public applyLayout(graph: Graph): Graph
    {
        const startNode = graph.startNode;
        const endNode = graph.endNode;

        this.initializeNodePositions(
            graph,
            this.graphUiConfig.canvasWidth,
            this.graphUiConfig.canvasHeight
        );

        let iteration = 0;
        let maxMovement = Infinity;

        while (iteration < this.MAX_ITERATIONS && maxMovement > 0.1) {
            const forces: Map<Node, { x: number; y: number }> = new Map();

            for (const nodeA of graph.nodes) {
                // Skip any undefined nodes in the array
                if (!nodeA) {
                    continue;
                }
                // If node is the pinned start/end, set force to zero so it won’t move
                if (nodeA === startNode || nodeA === endNode) {
                    forces.set(nodeA, { x: 0, y: 0 });
                    continue;
                }

                let netForceX = 0;
                let netForceY = 0;

                // Repulsion from every other node
                for (const nodeB of graph.nodes) {
                    if (!nodeB || nodeA === nodeB) {
                        continue;
                    }
                    const dx = nodeB.x - nodeA.x;
                    const dy = nodeB.y - nodeA.y;
                    const distance = Math.sqrt(dx * dx + dy * dy) || 0.1; // Avoid division by zero
                    const repulsionForce = this.REPULSION_CONSTANT / distance;

                    netForceX -= (repulsionForce * dx) / distance;
                    netForceY -= (repulsionForce * dy) / distance;
                }

                // Attraction along arcs
                for (const arc of graph.arcs) {
                    if (!arc) {
                        continue;
                    }
                    if (arc.source === nodeA || arc.target === nodeA) {
                        const otherNode = arc.source === nodeA ? arc.target : arc.source;
                        if (!otherNode) {
                            continue;
                        }
                        // Even if the “otherNode” is start/end (pinned), we still apply
                        // a spring *on nodeA* to pull it toward the pinned node.
                        const dx = otherNode.x - nodeA.x;
                        const dy = otherNode.y - nodeA.y;
                        const distance = Math.sqrt(dx * dx + dy * dy) || 0.1;
                        const attractionForce = this.SPRING_CONSTANT * distance;

                        netForceX += (attractionForce * dx) / distance;
                        netForceY += (attractionForce * dy) / distance;
                    }
                }

                forces.set(nodeA, { x: netForceX, y: netForceY });
            }

            // Apply forces
            maxMovement = 0;
            for (const node of graph.nodes) {
                if (!node) {
                    continue;
                }
                // Skip pinned nodes
                if (node === startNode || node === endNode) {
                    continue;
                }

                const force = forces.get(node);
                if (!force) {
                    continue;
                }

                const dx = force.x * this.DAMPING_FACTOR;
                const dy = force.y * this.DAMPING_FACTOR;

                node.x += dx;
                node.y += dy;

                const movement = Math.sqrt(dx * dx + dy * dy);
                if (movement > maxMovement) {
                    maxMovement = movement;
                }
            }

            iteration++;
        }

        // 4. (Optional) Fix final positions of start/end if desired.
        //    For example, center them horizontally at top and bottom with some padding.
        if (startNode) {
            startNode.x = this.graphUiConfig.canvasWidth / 2;
            startNode.y = 50; // Some top padding
        }
        if (endNode) {
            endNode.x = this.graphUiConfig.canvasWidth / 2;
            endNode.y = this.graphUiConfig.canvasHeight - 50; // Some bottom padding
        }

        return graph;
    }

    private initializeNodePositions(graph: Graph, canvasWidth: number, canvasHeight: number): void {
        const radius = Math.min(canvasWidth, canvasHeight) / 4;
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        const totalNodes = graph.nodes.length;

        graph.nodes.forEach((node, index) => {
            if (!node) {
                return;
            }
            // If it’s the pinned start node, place near top or skip
            if (node === graph.startNode) {
                node.x = centerX;
                node.y = 50; // near the top
                return;
            }
            // If it’s the pinned end node, place near bottom or skip
            if (node === graph.endNode) {
                node.x = centerX;
                node.y = canvasHeight - 50; // near the bottom
                return;
            }
            // Otherwise, distribute in a circle (or any layout you prefer)
            node.x = centerX + radius * Math.cos((2 * Math.PI * index) / totalNodes);
            node.y = centerY + radius * Math.sin((2 * Math.PI * index) / totalNodes);
        });
    }
}
