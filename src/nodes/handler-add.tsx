import { CheckIcon, CodeIcon, FunctionSquareIcon, Icon, Loader, PlusIcon, XIcon } from "lucide-react";
import { Handle, Node, Position } from "@xyflow/react"
import { Button } from "@/components/ui/button";
import { useGlobalState } from "@/hooks/useGlobalStore";
import { keyToNode, TNodes } from ".";
import { useEffect, useState } from "react";
import { SmolText } from "@/components/right-sidebar";
import { Input } from "@/components/ui/input";
import { xmlToLua } from "@/blockly/utils/xml";
import { cn, embedHandler } from "@/lib/utils";

// data field structure for react-node custom node
type THandlerType = "" | "default-action" | "custom-str" | "custom-fun"
export interface data {
    handlerName: string;
    actionType: THandlerType;
    actionValue: string;
    blocklyXml: string;
}

// the handler add node for react-flow
export default function HandlerAddNode(props: Node) {
    const { activeNode, runningNodes, successNodes, errorNodes } = useGlobalState()
    const data = props.data as unknown as data

    // order of preference for applying classes is selected > running > success > error
    const iAmSelected = activeNode?.id === props.id
    const iAmError = !!errorNodes.find(node => node.id == props.id)
    const iAmSuccess = !iAmError && !!successNodes.find(node => node.id == props.id)
    const iAmRunning = !iAmError && !iAmSuccess && !!runningNodes.find(node => node.id == props.id)
    // running - yellow
    // success - green
    // error - red
    // selected - blue  

    return <div data-selected={iAmSelected}
        data-running={iAmRunning}
        data-success={iAmSuccess}
        data-error={iAmError}

        className={cn(`bg-white border data-[selected=true]:!border-black p-2 border-black/30 rounded-md aspect-square cursor-pointer flex flex-col items-center justify-center w-28 h-28 relative`,
            `data-[running=true]:bg-yellow-50 data-[success=true]:bg-green-50 data-[error=true]:bg-red-50`,
            `data-[selected=true]:border-black data-[running=true]:border-yellow-500 data-[success=true]:border-green-500 data-[error=true]:border-red-500`,
        )}>
        {
            iAmRunning && <Loader className="absolute top-1 right-1 animate-spin" size={20} />
        }
        <CodeIcon size={30} strokeWidth={1} />
        <div>{keyToNode(props.type as TNodes)}</div>
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
    </div>
}

// the handler add node sidebar component
export function HandlerAddNodeSidebar() {
    const [handlerName, setHandlerName] = useState("")
    const [actionType, setActionType] = useState<THandlerType>("")
    const [actionValue, setActionValue] = useState("")
    const { editingNode, setEditingNode, nodebarOpen, toggleNodebar, activeNode, setActiveNode } = useGlobalState()
    const nodeData = activeNode?.data as data

    useEffect(() => {
        const nodeData = activeNode?.data as data
        setHandlerName(nodeData?.handlerName || "")
        setActionType(nodeData?.actionType as THandlerType || "")
        setActionValue(nodeData?.actionValue || "")
    }, [activeNode?.id])

    useEffect(() => {
        if (editingNode && nodebarOpen) {
            toggleNodebar()
        }
        if (!editingNode && !nodebarOpen) {
            toggleNodebar()
        }
    }, [editingNode, nodebarOpen])

    useEffect(() => {
        if (actionType == "default-action")
            setActionValue(`${handlerName}`)
    }, [actionType, handlerName])

    useEffect(() => {
        if (!handlerName) return

        // update the node data in react-flow
        const newNodeData: data = {
            handlerName,
            actionType,
            actionValue,
            blocklyXml: nodeData?.blocklyXml || ""
        }

        dispatchEvent(new CustomEvent("update-node-data", { detail: { id: activeNode?.id, data: newNodeData } }))

    }, [handlerName, actionType, actionValue])

    function openBlocklyEditor() {
        nodeData.handlerName = handlerName
        nodeData.actionType = actionType
        nodeData.actionValue = actionValue
        if (activeNode?.id) {
            setActiveNode({ ...activeNode, data: nodeData, id: activeNode.id })
        }
        if (nodebarOpen)
            toggleNodebar()
        setEditingNode(true)
    }

    return <div className="flex flex-col gap-0.5">
        {/* inputs for handler name */}
        <SmolText className="mt-4">Name of the handler</SmolText>
        <Input className="border-y border-x-0 bg-yellow-50" placeholder="Enter handler name" defaultValue={handlerName} value={handlerName} onChange={(e) => setHandlerName(e.target.value)} />
        {/* <input type="text" placeholder="Enter handler name" className="p-2 w-full border-b border-black/20 bg-yellow-50" /> */}
        {/* dropdown with options to either use default action, custom string action, or write your own checker */}

        <SmolText>Action Type</SmolText>
        <select disabled={!handlerName || handlerName.length < 3} defaultValue={actionType || "default"} value={actionType || "default"} onChange={(e) => {
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

        <SmolText>Action Value</SmolText>
        <Input disabled={actionType != "custom-str"} className="border-y border-x-0 bg-yellow-50" placeholder="Enter custom string" defaultValue={actionValue} value={actionValue} onChange={(e) => setActionValue(e.target.value)} />

        <SmolText>Handler Body</SmolText>
        <div className="bg-yellow-50 border-y flex flex-col items-start justify-start overflow-clip">
            <Button disabled={!actionValue} variant="link" className="text-muted-foreground w-full" onClick={openBlocklyEditor}>
                <FunctionSquareIcon size={20} /> Edit Block Code
            </Button>
            {
                nodeData?.blocklyXml && <div className="min-h-[100px] overflow-scroll w-full p-2 pt-0">
                    <pre className="text-xs">
                        {embedHandler(handlerName, actionValue, nodeData.blocklyXml)}
                    </pre>
                </div>
            }
        </div>
    </div>
}