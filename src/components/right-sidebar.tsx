import { useGlobalState } from "@/hooks/useGlobalStore"
import { CodeIcon, LucideIcon } from "lucide-react"
import { keyToNode, Node, Nodes, TNodes } from "@/nodes"

function NodeTemplate({ name, Icon }: { name: TNodes, Icon: LucideIcon }) {
    function addThisNode() {
        dispatchEvent(new CustomEvent("add-node", { detail: { type: name } }))
    }

    return <div className="flex items-center gap-2 hover:bg-black/10 p-2 cursor-pointer" onClick={addThisNode}>
        <Icon size={22} />
        <div className="truncate">{keyToNode(name)}</div>
    </div>
}

function AvailableNodes() {
    return <>
        <div className="p-2">Available Nodes</div>
        <div className="p-0">
            {
                (Object.keys(Nodes).filter(v => !["add", "start"].includes(v)) as TNodes[]).map((nodeKey: TNodes, index) => <NodeTemplate key={index} name={nodeKey} Icon={CodeIcon} />)
            }
        </div></>
}

function HandlerAddNodeData() {
    return <div>
        {/* inputs for handler name */}
        <input type="text" placeholder="Enter handler name" className="p-2 w-full border-b border-black/20 bg-yellow-50" />
    </div>
}

function NodeData({ activeNode }: { activeNode: Node }) {
    return <div>
        <div className="p-2 pb-0">{keyToNode(activeNode.type)}</div>
        <div className="p-2 pt-0 text-xs text-muted-foreground">{activeNode.id}</div>
        <hr />
        <HandlerAddNodeData />
    </div>
}

export function RightSidebar() {
    const { nodebarOpen, activeNode } = useGlobalState()

    return (
        <div data-nodebaropen={nodebarOpen} className="w-[250px] bg-white h-screen z-20 data-[nodebaropen=false]:w-0 transition-all duration-200 border-l">
            {activeNode ? <NodeData activeNode={activeNode} /> : <AvailableNodes />}
        </div>
    )
}
