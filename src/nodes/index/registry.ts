import { LucideIcon, CodeIcon, Workflow, MessageSquareShare, FunctionSquareIcon, DownloadCloud, Send, Coins, SquareDashed, Plus } from "lucide-react";

// Import your node components and (if available) sidebar editors
import StartNode from "@/nodes/start";
import AnnotationNode from "@/nodes/index/annotation";
import { TNodeData } from "@/nodes/index/type";

import { embed, TemplateSidebar } from "@/nodes/_template";
import { TemplateNode } from "@/nodes/_template";
import { HandlerNode, HandlerSidebar } from "@/nodes/handler";
import { SendMessageSidebar } from "../send-message";
import { SendMessageNode } from "../send-message";

export type TNodeType =
    | "start"
    | "add-node"
    | "annotation"
    | "handler"
    | "send-message"
    | "template";

export const RootNodesAvailable: TNodeType[] = ["handler"]
export const SubRootNodesAvailable: TNodeType[] = ["send-message"]

// Define a configuration interface for a node:
export interface NodeConfig {
    type: TNodeType;
    name: string; // Friendly display name
    icon: LucideIcon;
    NodeComponent: React.FC<any>;
    SidebarComponent: React.FC<any>;
    embedFunction?: (inputs: TNodeData) => string;
}

// Create an array of node configurations – adding a new node now only means adding a new entry here.
const nodeConfigs: NodeConfig[] = [
    {
        type: "start",
        name: "Start",
        icon: CodeIcon,
        NodeComponent: StartNode,
        SidebarComponent: () => null,  // No sidebar needed
    },
    {
        type: "annotation",
        name: "Annotation",
        icon: CodeIcon,
        NodeComponent: AnnotationNode,
        SidebarComponent: () => null,
    },
    // 
    {
        type: "handler",
        name: "Handler",
        icon: Workflow,
        NodeComponent: HandlerNode,
        SidebarComponent: HandlerSidebar
    },
    {
        type: "send-message",
        name: "Send Message",
        icon: MessageSquareShare,
        NodeComponent: SendMessageNode,
        SidebarComponent: SendMessageSidebar
    }

];

if (process.env.NODE_ENV == "development") {
    nodeConfigs.push({
        type: "template",
        name: "Template",
        icon: SquareDashed,
        NodeComponent: TemplateNode,
        SidebarComponent: TemplateSidebar,
        embedFunction: embed
    });
}

export { nodeConfigs };
