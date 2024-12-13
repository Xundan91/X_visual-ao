import { SmoothStepEdge } from "@xyflow/react";
import DashedEdge from "./dashed";

export interface Edge {
    id: string;
    source: string;
    target: string;
    type: string;
    data?: any;
}

const Edges = {
    default: SmoothStepEdge,
    dashed: DashedEdge
}

type TEdges = keyof typeof Edges

export { Edges, type TEdges };