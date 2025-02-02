import StartNode from "@/nodes/start";
import AddNode from "./add";
import AnnotationNode from "./annotation";
import HandlerAddNode, { data as HandlerAddNodeData } from "./handler-add";
import AOSendNode, { data as AOSendNodeData } from "./ao-send";
import FunctionNode from "./function";
import InstallPackageNode from "./install-package";
export interface Node {
    id: string;
    position: {
        x: number;
        y: number;
    };
    data: {} | HandlerAddNodeData | AOSendNodeData;
    type: TNodes;
}

export const customNodes = {
    "handler-add": HandlerAddNode,
    "ao-send": AOSendNode,
    function: FunctionNode,
    "install-package": InstallPackageNode,
}

const Nodes = {
    start: StartNode,
    add: AddNode,
    annotation: AnnotationNode,
    ...customNodes,
}

type TNodes = keyof typeof Nodes

const NodeSizes: { [key in TNodes]: { width: number, height: number } } = {
    start: { width: 48, height: 48 },
    add: { width: 48, height: 48 },
    annotation: { width: 128, height: 56 },
    "handler-add": { width: 112, height: 112 },
    "ao-send": { width: 112, height: 112 },
    function: { width: 112, height: 112 },
    "install-package": { width: 112, height: 112 },
}

export function keyToNode(key: TNodes): string {
    switch (key) {
        case "handler-add":
            return "Add Handler";
        case "ao-send":
            return "Send Message";
        case "function":
            return "Lua Function";
        case "install-package":
            return "Install Packages";
        default:
            return "";
    }
}

export { Nodes, type TNodes, NodeSizes };