import { CheckIcon, CodeIcon, Coins, FunctionSquareIcon, Icon, Loader, Play, PlusIcon, Send, XIcon } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import NodeContainer from "./common/node";

// data field structure for react-node custom node
export interface data {
    token: string;
    quantity: string;
    to: string;
}

export const TokenOptions = {
    AO: "0syT13r0s0tgPmIed95bJnuSqaD29HQNN8D3ElLSrsc",
    wAR: "xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10",
    qAR: "NG-0lVX882MG5nhARrSzyprEK6ejonHpdUmaaMPsHE8",
    wUSDC: "7zH9dlMNoxprab9loshv3Y7WG45DOny_Vrq9KrXObdQ",
}

export function embedTransferFunction(token: string, quantity: string, to: string) {
    return `
Send({
    Target = "${token}",
    Action = "Transfer",
    To = "${to}",
    Quantity = "${quantity}"
})
`
}

// the handler add node for react-flow
export default function TransferNode(props: Node) {

    return <NodeContainer {...props}>
        <div className="relative right-2 top-1 w-10 h-10 flex items-center justify-center">
            <Coins size={25} strokeWidth={1} className="" />
            <Send size={25} strokeWidth={1} className="absolute -top-2 -right-2" />
        </div>
        <div className="text-center">{keyToNode(props.type as TNodes)}</div>
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
    </NodeContainer>
}

// the handler add node sidebar component
export function TransferNodeSidebar() {
    const [tokenSelection, setTokenSelection] = useState("")
    const [token, setToken] = useState("")
    const [quantity, setQuantity] = useState("")
    const [to, setTo] = useState("")
    const { editingNode, setEditingNode, nodebarOpen, toggleNodebar, activeNode, setActiveNode, activeProcess } = useGlobalState()
    const [output, setOutput] = useState("")
    const [outputId, setOutputId] = useState("")
    const [runningCode, setRunningCode] = useState(false)
    const nodeData = activeNode?.data as data

    useEffect(() => {
        const nodeData = activeNode?.data as data
        setTokenSelection(nodeData?.token || "")
        setQuantity(nodeData?.quantity || "0")
        setTo(nodeData?.to || "")
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
        if (!tokenSelection) return

        // update the node data in react-flow
        const newNodeData: data = {
            token: tokenSelection,
            quantity,
            to
        }

        dispatchEvent(new CustomEvent("update-node-data", { detail: { id: activeNode?.id, data: newNodeData } }))

    }, [tokenSelection, quantity, to])

    async function sendTokens() {
        setRunningCode(true)
        const data = activeNode?.data as data
        const code = embedTransferFunction(tokenSelection, quantity, to)
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
        <SmolText className="mt-2">Token</SmolText>
        <select defaultValue={tokenSelection || "default"} value={tokenSelection || "default"} onChange={(e) => {
            setTokenSelection(e.target.value)
            if (e.target.value === "other") {
                setToken("")
            } else {
                const tokenProcess = e.target.value
                console.log(tokenProcess)
                setToken(tokenProcess)
            }
        }}
            className="p-2 w-full bg-muted border-y border-x-0 text-sm">
            <option value="default" disabled>Select Token</option>
            {Object.keys(TokenOptions).map((tokenName) => (
                <option key={tokenName} value={TokenOptions[tokenName as keyof typeof TokenOptions]}>{tokenName}</option>
            ))}
            <option value="other">Other</option>
            {/* <option value="default-action">Action="{handlerName}"</option>
            <option value="custom-str">Action={"<custom string>"}</option>
            <option value="custom-fun" disabled>Custom Function</option> */}
        </select>
        <Input className="border-y border-x-0 bg-muted" disabled={tokenSelection !== "other"} placeholder="Enter token address" defaultValue={token} value={token} onChange={(e) => setToken(e.target.value)} />
        {/* <input type="text" placeholder="Enter handler name" className="p-2 w-full border-b border-black/20 bg-muted" /> */}
        {/* dropdown with options to either use default action, custom string action, or write your own checker */}

        {/* <SmolText>Action Type</SmolText>
        <select disabled={!functionName || functionName.length < 3} defaultValue={runOnAdd ? "default" : "custom"} value={runOnAdd ? "default" : "custom"} onChange={(e) => {
            setRunOnAdd(e.target.value === "default")
        }}
            className="p-2 w-full bg-muted border-y border-x-0">
            <option value="default" disabled>Select Action</option>
            <option value="default-action">Action="{functionName}"</option>
            <option value="custom-str">Action={"<custom string>"}</option>
            <option value="custom-fun" disabled>Custom Function</option>
        </select> */}

        {/* <SmolText>Action Value</SmolText>
        <Input disabled={actionType != "custom-str"} className="border-y border-x-0 bg-muted" placeholder="Enter custom string" defaultValue={actionValue} value={actionValue} onChange={(e) => setActionValue(e.target.value)} /> */}

        <SmolText className="mt-2">Quantity</SmolText>
        <Input type="number" className="border-y border-x-0 bg-muted" placeholder="Enter quantity" defaultValue={quantity} value={quantity} onChange={(e) => { if (Number(e.target.value) >= 0) setQuantity(e.target.value) }} />

        <SmolText className="h-4 p-0 pl-2 mt-4">Lua Code</SmolText>
        <div className="bg-muted p-2 text-xs border-y">
            <Button disabled={runningCode} variant="link" className="text-muted-foreground w-full" onClick={sendTokens}>
                {runningCode ? <><Loader size={20} className="animate-spin" /> Running Code</> : <><Play size={20} /> Send Tokens</>}
            </Button>
            <pre className="overflow-scroll">
                {embedTransferFunction(token, quantity, to)}
            </pre>
        </div>

        <SmolText className="h-4 p-0 pl-2 mt-4"><>Output {outputId && <Link className="ml-2 text-muted-foreground hover:underline" href={`https://ao.link/#/message/${outputId}`} target="_blank">ao.link</Link>}</></SmolText>
        <div className="bg-muted p-2 text-xs border-y">
            <pre className="overflow-scroll">
                {output ? <Ansi className="text-xs">{output}</Ansi> : <div className="text-muted-foreground">...</div>}
            </pre>
        </div>
    </div>
}