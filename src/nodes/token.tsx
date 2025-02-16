import { CheckIcon, CodeIcon, Coins, FunctionSquareIcon, Icon, Loader, Play, PlusIcon, Send, XIcon } from "lucide-react";
import { Handle, Node, Position } from "@xyflow/react"
import { Button } from "@/components/ui/button";
import { useGlobalState } from "@/hooks/useGlobalStore";
import { keyToNode, TNodes, NodeIconMapping } from ".";
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
import { MousePointerClick } from "lucide-react";
import { token } from "@/blueprints";
import { TokenOptions } from "./transfer";

// data field structure for react-node custom node
export interface data {
    name: string;
    ticker: string;
    totalSupply: number;
    denomination: number;
    logo: string;
    overwrite: boolean;
}

type InputTypes = "TEXT" | "VARIABLE"

// export const TokenOptions = {
//     AO: "0syT13r0s0tgPmIed95bJnuSqaD29HQNN8D3ElLSrsc",
//     wAR: "xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10",
//     qAR: "NG-0lVX882MG5nhARrSzyprEK6ejonHpdUmaaMPsHE8",
//     wUSDC: "7zH9dlMNoxprab9loshv3Y7WG45DOny_Vrq9KrXObdQ",
// }

export function embedCreateTokenCode(name = "Points Coin", ticker = "PNTS", totalSupply = 10_000, denomination = 12, logo = "SBCCXwwecBlDqRLUjb8dYABExTJXLieawf7m2aBJ-KY", overwrite = false) {
    if (!name) name = "Points Coin"
    if (!ticker) ticker = "PNTS"
    if (!totalSupply) totalSupply = 10_000
    if (!denomination && denomination != 0) denomination = 12
    if (!logo) logo = "SBCCXwwecBlDqRLUjb8dYABExTJXLieawf7m2aBJ-KY"

    return `${token.init(name, ticker, denomination, totalSupply, logo)}
    
${overwrite ? `
-- Denomination = ${denomination.toString()}
-- Balances = Balances or { [ao.id] = utils.toBalanceValue(<<SUPPLY>> * 10 ^ Denomination) }
-- TotalSupply = TotalSupply or utils.toBalanceValue(<<SUPPLY>> * 10 ^ Denomination)
Name = "${name}"
Ticker = "${ticker}"
Logo = "${logo}"

return "Token Overwritten 👍"` : `return "Token created 👍"`}`

}

// the handler add node for react-flow
export default function CreateTokenNode(props: Node) {
    const Icon = NodeIconMapping[props.type as TNodes]
    return <NodeContainer {...props}>
        {Icon && <Icon size={30} strokeWidth={1} />}
        <div className="text-center">{keyToNode(props.type as TNodes)}</div>
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
    </NodeContainer>
}

// the handler add node sidebar component
export function CreateTokenNodeSidebar() {
    const [name, setName] = useState("")
    const [ticker, setTicker] = useState("")
    const [totalSupply, setTotalSupply] = useState(0)
    const [denomination, setDenomination] = useState(12)
    const [logo, setLogo] = useState("")
    const [overwrite, setOverwrite] = useState(false)

    const { editingNode, setEditingNode, nodebarOpen, toggleNodebar, activeNode, setActiveNode, activeProcess } = useGlobalState()
    const [output, setOutput] = useState("")
    const [outputId, setOutputId] = useState("")
    const [runningCode, setRunningCode] = useState(false)
    const nodeData = activeNode?.data as data

    useEffect(() => {
        const nodeData = activeNode?.data as data
        setName(nodeData?.name || "")
        setTicker(nodeData?.ticker || "")
        setTotalSupply(nodeData?.totalSupply || 10_000)
        setDenomination(nodeData?.denomination == 0 ? 0 : nodeData?.denomination || 12)
        setLogo(nodeData?.logo || "")
        setOverwrite(nodeData?.overwrite || false)
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
        if (!name) return

        const newNodeData: data = {
            name,
            ticker,
            totalSupply,
            denomination,
            logo,
            overwrite
        }

        dispatchEvent(new CustomEvent("update-node-data", { detail: { id: activeNode?.id, data: newNodeData } }))

    }, [name, ticker, totalSupply, denomination, logo, overwrite])

    type InputField = keyof data;

    // function handleTypeToggle(
    //     currentType: InputTypes,
    //     setType: (type: InputTypes) => void,
    //     field: InputField
    // ) {
    //     const newType = currentType === "TEXT" ? "VARIABLE" : "TEXT"
    //     setType(newType)
    //     if (!activeNode) return

    //     const newNodeData: data = {
    //         name,
    //         ticker,
    //         totalSupply,
    //         denomination,
    //         logo,
    //         overwrite
    //     }
    //     newNodeData[field] = newType

    //     dispatchEvent(new CustomEvent("update-node-data", {
    //         detail: {
    //             id: activeNode.id,
    //             data: newNodeData
    //         }
    //     }))
    // }

    async function sendTokens() {
        setRunningCode(true)
        const data = activeNode?.data as data
        const code = embedCreateTokenCode(name, ticker, totalSupply, denomination, logo, overwrite)
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
        <SmolText className="mt-2">Token Name</SmolText>
        <div className="flex items-center gap-1">
            <Input
                className="border-y border-x-0 bg-muted"
                placeholder="Points Coin"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
        </div>

        <SmolText className="mt-2">Token Ticker</SmolText>
        <div className="flex items-center gap-1">
            <Input
                className="border-y border-x-0 bg-muted"
                placeholder="PNTS"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
            />
        </div>

        <SmolText className="mt-2">Token Total Supply</SmolText>
        <div className="flex items-center gap-1">
            <Input
                className="border-y border-x-0 bg-muted"
                placeholder="10000"
                type="number"
                value={totalSupply}
                onChange={(e) => {
                    if (Number(e.target.value) >= 1) setTotalSupply(Number(e.target.value))
                    else setTotalSupply(1)
                }}
            />
        </div>

        <SmolText className="mt-2">Token Denomination</SmolText>
        <div className="flex items-center gap-1">
            <Input
                className="border-y border-x-0 bg-muted"
                placeholder="12"
                type="number"
                value={denomination}
                onChange={(e) => {
                    if (Number(e.target.value) >= 0) setDenomination(Number(e.target.value))
                    else setDenomination(0)
                }}
            />
        </div>

        <SmolText className="mt-2">Token Logo (txid)</SmolText>
        <div className="flex items-center gap-1">
            <Input
                className="border-y border-x-0 bg-muted"
                placeholder="SBCCXwwecBlDqRLUjb8dYABExTJXLieawf7m2aBJ-KY"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
            />
        </div>

        <div className="flex items-center gap-1">
            <SmolText className="mt-2">Overwrite Token</SmolText>
            <Switch
                className="mt-4"
                checked={overwrite}
                onCheckedChange={setOverwrite}
            />
        </div>
        {
            overwrite && (
                <div className="text-destructive text-xs p-2">
                    Overwriting token will only update the token name, ticker, and logo.<br />(not recommended unless needed)
                </div>
            )
        }

        <SmolText className="h-4 p-0 pl-2 mt-4">Lua Code</SmolText>
        <div className="bg-muted p-2 text-xs border-y">
            <Button disabled={runningCode} variant="link" className="text-muted-foreground w-full" onClick={sendTokens}>
                {runningCode ? <><Loader size={20} className="animate-spin" /> Running Code</> : <><Play size={20} /> Create Token</>}
            </Button>
            <pre className="overflow-scroll max-h-[200px]">
                {embedCreateTokenCode(name, ticker, totalSupply, denomination, logo, overwrite)}
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