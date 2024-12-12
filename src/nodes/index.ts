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

export { Nodes, type TNodes };