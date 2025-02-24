import { BezierEdge } from "@xyflow/react";
import DashedEdge from "./dashed";
import MessageEdge from "./message";
import TokenIdEdge from "./token-id";
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
    message: MessageEdge,
    tokenId: TokenIdEdge
}

type TEdges = keyof typeof Edges | "inherit"

export { Edges, type TEdges };