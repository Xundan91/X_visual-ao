import { BezierEdge } from "@xyflow/react";
import DashedEdge from "./dashed";
import MessageEdge from "./message";

export interface Edge {
    id: string;
    source: string;
    target: string;
    type: string;
    data?: any;
}

const Edges = {
    default: BezierEdge,
    dashed: DashedEdge,
    message: MessageEdge
}

type TEdges = keyof typeof Edges

export { Edges, type TEdges };