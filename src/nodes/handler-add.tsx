import { CheckIcon, CodeIcon, FunctionSquareIcon, Icon, PlusIcon, XIcon } from "lucide-react";
import { Handle, Node, Position } from "@xyflow/react"
import { Button } from "@/components/ui/button";
import { useGlobalState } from "@/hooks/useGlobalStore";
import { keyToNode, TNodes } from ".";
import { useEffect, useState } from "react";
import { SmolText } from "@/components/right-sidebar";
import { Input } from "@/components/ui/input";
import { xmlToLua } from "@/blockly/utils/xml";

// data field structure for react-node custom node
export interface data {
    handlerName: string;
    actionType: THandlerType;
    actionValue: string;
    blocklyXml: string;
}
type THandlerType = "" | "default-action" | "custom-str" | "custom-fun"

// the handler add node for react-flow
export default function HandlerAddNode(props: Node) {
    const { activeNode } = useGlobalState()
    const data = props.data as unknown as data

    const iAmActive = activeNode?.id === props.id

    return <div data-active={iAmActive} className="bg-white border data-[active=true]:border-black p-2 border-black/30 rounded-md aspect-square cursor-pointer flex flex-col items-center justify-center w-28 h-28">
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
        if (!handlerName) return

        // update the node data in react-flow
        const nodeData: data = {
            handlerName,
            actionType,
            actionValue,
            blocklyXml: ""
        }

        dispatchEvent(new CustomEvent("update-node-data", { detail: { id: activeNode?.id, data: nodeData } }))

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
        {handlerName.length > 3 && <>
            <SmolText>Checker Function</SmolText>
            <select disabled={!handlerName} defaultValue={actionType || "default"} value={actionType || "default"} onChange={(e) => {
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
                <Input className="border-y border-x-0 bg-yellow-50" placeholder="Enter custom string" defaultValue={actionValue} value={actionValue} onChange={(e) => setActionValue(e.target.value)} />
            </>
        }
        {
            actionValue && <>
                <SmolText>Handler Body</SmolText>
                <div className="p-2 bg-yellow-50 border-y border-x-0 aspect-video flex items-center justify-center">
                    <Button variant="link" className="text-muted-foreground" onClick={openBlocklyEditor}>
                        <FunctionSquareIcon size={20} /> Edit Block Code
                    </Button>
                </div>
            </>
        }
        {
            nodeData?.blocklyXml && <div className="p-2 border-y border-x-0 min-h-[100px] overflow-scroll">
                <pre className="text-xs">{xmlToLua(nodeData.blocklyXml)}</pre>
            </div>
        }
    </div>
}