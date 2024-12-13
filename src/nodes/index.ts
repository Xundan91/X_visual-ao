import StartNode from "@/nodes/start";
import AddNode from "./add";
import HandlerAddNode from "./handler-add";

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
    "handler-add": HandlerAddNode
}

type TNodes = keyof typeof Nodes

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

export { Nodes, type TNodes };