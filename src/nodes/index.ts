import { LucideIcon } from "lucide-react";
import { nodeConfigs } from "./registry";
import { TNodeData } from "./type"

// Create a union type of all node types from the registry
export type TNodes = typeof nodeConfigs[number]["type"];

// Build the component mapping for react-flow nodes
export const Nodes: Record<TNodes, React.FC<any>> = nodeConfigs.reduce((acc, config) => {
    acc[config.type as TNodes] = config.NodeComponent;
    return acc;
}, {} as Record<TNodes, React.FC<any>>);

// Create the node icon mapping so both your flow and sidebar use the same icons
export const NodeIconMapping: Record<TNodes, LucideIcon> = nodeConfigs.reduce((acc, config) => {
    acc[config.type as TNodes] = config.icon;
    return acc;
}, {} as Record<TNodes, LucideIcon>);

export const NodeEmbedFunctionMapping: Record<TNodes, (inputs: TNodeData) => string> = nodeConfigs.reduce((acc, config) => {
    if (config.embedFunction) {
        acc[config.type as TNodes] = config.embedFunction;
    }
    return acc;
}, {} as Record<TNodes, (inputs: TNodeData) => string>);

// Generate a friendly name mapping based on the registry entry
export function keyToNode(key: TNodes): string {
    const config = nodeConfigs.find(cfg => cfg.type === key);
    return config ? config.name : "";
}

// Filter out non-custom nodes if needed; adjust as necessary.
export const customNodes: Record<TNodes, React.FC<any>> = (() => {
    const filtered = { ...Nodes };
    delete filtered["start"];
    delete filtered["add"];
    delete filtered["annotation"];
    return filtered;
})();

export interface Node {
    id: string;
    position: {
        x: number;
        y: number;
    };
    data: TNodeData;
    type: TNodes;
}

export const NodeSizes = {
    small: { width: 48, height: 48 },
    wide: { width: 112, height: 48 },
    normal: { width: 112, height: 112 },
}
