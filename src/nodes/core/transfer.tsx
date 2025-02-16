import { CheckIcon, CodeIcon, Coins, FunctionSquareIcon, Icon, Loader, Play, PlusIcon, Send, XIcon } from "lucide-react";
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
import { MousePointerClick } from "lucide-react";
import { NodeIconMapping } from "..";

// data field structure for react-node custom node
export interface data {
    tokenProcess: string;
    tokenSelection: string;
    tokenType: InputTypes;
    quantity: string;
    quantityType: InputTypes;
    denomination: number;
    to: string;
    toType: InputTypes;
}

type InputTypes = "TEXT" | "VARIABLE"

export const TokenOptions = {
    AO: "0syT13r0s0tgPmIed95bJnuSqaD29HQNN8D3ElLSrsc",
    wAR: "xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10",
    qAR: "NG-0lVX882MG5nhARrSzyprEK6ejonHpdUmaaMPsHE8",
    wUSDC: "7zH9dlMNoxprab9loshv3Y7WG45DOny_Vrq9KrXObdQ",
}

export function embedTransferFunction(token: string, tokenType: InputTypes, quantity: string, denomination: number, quantityType: InputTypes, to: string, toType: InputTypes) {
    const tokenCode = tokenType === "TEXT" ? `"${token}"` : `${token}`
    const quantityCode = quantityType === "TEXT" ? `"${(Number(quantity) * Math.pow(10, denomination)).toFixed(0)}"` : `${quantity}`
    const toCode = toType === "TEXT" ? `"${to}"` : `${to}`

    return `
Send({
    Target = ${tokenCode},
    Action = "Transfer",
    Recipient = ${toCode},
    Quantity = ${quantityCode}
})
`
}

// the handler add node for react-flow
export default function TransferNode(props: Node) {
    const Icon = NodeIconMapping[props.type as TNodes]
    return <NodeContainer {...props}>
        {Icon && <Icon size={30} strokeWidth={1} />}
        <div className="text-center">{keyToNode(props.type as TNodes)}</div>
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
    </NodeContainer>
}

