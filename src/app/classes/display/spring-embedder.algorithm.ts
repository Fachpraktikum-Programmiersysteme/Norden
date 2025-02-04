import { Injectable } from '@angular/core';
import { LayoutAlgorithmInterface } from './layout-algorithm.interface';
import { GraphGraphicsConfig } from './graph-graphics.config';
import { Graph } from '../graph-representation/graph';
import { Node } from '../graph-representation/node';
import { Arc } from '../graph-representation/arc';

@Injectable({
    providedIn: 'root',
})
export class SpringEmbedderAlgorithm implements LayoutAlgorithmInterface {

    // -----------------------------------------------------------
    //  Physics parameters (tweak as desired)
    // -----------------------------------------------------------
    private readonly SPRING_CONSTANT = 0.001;         // strength of attraction along arcs
    private readonly REPULSION_CONSTANT = 100;        // strength of repulsion between nodes
    private readonly DAMPING_FACTOR = 0.9;            // velocity damping to stabilize
    private readonly MIN_MOVEMENT_THRESHOLD = 0.05;   // when average speed is below this, layout is "stable"
    private readonly TIME_STEP = 1;                   // time step for force integration

    constructor(
        // Injected config that knows your canvas width/height, etc.
        private graphicsConfig: GraphGraphicsConfig
    ) {}

    /**
     * Called once when the layout is first applied.
     * We assign initial positions (and reset velocities).
     */
    public applyLayout(graph: Graph): Graph {
        this.initializePositionsAndVelocities(graph);
        return graph;
    }

    /**
     * Called repeatedly (e.g., each animation frame).
     * 1) Compute net forces on each node
     * 2) Update node velocities & positions (unless pinned)
     */
    public nextTick(graph: Graph): void {
        // 1) Calculate net forces on every node
        const forces: Map<Node, { x: number; y: number }> = new Map();

        for (const nodeA of graph.nodes) {
            if (!nodeA) continue;

            // If node is currently dragged/pinned, skip force calc on it
            // (We still allow nodeA to *exert* force on other nodes—so do not skip it entirely from the loops below.)
            if (nodeA.isBeingDragged) {
                forces.set(nodeA, { x: 0, y: 0 });
                continue;
            }

            let netForceX = 0;
            let netForceY = 0;

            // (a) Repulsion from every other node
            for (const nodeB of graph.nodes) {
                if (!nodeB || nodeB === nodeA) continue;

                const dx = nodeB.x - nodeA.x;
                const dy = nodeB.y - nodeA.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;

                // Repulsive force magnitude
                const repulsion = this.REPULSION_CONSTANT / dist;

                // Direction
                netForceX -= (repulsion * dx) / dist;
                netForceY -= (repulsion * dy) / dist;
            }

            // (b) Attraction along arcs
            for (const arc of graph.arcs) {
                if (!arc) continue;
                if (arc.source === nodeA || arc.target === nodeA) {
                    const otherNode = (arc.source === nodeA) ? arc.target : arc.source;
                    if (!otherNode) continue;

                    const dx = otherNode.x - nodeA.x;
                    const dy = otherNode.y - nodeA.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;

                    // Spring-like attraction
                    const attraction = this.SPRING_CONSTANT * dist;
                    netForceX += (attraction * dx) / dist;
                    netForceY += (attraction * dy) / dist;
                }
            }

            forces.set(nodeA, { x: netForceX, y: netForceY });
        }

        // 2) Apply forces -> velocity -> position for each node
        for (const node of graph.nodes) {
            if (!node) continue;

            // Skip pinned nodes
            if (node.isBeingDragged) {
                continue;
            }

            // Update velocity and position
            const force = forces.get(node);
            if (!force) continue;

            node.x_velocity += force.x * this.TIME_STEP;
            node.y_velocity += force.y * this.TIME_STEP;

            // Apply damping
            node.x_velocity *= this.DAMPING_FACTOR;
            node.y_velocity *= this.DAMPING_FACTOR;

            // Integrate to get new position
            node.x += node.x_velocity;
            node.y += node.y_velocity;
        }
    }

    /**
     * Check if the layout is "stable" (average speed is small).
     */
    public isStable(graph: Graph): boolean {
        let totalSpeed = 0;
        let count = 0;

        for (const node of graph.nodes) {
            if (!node) continue;

            const speed = Math.sqrt(node.x_velocity * node.x_velocity + node.y_velocity * node.y_velocity);
            totalSpeed += speed;
            count++;
        }

        if (count === 0) return true;

        const avgSpeed = totalSpeed / count;
        return avgSpeed < this.MIN_MOVEMENT_THRESHOLD;
    }

    /**
     * Assign initial (x, y) positions and zero velocities.
     * For example, place them in a circle with special handling
     * for start/end nodes.
     */
    private initializePositionsAndVelocities(graph: Graph): void {
        const w = this.graphicsConfig.canvasWidth;
        const h = this.graphicsConfig.canvasHeight;
        const centerX = w / 2;
        const centerY = h / 2;
        const radius = Math.min(w, h) / 4;

        const totalNodes = graph.nodes.length;

        graph.nodes.forEach((node, i) => {
            if (!node) return;

            // Example: put startNode at top, endNode at bottom, others on a circle
            if (node === graph.startNode) {
                node.x = centerX;
                node.y = 50;
            } else if (node === graph.endNode) {
                node.x = centerX;
                node.y = h - 50;
            } else {
                const angle = (2 * Math.PI * i) / totalNodes;
                node.x = centerX + radius * Math.cos(angle);
                node.y = centerY + radius * Math.sin(angle);
            }

            // Reset velocities
            node.x_velocity = 0;
            node.y_velocity = 0;
        });
    }
}
