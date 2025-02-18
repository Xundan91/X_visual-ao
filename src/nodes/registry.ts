import { LucideIcon, CodeIcon, Workflow, MessageSquareShare, FunctionSquareIcon, DownloadCloud, Send, Coins, SquareDashed } from "lucide-react";

// Import your node components and (if available) sidebar editors
import StartNode from "@/nodes/common/start";
import AddNode from "@/nodes/common/add";
import AnnotationNode from "@/nodes/common/annotation";
import { TNodeData } from "./type";

import HandlerAddNode, { embedHandler, HandlerAddNodeSidebar } from "@/nodes/core/handler-add";
import AOSendNode, { AOSendNodeSidebar, embedSendFunction } from "@/nodes/core/ao-send";
import FunctionNode, { embedFunction, FunctionNodeSidebar } from "@/nodes/core/function";
import InstallPackageNode, { embedInstallPackageFunction, InstallPackageNodeSidebar } from "@/nodes/core/install-package";
import TransferNode, { embedTransferFunction, TransferNodeSidebar } from "@/nodes/core/transfer";
import CreateTokenNode, { CreateTokenNodeSidebar, embedCreateToken } from "@/nodes/core/token";
import { embedTemplate, TemplateSidebar } from "./common/_template";
import { TemplateNode } from "./common/_template";

// Define a configuration interface for a node:
export interface NodeConfig {
    type: string;
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
        type: "add",
        name: "Add Node",
        icon: CodeIcon,
        NodeComponent: AddNode,
        SidebarComponent: () => null,
    },
    {
        type: "annotation",
        name: "Annotation",
        icon: CodeIcon,
        NodeComponent: AnnotationNode,
        SidebarComponent: () => null,
    },
    {
        type: "handler-add",
        name: "Add Handler",
        icon: Workflow,
        NodeComponent: HandlerAddNode,
        SidebarComponent: HandlerAddNodeSidebar, // Implement editor if needed
        embedFunction: embedHandler
    },
    {
        type: "ao-send",
        name: "Send Message",
        icon: MessageSquareShare,
        NodeComponent: AOSendNode,
        SidebarComponent: AOSendNodeSidebar,
        embedFunction: embedSendFunction
    },
    {
        type: "function",
        name: "Lua Function",
        icon: FunctionSquareIcon,
        NodeComponent: FunctionNode,
        SidebarComponent: FunctionNodeSidebar,
        embedFunction: embedFunction
    },
    {
        type: "install-package",
        name: "Install Packages",
        icon: DownloadCloud,
        NodeComponent: InstallPackageNode,
        SidebarComponent: InstallPackageNodeSidebar,
        embedFunction: embedInstallPackageFunction
    },
    {
        type: "transfer",
        name: "Transfer Token",
        icon: Send,
        NodeComponent: TransferNode,
        SidebarComponent: TransferNodeSidebar,
        embedFunction: embedTransferFunction
    },
    {
        type: "create-token",
        name: "Create Token",
        icon: Coins,
        NodeComponent: CreateTokenNode,
        SidebarComponent: CreateTokenNodeSidebar,
        embedFunction: embedCreateToken
    },
];

if (process.env.NODE_ENV == "development") {
    nodeConfigs.push({
        type: "template",
        name: "Template",
        icon: SquareDashed,
        NodeComponent: TemplateNode,
        SidebarComponent: TemplateSidebar,
        embedFunction: embedTemplate
    });
}

export { nodeConfigs };
