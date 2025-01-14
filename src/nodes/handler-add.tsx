import { CheckIcon, CodeIcon, FunctionSquareIcon, Icon, Loader, Play, PlusIcon, XIcon } from "lucide-react";
import { Handle, Node, Position } from "@xyflow/react"
import { Button } from "@/components/ui/button";
import { useGlobalState } from "@/hooks/useGlobalStore";
import { keyToNode, TNodes } from ".";
import { useEffect, useState } from "react";
import { SmolText } from "@/components/right-sidebar";
import { Input } from "@/components/ui/input";
import { replaceXMLFieldValue, xmlToLua } from "@/blockly/utils/xml";
import { cn } from "@/lib/utils";
import Ansi from "ansi-to-react";
import Link from "next/link";
import { parseOutupt, runLua } from "@/lib/aos";
import NodeContainer from "./common/node";

// data field structure for react-node custom node
type THandlerType = "" | "default-action" | "custom-str" | "custom-fun"
export interface data {
    handlerName: string;
    actionType: THandlerType;
    actionValue: string;
    blocklyXml: string;
}

export function embedHandler(name: string, action: string, xml: string) {
    console.log(xml)
    return `${xmlToLua(replaceXMLFieldValue(xml, "NAME", name + "Handler"))}

return Handlers.add(
  "${name}",
  "${action}",
  ${name}Handler
)
`
}

// the handler add node for react-flow
export default function HandlerAddNode(props: Node) {
    return <NodeContainer {...props}>
        <CodeIcon size={30} strokeWidth={1} />
        <div className="text-center">{keyToNode(props.type as TNodes)}</div>
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
    </NodeContainer>
}

// the handler add node sidebar component
export function HandlerAddNodeSidebar() {
    const [handlerName, setHandlerName] = useState("")
    const [actionType, setActionType] = useState<THandlerType>("")
    const [actionValue, setActionValue] = useState("")
    const { editingNode, setEditingNode, nodebarOpen, toggleNodebar, activeNode, setActiveNode, activeProcess } = useGlobalState()
    const [output, setOutput] = useState("")
    const [outputId, setOutputId] = useState("")
    const [runningCode, setRunningCode] = useState(false)
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

    async function runHandler() {
        setRunningCode(true)
        const code = embedHandler(handlerName, actionValue, nodeData.blocklyXml)
        console.log("running", code)
        try {
            const result = await runLua(code, activeProcess)
            const r = parseOutupt(result)
            setOutput(r)
            setOutputId(result.id)
        } catch (e: any) {
            setOutput(e.message)
        } finally {
            setRunningCode(false)
        }
    }

    return <div className="flex flex-col gap-0.5 h-full">
        {/* inputs for handler name */}
        <SmolText className="mt-2">Name of the handler</SmolText>
        <Input className="border-y border-x-0 bg-muted" placeholder="Enter handler name" defaultValue={handlerName} value={handlerName} onChange={(e) => setHandlerName(e.target.value)} />
        {/* <input type="text" placeholder="Enter handler name" className="p-2 w-full border-b border-black/20 bg-muted" /> */}
        {/* dropdown with options to either use default action, custom string action, or write your own checker */}

        <SmolText>Action Type</SmolText>
        <select disabled={!handlerName || handlerName.length < 3} defaultValue={actionType || "default"} value={actionType || "default"} onChange={(e) => {
            setActionType(e.target.value as THandlerType)
            if (e.target.value === "default-action") {
                setActionValue(`${handlerName}`)
            }
        }}
            className="p-2 w-full bg-muted border-y border-x-0 text-sm">
            <option value="default" disabled>Select Action</option>
            <option value="default-action">Action="{handlerName}"</option>
            <option value="custom-str">Action={"<custom string>"}</option>
            <option value="custom-fun" disabled>Custom Function</option>
        </select>

        <SmolText>Action Value</SmolText>
        <Input disabled={actionType != "custom-str"} className="border-y border-x-0 bg-muted" placeholder="Enter custom string" defaultValue={actionValue} value={actionValue} onChange={(e) => setActionValue(e.target.value)} />

        <Button disabled={!actionValue} variant="link" className="text-muted-foreground w-full mt-4" onClick={openBlocklyEditor}>
            <FunctionSquareIcon size={20} /> Edit Block Code
        </Button>
        <SmolText>Handler Body</SmolText>
        <div className="bg-muted border-y flex flex-col items-start justify-start overflow-clip">
            <Button disabled={!actionValue || runningCode} variant="link" className="text-muted-foreground w-full my-2" onClick={runHandler}>
                {runningCode ? <><Loader size={20} className="animate-spin" /> Running Code</> : <><Play size={20} /> Run Code</>}
            </Button>
            {
                nodeData?.blocklyXml && <div className="min-h-[100px] overflow-scroll w-full p-2 pt-0">
                    <pre className="text-xs">
                        {embedHandler(handlerName, actionValue, nodeData.blocklyXml)}
                    </pre>
                </div>
            }
        </div>

        <SmolText className="h-4 p-0 pl-2 mt-4"><>Output {outputId && <Link className="ml-2 text-muted-foreground hover:underline" href={`https://ao.link/#/message/${outputId}`} target="_blank">ao.link</Link>}</></SmolText>
        <div className="bg-muted p-2 text-xs border-y">
            <pre className="overflow-scroll">
                <Ansi className="text-xs">{output || "..."}</Ansi>
            </pre>
        </div>
    </div>
}