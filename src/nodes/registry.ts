import { LucideIcon, CodeIcon, Workflow, MessageSquareShare, FunctionSquareIcon, DownloadCloud, Send, Coins } from "lucide-react";

// Import your node components and (if available) sidebar editors
import StartNode from "@/nodes/start";
import AddNode from "./add";
import AnnotationNode from "./annotation";
import HandlerAddNode, { HandlerAddNodeSidebar } from "./core/handler-add";
import AOSendNode, { AOSendNodeSidebar } from "./core/ao-send";
import FunctionNode, { FunctionNodeSidebar } from "./core/function";
import InstallPackageNode, { InstallPackageNodeSidebar } from "./core/install-package";
import TransferNode, { TransferNodeSidebar } from "./core/transfer";
import CreateTokenNode, { CreateTokenNodeSidebar } from "./core/token";

// Define a configuration interface for a node:
export interface NodeConfig {
    type: string;
    name: string; // Friendly display name
    icon: LucideIcon;
    NodeComponent: React.FC<any>;
    SidebarComponent: React.FC<any>;
}

// Create an array of node configurations – adding a new node now only means adding a new entry here.
export const nodeConfigs: NodeConfig[] = [
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
    },
    {
        type: "ao-send",
        name: "Send Message",
        icon: MessageSquareShare,
        NodeComponent: AOSendNode,
        SidebarComponent: AOSendNodeSidebar,
    },
    {
        type: "function",
        name: "Lua Function",
        icon: FunctionSquareIcon,
        NodeComponent: FunctionNode,
        SidebarComponent: FunctionNodeSidebar,
    },
    {
        type: "install-package",
        name: "Install Packages",
        icon: DownloadCloud,
        NodeComponent: InstallPackageNode,
        SidebarComponent: InstallPackageNodeSidebar,
    },
    {
        type: "transfer",
        name: "Transfer Token",
        icon: Send,
        NodeComponent: TransferNode,
        SidebarComponent: TransferNodeSidebar,
    },
    {
        type: "create-token",
        name: "Create Token",
        icon: Coins,
        NodeComponent: CreateTokenNode,
        SidebarComponent: CreateTokenNodeSidebar,
    },
]; 