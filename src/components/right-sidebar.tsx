import { useGlobalState } from "@/hooks/useGlobalStore"
import { CodeIcon, LucideIcon } from "lucide-react"
import { keyToNode, Node, Nodes, TNodes } from "@/nodes"
import { HTMLAttributes, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { HandlerAddNodeSidebar } from "@/nodes/handler-add"
import { AOSendNodeSidebar } from "@/nodes/ao-send"

export function SmolText({ children, className }: { children: string, className?: HTMLAttributes<HTMLDivElement>["className"] }) {
    return <div className={cn("text-xs text-muted-foreground p-2 pb-0", className)}>{children}</div>
}

// a single node in the list
function NodeTemplate({ name, Icon }: { name: TNodes, Icon: LucideIcon }) {
    function addThisNode() {
        dispatchEvent(new CustomEvent("add-node", { detail: { type: name } }))
    }

    return <div className="flex items-center gap-2 hover:bg-black/10 p-2 cursor-pointer" onClick={addThisNode}>
        <Icon size={22} />
        <div className="truncate">{keyToNode(name)}</div>
    </div>
}

// the list that appears in right sidebar on clicking add-node
function AvailableNodes() {
    const hidden = ["add", "start", "annotation"]

    return <>
        <div className="p-2">Available Nodes</div>
        <div className="p-0">
            {
                (Object.keys(Nodes).filter(v => !hidden.includes(v)) as TNodes[]).map((nodeKey: TNodes, index) => <NodeTemplate key={index} name={nodeKey} Icon={CodeIcon} />)
            }
        </div></>
}

// the right sidebar when a node is selected
function NodeData({ activeNode }: { activeNode: Node }) {
    return <div>
        <div className="p-2 pb-0">{keyToNode(activeNode.type)}</div>
        <SmolText className="pt-0 pb-2.5">{activeNode.id}</SmolText>
        <hr />
        {(() => {
            switch (activeNode.type) {
                case "handler-add":
                    return <HandlerAddNodeSidebar />
                case "ao-send":
                    return <AOSendNodeSidebar />
                default:
                    return <div>Unknown Node</div>
            }
        })()}
    </div>
}

// the right sidebar component
export function RightSidebar() {
    const { nodebarOpen, activeNode } = useGlobalState()

    return (
        <div data-nodebaropen={nodebarOpen} className="w-[250px] bg-white h-screen z-20 data-[nodebaropen=false]:w-0 transition-all duration-200 border-l">
            {activeNode ? <NodeData activeNode={activeNode} /> : <AvailableNodes />}
        </div>
    )
}
