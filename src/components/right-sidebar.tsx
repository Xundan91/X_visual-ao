import { useGlobalState } from "@/hooks/useGlobalStore"
import { CodeIcon, LucideIcon, MousePointerClick } from "lucide-react"
import { keyToNode, Node, Nodes, TNodes } from "@/nodes"
import { HTMLAttributes, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { NodeIconMapping } from "@/nodes"
import { nodeConfigs } from "@/nodes/registry"
import { Button } from "./ui/button"

export function SmolText({ children, className }: { children: React.ReactNode, className?: HTMLAttributes<HTMLDivElement>["className"] }) {
    return <div className={cn("text-xs text-muted-foreground p-2 pb-0", className)}>{children}</div>
}

export type InputTypes = "TEXT" | "VARIABLE"
export function ToggleButton({ onClick, nameType, className }: { onClick: () => void, nameType: InputTypes, className?: HTMLAttributes<HTMLDivElement>["className"] }) {
    return <Button
        variant="outline"
        className={cn("flex items-center justify-center gap-1 rounded-none relative top-0.5 !rounded-t m-0 text-xs h-5 p-0 px-1 w-fit hover:bg-secondary hover:text-secondary-foreground transition-colors border-b-0 border-dashed text-muted-foreground", className)}
        onClick={onClick}
    >
        {nameType === "TEXT" ? "Text" : "Variable"} <MousePointerClick size={8} strokeWidth={1} />
    </Button>
}



// a single node in the list
function NodeTemplate({ name, Icon, disabled }: { name: TNodes, Icon: LucideIcon, disabled?: boolean }) {
    function addThisNode() {
        if (disabled) return;
        dispatchEvent(new CustomEvent("add-node", { detail: { type: name } }));
    }

    return (
        <div
            data-disabled={disabled}
            className="flex items-center gap-2 hover:bg-black/10 data-[disabled=true]:text-muted-foreground p-2 cursor-pointer data-[disabled=true]:cursor-default"
            onClick={addThisNode}
        >
            <Icon size={22} />
            <div className="truncate">
                {keyToNode(name) || name} {disabled && "(coming soon)"}
            </div>
        </div>
    );
}

// the list that appears in right sidebar on clicking add-node
function AvailableNodes() {
    // New state for search term
    const [searchTerm, setSearchTerm] = useState("");

    const hidden = ["add", "start", "annotation"];
    // Get all available nodes excluding hidden ones.
    const allNodes = (Object.keys(Nodes)
        .filter((v) => !hidden.includes(v)) as TNodes[]);
    // Filter nodes based on search; using keyToNode for a friendly name match.
    const filteredNodes = allNodes.filter((nodeKey) =>
        keyToNode(nodeKey).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const todo: string[] = [];

    return (
        <>
            <div className="p-2">Available Nodes</div>
            {/* New search input */}
            <div className="p-2">
                <Input
                    placeholder="Search nodes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                />
            </div>
            <div className="p-0">
                {filteredNodes.map((nodeKey, index) => (
                    <NodeTemplate
                        key={index}
                        name={nodeKey}
                        Icon={NodeIconMapping[nodeKey] || CodeIcon}
                    />
                ))}
                {/* {todo.map((t, i) => (
                    <NodeTemplate
                        key={i}
                        name={t as TNodes}
                        Icon={NodeIconMapping[t as TNodes] || CodeIcon}
                        disabled
                    />
                ))} */}
            </div>
        </>
    );
}

// the right sidebar when a node is selected
function NodeData({ activeNode }: { activeNode: Node }) {
    return <div>
        <div className="h-14">
            <div className="p-2 pb-0">{keyToNode(activeNode.type)}</div>
            <SmolText className="pt-0 pb-2.5">{activeNode.id}</SmolText>
        </div>
        <hr />
        <div className="h-[calc(100vh-56px)] overflow-y-scroll">
            {
                nodeConfigs.map((node) => {
                    if (node.type == activeNode.type) {
                        return <node.SidebarComponent />
                    }
                })
            }
            {/* {(() => {
                switch (activeNode.type) {
                    case "handler-add":
                        return <HandlerAddNodeSidebar />
                    case "ao-send":
                        return <AOSendNodeSidebar />
                    case "function":
                        return <FunctionNodeSidebar />
                    case "install-package":
                        return <InstallPackageNodeSidebar />
                    case "transfer":
                        return <TransferNodeSidebar />
                    case "create-token":
                        return <CreateTokenNodeSidebar />
                    default:
                        return <div className="text-red-500 text-xs text-center py-2">Unknown Node<br /> Please check @components/right-sidebar.tsx</div>
                }
            })()} */}
        </div>
    </div>
}

// the right sidebar component
export function RightSidebar() {
    const { nodebarOpen, activeNode } = useGlobalState()

    return (
        <div data-nodebaropen={nodebarOpen} className="w-[269px] !bg-[#fefefe] h-screen z-20 data-[nodebaropen=false]:!w-0 transition-all duration-200 border-l">
            {activeNode ? <NodeData activeNode={activeNode} /> : <AvailableNodes />}
        </div>
    )
}
