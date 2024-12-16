import StartNode from "@/nodes/start";
import AddNode from "./add";
import HandlerAddNode from "./handler-add";
import AnnotationNode from "./annotation";

export interface Node {
    id: string;
    position: {
        x: number;
        y: number;
    };
    data: {};
    type: TNodes;
}

const Nodes = {
    start: StartNode,
    add: AddNode,
    "handler-add": HandlerAddNode,
    annotation: AnnotationNode
}

type TNodes = keyof typeof Nodes

const NodeSizes: { [key in TNodes]: { width: number, height: number } } = {
    start: { width: 48, height: 48 },
    add: { width: 48, height: 48 },
    "handler-add": { width: 112, height: 112 },
    annotation: { width: 128, height: 56 }
}

export function keyToNode(key: TNodes): string {
    switch (key) {
        case "start":
            return "Start";
        case "add":
            return "Add";
        case "handler-add":
            return "Handler Add";
        default:
            return "";
    }
}

export { Nodes, type TNodes, NodeSizes };