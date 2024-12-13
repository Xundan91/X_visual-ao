import { useGlobalState } from "@/hooks/useGlobalStore"
import { CodeIcon, LucideIcon } from "lucide-react"
import { keyToNode, Node, Nodes, TNodes } from "@/nodes"
import { Input } from "./ui/input"
import { useState } from "react"

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
    type THandlerType = "" | "default-action" | "custom-str" | "custom-fun"
    const [handlerName, setHandlerName] = useState("")
    const [actionType, setActionType] = useState<THandlerType>("")


    return <div className="flex flex-col gap-0.5">
        {/* inputs for handler name */}
        <Input className="border-y border-x-0 bg-yellow-50" placeholder="Enter handler name" onChange={(e) => setHandlerName(e.target.value)} />
        {/* <input type="text" placeholder="Enter handler name" className="p-2 w-full border-b border-black/20 bg-yellow-50" /> */}
        {/* dropdown with options to either use default action, custom string action, or write your own checker */}
        {handlerName.length > 3 && <select disabled={!handlerName} defaultValue="default" className="p-2 w-full bg-yellow-50 border-y border-x-0">
            <option value="default" disabled>Select Action</option>
            <option value="default-action">Action="{handlerName}"</option>
            <option value="custom-str">Action={"<custom string>"}</option>
            <option value="custom-fun">Custom Function</option>
        </select>}
    </div>
}

function NodeData({ activeNode }: { activeNode: Node }) {
    return <div>
        <div className="p-2 pb-0">{keyToNode(activeNode.type)}</div>
        <div className="p-2 pt-0 text-xs text-muted-foreground">{activeNode.id}</div>

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
