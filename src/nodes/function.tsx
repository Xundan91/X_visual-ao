import { CheckIcon, CodeIcon, FunctionSquareIcon, Icon, Loader, Play, PlusIcon, XIcon } from "lucide-react";
import { Handle, Node, Position } from "@xyflow/react"
import { Button } from "@/components/ui/button";
import { useGlobalState } from "@/hooks/useGlobalStore";
import { keyToNode, TNodes } from ".";
import { useEffect, useState } from "react";
import { SmolText } from "@/components/right-sidebar";
import { Input } from "@/components/ui/input";
import { replaceXMLFieldValue, xmlToLua } from "@/blockly/utils/xml";
import { cn, embedFunction, embedHandler } from "@/lib/utils";
import Ansi from "ansi-to-react";
import Link from "next/link";
import { parseOutupt, runLua } from "@/lib/aos";
import { Switch } from "@/components/ui/switch";

// data field structure for react-node custom node
export interface data {
    functionName: string;
    runOnAdd: boolean;
    blocklyXml: string;
}

// the handler add node for react-flow
export default function FunctionNode(props: Node) {
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
export function FunctionNodeSidebar() {
    const [functionName, setFunctionName] = useState("")
    const [runOnAdd, setRunOnAdd] = useState(false)
    const [blocklyXml, setBlocklyXml] = useState("")
    const { editingNode, setEditingNode, nodebarOpen, toggleNodebar, activeNode, setActiveNode, activeProcess } = useGlobalState()
    const [output, setOutput] = useState("")
    const [outputId, setOutputId] = useState("")
    const [runningCode, setRunningCode] = useState(false)
    const nodeData = activeNode?.data as data

    useEffect(() => {
        const nodeData = activeNode?.data as data
        setFunctionName(nodeData?.functionName || "")
        setRunOnAdd(nodeData?.runOnAdd || false)
        setBlocklyXml(nodeData?.blocklyXml || "")
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
        if (!functionName) return

        const newXml = nodeData?.blocklyXml ? replaceXMLFieldValue(nodeData?.blocklyXml, "NAME", functionName) : ""

        // update the node data in react-flow
        const newNodeData: data = {
            functionName,
            runOnAdd,
            blocklyXml: newXml
        }

        dispatchEvent(new CustomEvent("update-node-data", { detail: { id: activeNode?.id, data: newNodeData } }))

    }, [functionName, runOnAdd])

    function openBlocklyEditor() {
        nodeData.functionName = functionName
        nodeData.runOnAdd = runOnAdd
        if (activeNode?.id) {
            setActiveNode({ ...activeNode, data: nodeData, id: activeNode.id })
        }
        if (nodebarOpen)
            toggleNodebar()
        setEditingNode(true)
    }

    async function runFunction() {
        setRunningCode(true)
        const data = activeNode?.data as data
        const code = embedFunction(functionName, data?.blocklyXml || "", runOnAdd)
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
        <SmolText className="mt-2">Name of the function</SmolText>
        <Input className="border-y border-x-0 bg-yellow-50" placeholder="Enter function name" defaultValue={functionName} value={functionName} onChange={(e) => setFunctionName(e.target.value)} />
        {/* <input type="text" placeholder="Enter handler name" className="p-2 w-full border-b border-black/20 bg-yellow-50" /> */}
        {/* dropdown with options to either use default action, custom string action, or write your own checker */}

        {/* <SmolText>Action Type</SmolText>
        <select disabled={!functionName || functionName.length < 3} defaultValue={runOnAdd ? "default" : "custom"} value={runOnAdd ? "default" : "custom"} onChange={(e) => {
            setRunOnAdd(e.target.value === "default")
        }}
            className="p-2 w-full bg-yellow-50 border-y border-x-0">
            <option value="default" disabled>Select Action</option>
            <option value="default-action">Action="{functionName}"</option>
            <option value="custom-str">Action={"<custom string>"}</option>
            <option value="custom-fun" disabled>Custom Function</option>
        </select> */}

        {/* <SmolText>Action Value</SmolText>
        <Input disabled={actionType != "custom-str"} className="border-y border-x-0 bg-yellow-50" placeholder="Enter custom string" defaultValue={actionValue} value={actionValue} onChange={(e) => setActionValue(e.target.value)} /> */}

        <div className="flex items-center mt-2">
            <SmolText className="pb-1.5">Run On Add</SmolText>
            <Switch checked={runOnAdd} onCheckedChange={(e: boolean) => setRunOnAdd(e)} />
        </div>


        <Button disabled={!functionName || functionName.length < 1} variant="link" className="text-muted-foreground w-full mt-4" onClick={openBlocklyEditor}>
            <FunctionSquareIcon size={20} /> Edit Block Code
        </Button>
        <SmolText>Function Definition</SmolText>
        <div className="bg-yellow-50 border-y flex flex-col items-start justify-start overflow-clip">
            <Button disabled={!functionName || functionName.length < 1 || runningCode} variant="link" className="text-muted-foreground w-full my-2" onClick={runFunction}>
                {runningCode ? <><Loader size={20} className="animate-spin" /> Running Code</> : <><Play size={20} /> Run Code</>}
            </Button>
            {
                nodeData?.blocklyXml && <div className="min-h-[100px] overflow-scroll w-full p-2 pt-0">
                    <pre className="text-xs">
                        {embedFunction(functionName, nodeData.blocklyXml, runOnAdd)}
                    </pre>
                </div>
            }
        </div>

        <SmolText className="h-4 p-0 pl-2 mt-4"><>Output {outputId && <Link className="ml-2 text-muted-foreground hover:underline" href={`https://ao.link/#/message/${outputId}`} target="_blank">ao.link</Link>}</></SmolText>
        <div className="bg-yellow-50 p-2 text-xs border-y">
            <pre className="overflow-scroll">
                <Ansi className="text-xs">{output || "..."}</Ansi>
            </pre>
        </div>
    </div>
}