// the handler add node sidebar component
export function TransferNodeSidebar() {
    const [tokenSelection, setTokenSelection] = useState("")
    const [tokenType, setTokenType] = useState<InputTypes>("TEXT")
    const [tokenProcess, setTokenProcess] = useState("")
    const [quantity, setQuantity] = useState("")
    const [quantityType, setQuantityType] = useState<InputTypes>("TEXT")
    const [recipient, setRecipient] = useState("")
    const [recipientType, setRecipientType] = useState<InputTypes>("TEXT")
    const [denomination, setDenomination] = useState<number>(12)
    const { editingNode, setEditingNode, nodebarOpen, toggleNodebar, activeNode, setActiveNode, activeProcess } = useGlobalState()
    const [output, setOutput] = useState("")
    const [outputId, setOutputId] = useState("")
    const [runningCode, setRunningCode] = useState(false)
    const nodeData = activeNode?.data as data

    useEffect(() => {
        const nodeData = activeNode?.data as data
        setTokenSelection(nodeData?.tokenSelection || "")
        setTokenProcess(nodeData?.tokenProcess || "")
        setTokenType(nodeData?.tokenType || "TEXT")
        setDenomination(nodeData?.denomination || 12)
        setQuantity(nodeData?.quantity || "0")
        setQuantityType(nodeData?.quantityType || "TEXT")
        setRecipient(nodeData?.to || "")
        setRecipientType(nodeData?.toType || "TEXT")
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
        if (!tokenProcess) return


        (async () => {
            console.log("tokenProcess", tokenProcess)
            let token = tokenProcess

            if (tokenProcess == "ao.id") token = activeProcess
            const res = await runLua("", token, [{ name: "Action", value: "Info" }], true)

            if (res.Messages.length == 0) return
            const denom = res.Messages[0].Tags.find((tag: any) => tag.name === "Denomination")?.value
            console.log(denom)
            if (denom) setDenomination(Number(denom))
        })()
    }, [tokenProcess])

    useEffect(() => {
        if (!tokenSelection) return

        const newNodeData: data = {
            tokenProcess: tokenProcess,
            tokenSelection: tokenSelection,
            tokenType,
            quantity,
            quantityType,
            denomination,
            to: recipient,
            toType: recipientType
        }

        dispatchEvent(new CustomEvent("update-node-data", { detail: { id: activeNode?.id, data: newNodeData } }))

    }, [tokenSelection, tokenType, quantity, quantityType, recipient, recipientType, denomination, tokenProcess])

    type InputField = keyof Pick<data, "tokenType" | "quantityType" | "toType">;

    function handleTypeToggle(
        currentType: InputTypes,
        setType: (type: InputTypes) => void,
        field: InputField
    ) {
        const newType = currentType === "TEXT" ? "VARIABLE" : "TEXT"
        setType(newType)
        if (!activeNode) return

        const newNodeData: data = {
            tokenProcess: tokenProcess,
            tokenSelection,
            tokenType,
            quantity,
            quantityType,
            denomination,
            to: recipient,
            toType: recipientType
        }
        newNodeData[field] = newType

        dispatchEvent(new CustomEvent("update-node-data", {
            detail: {
                id: activeNode.id,
                data: newNodeData
            }
        }))
    }

    async function sendTokens() {
        setRunningCode(true)
        const data = activeNode?.data as data
        const code = embedTransferFunction(tokenProcess == "ao.id" ? `"${activeProcess}"` : tokenProcess, tokenType, quantity, denomination, quantityType, recipient, recipientType)
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
        <select value={tokenSelection || "default"} onChange={(e) => {
            setTokenSelection(e.target.value)
            if (e.target.value === "other") {
                setTokenProcess("")
                setTokenType("TEXT")
            } else {
                const tokenProcess = e.target.value
                console.log(tokenProcess)
                setTokenProcess(tokenProcess)
                setTokenType("TEXT")
                setDenomination(12)
            }
        }}
            className="p-2 w-full bg-muted border-y border-x-0 text-sm">
            <option value="default" disabled>Select Token</option>
            {Object.keys(TokenOptions).map((tokenName) => (
                <option key={tokenName} value={TokenOptions[tokenName as keyof typeof TokenOptions]}>{tokenName}</option>
            ))}
            <option value="other">Other</option>

        </select>
        <div className="flex items-end gap-1 justify-between">
            <Input
                className="border-y border-x-0 bg-muted"
                disabled={tokenSelection !== "other"}
                placeholder="Enter token address"
                value={tokenProcess}
                onChange={(e) => setTokenProcess(e.target.value)}
            />
            <Button
                disabled={tokenSelection !== "other"}
                variant="outline"
                className="flex items-center justify-center gap-1 rounded-none !rounded-t m-0 text-xs h-5 p-0 px-1 w-fit hover:bg-secondary hover:text-secondary-foreground transition-colors border-b-0 border-dashed text-muted-foreground"
                onClick={() => handleTypeToggle(tokenType, setTokenType, "tokenType")}
            >
                {tokenType === "TEXT" ? "Text" : "Variable"} <MousePointerClick size={8} strokeWidth={1} />
            </Button>
        </div>

        <div className="flex mt-4 px-2 items-end gap-1 justify-between h-5">
            <SmolText className="h-4 p-0">Recipient</SmolText>
            <Button
                variant="outline"
                className="flex items-center justify-center gap-1 rounded-none relative top-0.5 !rounded-t m-0 text-xs h-5 p-0 px-1 w-fit hover:bg-secondary hover:text-secondary-foreground transition-colors border-b-0 border-dashed text-muted-foreground"
                onClick={() => handleTypeToggle(recipientType, setRecipientType, "toType")}
            >
                {recipientType === "TEXT" ? "Text" : "Variable"} <MousePointerClick size={8} strokeWidth={1} />
            </Button>
        </div>
        <Input
            className="border-y border-x-0 bg-muted"
            placeholder="Enter recipient address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
        />

        <div className="flex mt-4 px-2 items-end gap-1 justify-between h-5">
            <SmolText className="h-4 p-0">Quantity</SmolText>
            <Button
                variant="outline"
                className="flex items-center justify-center gap-1 rounded-none relative top-0.5 !rounded-t m-0 text-xs h-5 p-0 px-1 w-fit hover:bg-secondary hover:text-secondary-foreground transition-colors border-b-0 border-dashed text-muted-foreground"
                onClick={() => handleTypeToggle(quantityType, setQuantityType, "quantityType")}
            >
                {quantityType === "TEXT" ? "Text" : "Variable"} <MousePointerClick size={8} strokeWidth={1} />
            </Button>
        </div>
        <Input
            type={quantityType === "TEXT" ? "number" : "text"}
            className="border-y border-x-0 bg-muted"
            placeholder="Enter quantity"
            value={quantity}
            onChange={(e) => {
                if (quantityType === "TEXT") {
                    if (Number(e.target.value) >= 0) setQuantity(e.target.value)
                } else {
                    setQuantity(e.target.value)
                }
            }}
        />

        <SmolText className="h-4 p-0 pl-2 mt-4">Lua Code</SmolText>
        <div className="bg-muted p-2 text-xs border-y">
            <Button disabled={runningCode} variant="link" className="text-muted-foreground w-full" onClick={sendTokens}>
                {runningCode ? <><Loader size={20} className="animate-spin" /> Running Code</> : <><Play size={20} /> Send Tokens</>}
            </Button>
            <pre className="overflow-scroll">
                {embedTransferFunction(tokenProcess == "ao.id" ? `"${activeProcess}"` : tokenProcess, tokenType, quantity, denomination, quantityType, recipient, recipientType)}
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