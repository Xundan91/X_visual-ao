import { useGlobalState } from "@/hooks/useGlobalStore"
import { CodeIcon, LucideIcon } from "lucide-react"
import { keyToNode, Node, Nodes, TNodes } from "@/nodes"
import { HTMLAttributes, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { HandlerAddNodeSidebar } from "@/nodes/handler-add"
import { AOSendNodeSidebar } from "@/nodes/ao-send"
import { FunctionNodeSidebar } from "@/nodes/function"
import { InstallPackageNodeSidebar } from "@/nodes/install-package"
import { TransferNodeSidebar } from "@/nodes/transfer"
export function SmolText({ children, className }: { children: React.ReactNode, className?: HTMLAttributes<HTMLDivElement>["className"] }) {
    return <div className={cn("text-xs text-muted-foreground p-2 pb-0", className)}>{children}</div>
}

// a single node in the list
function NodeTemplate({ name, Icon, disabled }: { name: TNodes, Icon: LucideIcon, disabled?: boolean }) {
    function addThisNode() {
        if (disabled) return
        dispatchEvent(new CustomEvent("add-node", { detail: { type: name } }))
    }

    return <div data-disabled={disabled} className="flex items-center gap-2 hover:bg-black/10 data-[disabled=true]:text-muted-foreground p-2 cursor-pointer data-[disabled=true]:cursor-default" onClick={addThisNode}>
        <Icon size={22} />
        <div className="truncate">{keyToNode(name) || name} {disabled && "(coming soon)"}</div>
    </div>
}

// the list that appears in right sidebar on clicking add-node
function AvailableNodes() {
    const hidden = ["add", "start", "annotation"]
    const todo = ["Create Token", "Check Balance", "Spawn Process"]

    return <>
        <div className="p-2">Available Nodes</div>
        <div className="p-0">
            {
                (Object.keys(Nodes).filter(v => !hidden.includes(v)) as TNodes[]).map((nodeKey: TNodes, index) => <NodeTemplate key={index} name={nodeKey} Icon={CodeIcon} />)
            }
            {
                todo.map((t, i) => <NodeTemplate key={i} name={t as TNodes} Icon={CodeIcon} disabled />)
            }
        </div></>
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
            {(() => {
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
                    default:
                        return <div className="text-red-500 text-xs text-center py-2">Unknown Node<br /> Please check @components/right-sidebar.tsx</div>
                }
            })()}
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
