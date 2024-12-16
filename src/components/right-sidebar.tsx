import { useGlobalState } from "@/hooks/useGlobalStore"
import { CodeIcon, LucideIcon } from "lucide-react"
import { keyToNode, Node, Nodes, TNodes } from "@/nodes"
import { Input } from "./ui/input"
import { HTMLAttributes, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"

function SmolText({ children, className }: { children: string, className?: HTMLAttributes<HTMLDivElement>["className"] }) {
    return <div className={cn("text-xs text-muted-foreground p-2 pb-0", className)}>{children}</div>
}

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
    const hidden = ["add", "start", "annotation"]

    return <>
        <div className="p-2">Available Nodes</div>
        <div className="p-0">
            {
                (Object.keys(Nodes).filter(v => !hidden.includes(v)) as TNodes[]).map((nodeKey: TNodes, index) => <NodeTemplate key={index} name={nodeKey} Icon={CodeIcon} />)
            }
        </div></>
}

function HandlerAddNodeData() {
    type THandlerType = "" | "default-action" | "custom-str" | "custom-fun"
    const [handlerName, setHandlerName] = useState("")
    const [actionType, setActionType] = useState<THandlerType>("")
    const [actionValue, setActionValue] = useState("")
    const { setEditingNode, nodebarOpen, toggleNodebar } = useGlobalState()

    function openBlockEditor() {
        setEditingNode(true)
        if (nodebarOpen) toggleNodebar()
    }

    return <div className="flex flex-col gap-0.5">
        {/* inputs for handler name */}
        <SmolText className="mt-4">Name of the handler</SmolText>
        <Input className="border-y border-x-0 bg-yellow-50" placeholder="Enter handler name" onChange={(e) => setHandlerName(e.target.value)} />
        {/* <input type="text" placeholder="Enter handler name" className="p-2 w-full border-b border-black/20 bg-yellow-50" /> */}
        {/* dropdown with options to either use default action, custom string action, or write your own checker */}
        {handlerName.length > 3 && <>
            <SmolText>Activation Function</SmolText>
            <select disabled={!handlerName} defaultValue="default" onChange={(e) => {
                setActionType(e.target.value as THandlerType)
                if (e.target.value === "default-action") {
                    setActionValue(`${handlerName}`)
                }
            }}
                className="p-2 w-full bg-yellow-50 border-y border-x-0">
                <option value="default" disabled>Select Action</option>
                <option value="default-action">Action="{handlerName}"</option>
                <option value="custom-str">Action={"<custom string>"}</option>
                <option value="custom-fun" disabled>Custom Function</option>
            </select>
        </>}
        {
            actionType === "custom-str" && <>
                <SmolText>Custom String</SmolText>
                <Input className="border-y border-x-0 bg-yellow-50" placeholder="Enter custom string" onChange={(e) => setActionValue(e.target.value)} />
            </>
        }
        {
            // actionType === "custom-fun" && <>
            //     <SmolText>Custom Function</SmolText>
            //     <Input className="border-y border-x-0 bg-yellow-50" placeholder="Enter custom function" />
            // </>
        }
        {
            actionValue && <>
                <SmolText>Handler Body</SmolText>
                <div className="p-2 bg-yellow-50 border-y border-x-0 aspect-video flex items-center justify-center">
                    <Button variant="link" className="text-muted-foreground" onClick={openBlockEditor}>Edit Block Code</Button>
                </div>
            </>
        }
    </div>
}

function NodeData({ activeNode }: { activeNode: Node }) {
    return <div>
        <div className="p-2 pb-0">{keyToNode(activeNode.type)}</div>
        <SmolText className="pt-0 pb-2.5">{activeNode.id}</SmolText>
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
