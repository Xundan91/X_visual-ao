import { CheckIcon, CodeIcon, FunctionSquareIcon, Icon, Loader, Play, PlusIcon, XIcon } from "lucide-react";
import { Handle, Node, Position } from "@xyflow/react"
import { Button } from "@/components/ui/button";
import { useGlobalState } from "@/hooks/useGlobalStore";
import { keyToNode, TNodes } from "..";
import { useEffect, useState } from "react";
import { SmolText } from "@/components/right-sidebar";
import { Input } from "@/components/ui/input";
import { replaceXMLFieldValue, xmlToLua } from "@/blockly/utils/xml";
import { cn } from "@/lib/utils";
import Ansi from "ansi-to-react";
import Link from "next/link";
import { parseOutupt, runLua } from "@/lib/aos";
import { Switch } from "@/components/ui/switch";
import NodeContainer from "../common/node";
import { NodeIconMapping } from "..";

// data field structure for react-node custom node
export interface data {
    functionName: string;
    runOnAdd: boolean;
    blocklyXml: string;
}

export function embedFunction(name: string, xml: string, run: boolean) {
    return `${xmlToLua(replaceXMLFieldValue(xml, "NAME", name))}

${run ? `return ${name}()` : ""}
`
}

// the handler add node for react-flow
export default function FunctionNode(props: Node) {
    const Icon = NodeIconMapping[props.type as TNodes]
    return <NodeContainer {...props}>
        {Icon && <Icon size={30} strokeWidth={1} />}
        <div className="text-center">{keyToNode(props.type as TNodes)}</div>
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
    </NodeContainer>
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
            console.log("output", r)
        } catch (e: any) {
            setOutput(e.message)
        } finally {
            setRunningCode(false)
        }
    }


    return <div className="flex flex-col gap-0.5 h-full">
        {/* inputs for handler name */}
        <SmolText className="mt-2">Name of the function</SmolText>
        <Input className="border-y border-x-0 bg-muted" placeholder="Enter function name" value={functionName} onChange={(e) => setFunctionName(e.target.value)} />

        <div className="flex items-center mt-2">
            <SmolText className="pb-1.5">Run On Add</SmolText>
            <Switch checked={runOnAdd} onCheckedChange={(e: boolean) => setRunOnAdd(e)} />
        </div>


        <Button disabled={!functionName || functionName.length < 1} variant="link" className="text-muted-foreground w-full mt-4" onClick={openBlocklyEditor}>
            <FunctionSquareIcon size={20} /> Edit Block Code
        </Button>
        <SmolText>Function Definition</SmolText>
        <div className="bg-muted border-y flex flex-col items-start justify-start overflow-clip">
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
        <div className="bg-muted p-2 text-xs border-y">
            <pre className="overflow-scroll">
                {output ? <Ansi className="text-xs">{output}</Ansi> : <div className="text-muted-foreground">...</div>}
            </pre>
        </div>
    </div>
}