import { LucideIcon } from "lucide-react";
import { nodeConfigs, TNodeType } from "./registry";
import { TNodeData } from "./type"

// Build the component mapping for react-flow nodes
export const Nodes: Record<TNodeType, React.FC<any>> = nodeConfigs.reduce((acc, config) => {
    acc[config.type as TNodeType] = config.NodeComponent;
    return acc;
}, {} as Record<TNodeType, React.FC<any>>);

// Create the node icon mapping so both your flow and sidebar use the same icons
export const NodeIconMapping: Record<TNodeType, LucideIcon> = nodeConfigs.reduce((acc, config) => {
    acc[config.type as TNodeType] = config.icon;
    return acc;
}, {} as Record<TNodeType, LucideIcon>);

export const NodeEmbedFunctionMapping: Record<TNodeType, (inputs: TNodeData) => string> = nodeConfigs.reduce((acc, config) => {
    if (config.embedFunction) {
        acc[config.type as TNodeType] = config.embedFunction;
    }
    return acc;
}, {} as Record<TNodeType, (inputs: TNodeData) => string>);

// Generate a friendly name mapping based on the registry entry
export function keyToNode(key: TNodeType): string {
    const config = nodeConfigs.find(cfg => cfg.type === key);
    return config ? config.name : "";
}

// Filter out non-custom nodes if needed; adjust as necessary.
export const customNodes: Record<TNodeType, React.FC<any>> = (() => {
    const filtered: Partial<typeof Nodes> = { ...Nodes };
    delete filtered["start"];
    delete filtered["add-node"];
    delete filtered["annotation"];
    return filtered as Record<TNodeType, React.FC<any>>;
})();

export interface Node {
    id: string;
    position: {
        x: number;
        y: number;
    };
    data: TNodeData;
    type: TNodeType;
}

export const NodeSizes = {
    small: { width: 48, height: 48 },
    wide: { width: 112, height: 48 },
    normal: { width: 112, height: 112 },
}
