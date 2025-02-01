import {Injectable} from "@angular/core";

import {GraphGraphicsConfig} from "./graph-graphics.config";
import {Graph} from '../graph-representation/graph';
import {Node} from '../graph-representation/node';
import {Arc} from '../graph-representation/arc';

@Injectable({
    providedIn: 'root', // Makes it available application-wide
})
export class SpringEmbedderAlgorithm {
    private readonly SPRING_CONSTANT = 0.004;
    private readonly REPULSION_CONSTANT = 50;
    private readonly DAMPING_FACTOR = 0.9;
    private readonly MAX_ITERATIONS = 20000;

    public constructor(
        private graphicsConfig: GraphGraphicsConfig
    ) {}

    public applyLayout(graph: Graph): Graph
    {
        let iteration = 0;
        let maxMovement = Infinity;

        // this.initializeNodePositions(graph, this.graphicsConfig.canvasWidth, this.graphicsConfig.canvasHeight)

        while (iteration < this.MAX_ITERATIONS && maxMovement > 0.1) {
            const forces: Map<Node, { x: number; y: number }> = new Map();

            // Calculate forces
            for (const nodeA of graph.nodes) {

                if (!nodeA) continue; // Safeguard against undefined nodes

                let netForceX = 0;
                let netForceY = 0;

                for (const nodeB of graph.nodes) {
                    if (!nodeB || nodeA === nodeB) continue; // Safeguard against undefined nodes or self-comparison

                    // Calculate repulsion
                    const dx = nodeB.x - nodeA.x;
                    const dy = nodeB.y - nodeA.y;
                    const distance = Math.sqrt(dx * dx + dy * dy) || 0.1; // Avoid division by zero
                    const repulsionForce = this.REPULSION_CONSTANT / distance;

                    netForceX -= (repulsionForce * dx) / distance;
                    netForceY -= (repulsionForce * dy) / distance;
                }

                for (const arc of graph.arcs) {
                    if (!arc) continue; // Safeguard against undefined arcs

                    // Calculate attraction
                    if (arc.source === nodeA || arc.target === nodeA) {
                        const otherNode = arc.source === nodeA ? arc.target : arc.source;
                        if (!otherNode) continue; // Safeguard against undefined target or source
                        const dx = otherNode.x - nodeA.x;
                        const dy = otherNode.y - nodeA.y;
                        const distance = Math.sqrt(dx * dx + dy * dy) || 0.1; // Avoid division by zero
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
                if (!node) continue; // Safeguard against undefined nodes

                const force = forces.get(node);
                if (!force) continue; // Safeguard against missing force data

                const dx = force.x * this.DAMPING_FACTOR;
                const dy = force.y * this.DAMPING_FACTOR;
                const newX = node.x + dx;
                const newY = node.y + dy;
                if ((newX > node.x || newX > 20) && (newX < node.x || newX < this.graphicsConfig.canvasWidth - 22)) {
                    node.x  = newX;
                }
                if ((newY > node.y || newY > 22) && (newY < node.y || newY < this.graphicsConfig.canvasHeight - 22)){
                    node.y = newY;
                }

                const movement = Math.sqrt(dx * dx + dy * dy);
                if (movement > maxMovement) maxMovement = movement;
            }

            iteration++;
        }

        return graph;
    }

    private initializeNodePositions(graph: Graph, canvasWidth: number, canvasHeight: number): void {
        const radius = Math.min(canvasWidth, canvasHeight) / 4; // Use 1/4 of the smaller dimension for radius
        const centerX = canvasWidth / 2; // Dynamically calculate center based on canvas width
        const centerY = canvasHeight / 2; // Dynamically calculate center based on canvas height
        const totalNodes = graph.nodes.length;

        graph.nodes.forEach((node, index) => {
            if (node) { // Check if node is not undefined
                node.x = centerX + radius * Math.cos((2 * Math.PI * index) / totalNodes);
                node.y = centerY + radius * Math.sin((2 * Math.PI * index) / totalNodes);
            }
        });
    }


}
