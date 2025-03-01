import { LucideIcon, CodeIcon, Workflow, MessageSquareShare, FunctionSquareIcon, DownloadCloud, Send, Coins, SquareDashed, Plus, GitBranch, Repeat } from "lucide-react";

// Import your node components and (if available) sidebar editors
import StartNode from "@/nodes/index/start";
import AnnotationNode from "@/nodes/index/annotation";
import { TNodeData } from "@/nodes/index/type";

import { HandlerNode, HandlerSidebar } from "@/nodes/handler";
import { SendMessageSidebar } from "../send-message";
import { SendMessageNode } from "../send-message";
import { CodeblockSidebar } from "../codeblock";
import { CodeblockNode } from "../codeblock";
import { TokenNode } from "../token";
import { TokenSidebar } from "../token";
import { ConditionalNode, ConditionalSidebar } from "../conditional";
import { LoopNode, LoopSidebar } from "../loop";
import { TEdges } from "@/edges";
import * as CommunityNodes from "@/nodes/community";
import { TNodeType } from "@/nodes/index/type";
import { GenerateNode, GenerateSidebar } from "./generators";


export const RootNodesAvailable: TNodeType[] = ["handler", "codeblock", "token", "loop"]
export const SubRootNodesAvailable: TNodeType[] = ["send-message", "codeblock", "conditional", "loop"]

export const attachables: TNodeType[] = ["handler", "token", "conditional", "loop"]

// Define possible edge types
// export type TEdgeType = "default" | "message" | "tokenId";

// Define a configuration interface for a node:
export interface NodeConfig {
    type: TNodeType;
    name: string; // Friendly display name
    icon?: LucideIcon;
    iconName?: string;
    NodeComponent?: React.FC<any>;
    SidebarComponent?: React.FC<any>;
    outputType: TEdges; // What type of edge should be used when this is the source
    inputs?: {
        [name: string]: {
            type: "text" | "number" | "boolean"
            label?: string;
            showVariableToggle?: boolean
            input: "normal" | "dropdown" | "checkbox"
            values?: string[]
            placeholder?: string
        }
    }
    community?: boolean
    codeGenerator?: (inputs: TNodeData) => string;
}

// Create an array of node configurations – adding a new node now only means adding a new entry here.
const nodeConfigs: NodeConfig[] = [
    {
        type: "start",
        name: "Start",
        icon: CodeIcon,
        NodeComponent: StartNode,
        SidebarComponent: () => null,  // No sidebar needed
        outputType: "default"
    },
    {
        type: "annotation",
        name: "Annotation",
        icon: CodeIcon,
        NodeComponent: AnnotationNode,
        SidebarComponent: () => null,
        outputType: "default"
    },
    // 
    {
        type: "handler",
        name: "Handler",
        icon: Workflow,
        NodeComponent: HandlerNode,
        SidebarComponent: HandlerSidebar,
        outputType: "message"
    },
    {
        type: "token",
        name: "Token",
        icon: Coins,
        NodeComponent: TokenNode,
        SidebarComponent: TokenSidebar,
        outputType: "tokenId"
    },
    {
        type: "send-message",
        name: "Send Message",
        icon: MessageSquareShare,
        NodeComponent: SendMessageNode,
        SidebarComponent: SendMessageSidebar,
        outputType: "inherit"
    },
    {
        type: "codeblock",
        name: "Code Block",
        icon: CodeIcon,
        NodeComponent: CodeblockNode,
        SidebarComponent: CodeblockSidebar,
        outputType: "inherit"
    },
    {
        type: "conditional",
        name: "Conditional",
        icon: GitBranch,
        NodeComponent: ConditionalNode,
        SidebarComponent: ConditionalSidebar,
        outputType: "inherit"
    },
    {
        type: "loop",
        name: "Loop",
        icon: Repeat,
        NodeComponent: LoopNode,
        SidebarComponent: LoopSidebar,
        outputType: "loop"
    },
    ...Object.values(CommunityNodes).map(node => {
        if (!node.NodeComponent) {
            //generate node component
            node.NodeComponent = GenerateNode(node)
        }
        if (!node.SidebarComponent) {
            //generate sidebar component
            node.SidebarComponent = GenerateSidebar(node)
        }
        return {
            type: node.type as TNodeType,
            name: node.name,
            iconName: node.iconName,
            outputType: node.outputType,
            codeGenerator: node.codeGenerator,
            NodeComponent: node.NodeComponent,
            SidebarComponent: node.SidebarComponent,
            community: true
        }
    })
];

export { nodeConfigs };
