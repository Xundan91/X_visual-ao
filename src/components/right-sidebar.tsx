import { useGlobalState } from "@/hooks/useGlobalStore"
import { CodeIcon, FileQuestion, LucideIcon, MousePointerClick, Plus } from "lucide-react"
import { keyToNode, Node, Nodes } from "@/nodes/index"
import { HTMLAttributes, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { addNode } from "@/lib/events"
import { Input } from "@/components/ui/input"
import { NodeIconMapping } from "@/nodes/index/index"
import { NodeConfig, nodeConfigs } from "@/nodes/index/registry"
import { Button } from "./ui/button"
import { TNodeType } from "@/nodes/index/type"
import { toast } from "sonner"
import { useLocalStorage } from "usehooks-ts"

export function SmolText({ children, className }: { children: React.ReactNode, className?: HTMLAttributes<HTMLDivElement>["className"] }) {
    return <div className={cn("text-xs text-muted-foreground p-2 pb-0", className)}>{children}</div>
}

export type InputTypes = "TEXT" | "VARIABLE"
export function ToggleButton({ onClick, nameType, className, disabled }: { onClick: () => void, nameType: InputTypes, className?: HTMLAttributes<HTMLDivElement>["className"], disabled?: boolean }) {
    return <Button
        disabled={disabled}
        variant="ghost"
        className={cn("h-5 mr-4 relative top-0.5 flex items-center justify-center gap-1 rounded-none !rounded-t m-0 text-xs p-0 px-1 w-fit text-muted-foreground/80 border border-dashed border-b-0", className)}
        onClick={onClick}
    >
        {nameType === "TEXT" ? "Text" : "Variable"} <MousePointerClick size={8} strokeWidth={1} />
    </Button>
}



// a single node in the list
function NodeTemplate({ type, Icon, disabled }: { type: TNodeType, Icon: LucideIcon, disabled?: boolean }) {
    function addThisNode() {
        if (disabled) return;
        addNode(type)
    }

    return (
        <div
            data-disabled={disabled}
            className="flex flex-col w-28 h-28 border bg-muted hover:bg-muted-foreground/20 transition-colors duration-100 rounded-md items-center justify-center aspect-square gap-2 hover:drop-shadow data-[disabled=true]:hover:drop-shadow-none data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-default p-2 cursor-pointer"
            onClick={addThisNode}
        >
            <Icon size={22} />
            <div className="truncate whitespace-normal text-center">
                {keyToNode(type) || type}
            </div>
        </div>
    );
}

// the list that appears in right sidebar on clicking add-node
function AvailableNodes() {
    // New state for search term
    const [searchTerm, setSearchTerm] = useState("");
    const [localNodes, setLocalNodes] = useLocalStorage<NodeConfig[]>("local-nodes", [], { initializeWithValue: true });
    const { availableNodes } = useGlobalState()
    const hidden: TNodeType[] = ["add-node", "start", "annotation"];
    const todo: string[] = [];

    // Get all available nodes excluding hidden ones.
    const allNodes = (Object.keys(Nodes)
        .filter((v) => !hidden.includes(v as TNodeType)) as TNodeType[])


    // Filter nodes based on search; using keyToNode for a friendly name match.
    let filteredNodes = allNodes.filter((node) =>
        keyToNode(node).toLowerCase().includes(searchTerm.toLowerCase())
    )

    function handlerCustomUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const json = JSON.parse(e.target?.result as string) as NodeConfig;

                    if (!json.name) return toast.error("Node name is missing");
                    if (!json.type) return toast.error("Node type is missing");
                    if (!json.outputType) return toast.error("Node output type is missing");
                    if (!json.codeTemplate) return toast.error("Node code template is missing");
                    if (!json.icon && !json.iconName) return toast.error("Node icon or iconName is missing");

                    // Check if a node with this type already exists in either localNodes or nodeConfigs
                    const existingLocalNode = localNodes.find(node => node.type === json.type);
                    const existingBuiltInNode = nodeConfigs.find(node => node.type === json.type);

                    if (existingLocalNode || existingBuiltInNode) {
                        const confirmReplace = window.confirm(`A node with type "${json.type}" already exists. Do you want to replace it?`);
                        if (!confirmReplace) {
                            return;
                        }

                        // Replace the existing node
                        setLocalNodes(prev => prev.filter(node => node.type !== json.type).concat(json));
                        toast.success('Custom node replaced successfully');
                        return;
                    }

                    // Store the custom node data in localStorage
                    setLocalNodes(prev => [...prev, json]);
                    // Show success message
                    toast.success('Custom node added locally');
                } catch (err) {
                    console.error('Failed to parse JSON:', err);
                    toast.error('Invalid JSON file. Please check the format.');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

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
            <div className="p-2 grid w-full items-start justify-start grid-cols-[repeat(auto-fill,minmax(7rem,0fr))] gap-2">
                {/* Show enabled nodes first */}
                {filteredNodes
                    .map((type, index) => {
                        if (!nodeConfigs.find((node) => node.type == type)?.community) {
                            return <NodeTemplate
                                disabled={false}
                                key={`enabled-${index}`}
                                type={type}
                                Icon={NodeIconMapping[type] || FileQuestion}
                            />
                        }
                    })}
            </div>
            <div className="my-4 w-[90%] mx-auto bg-muted-foreground/30 h-[1px] flex items-center justify-center" >
                <div className="text-muted-foreground/70 bg-background w-fit px-1 text-sm text-center mx-auto">community nodes</div>
            </div>
            <div className="p-2 grid w-full items-start justify-start grid-cols-[repeat(auto-fill,minmax(7rem,0fr))] gap-2">
                {/* Show enabled nodes first */}
                {filteredNodes
                    .map((type, index) => {
                        if (nodeConfigs.find((node) => node.type == type)?.community) {
                            return <NodeTemplate
                                disabled={false}
                                key={`enabled-${index}`}
                                type={type}
                                Icon={NodeIconMapping[type] || FileQuestion}
                            />
                        }
                    })}
                {/* add your own */}
                <div
                    className="flex flex-col w-28 h-28 border border-dashed bg-muted/20 text-muted-foreground/50 hover:text-muted-foreground rounded-md items-center justify-center aspect-square gap-2 hover:drop-shadow data-[disabled=true]:hover:drop-shadow-none data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-default p-2 cursor-pointer"
                    onClick={handlerCustomUpload}
                >
                    <Plus size={22} />
                    <div className="truncate whitespace-normal text-center">
                        Custom Node
                    </div>
                </div>
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
        <div className="h-[calc(100vh-130px)] overflow-y-scroll">
            {
                nodeConfigs.map((node) => {
                    if (node.type == activeNode.type) {
                        if (node.SidebarComponent) {
                            return <node.SidebarComponent />
                        }
                    }
                })
            }
        </div>
    </div>
}

// the right sidebar component
export function RightSidebar() {
    const { activeNode } = useGlobalState()

    return (
        <div className=" h-screen z-20 transition-all duration-200">
            {activeNode ? <NodeData activeNode={activeNode} /> : <AvailableNodes />}
        </div>
    )
}
