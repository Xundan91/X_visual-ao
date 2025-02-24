import NodeContainer from "@/nodes/node";
import { Handle, Position } from "@xyflow/react";
import { keyToNode, Node, NodeIconMapping } from "@/nodes/index";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useGlobalState } from "@/hooks/useGlobalStore";
import { InputTypes, SmolText, ToggleButton } from "@/components/right-sidebar";
import { AlertTriangle, Loader, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import Ansi from "ansi-to-react";
import { parseOutupt, runLua } from "@/lib/aos";
import Link from "next/link";
import { SubRootNodesAvailable, TNodeType } from "./index/registry";
import { getCode, updateNodeData } from "@/lib/events";
import { formatLua } from "@/lib/utils";
import { token } from "@/blueprints"
import { Switch } from "@/components/ui/switch";

// This file should be copied and modified to create new nodes
// Copy inside @nodes/community and rename the file
// Once modified, import the compoments and functions into @nodes/registry.ts

// The file should be self explanatory.
// If you need help or have questions, feel free to reachout to me on X https://x.com/ankushKun_

// data field structure for react-node custom node
export interface data {
    name: string;
    ticker: string;
    totalSupply: number;
    denomination: number;
    logo: string;
    overwrite: boolean;
    tokenId?: string;
    respawn?: boolean;
}

// react flow node component
export function TokenNode(props: Node) {
    const { setAvailableNodes } = useGlobalState()

    // get code event
    useEffect(() => {
        const getCodeListener = ((e: CustomEvent) => {
            const me = e.detail.id == props.id
            if (!me) return

            const inputs = (e.detail.data || props.data) as data
            const { name, ticker, totalSupply, denomination, logo, overwrite } = inputs

            let code = token.init(
                name,
                ticker,
                denomination,
                totalSupply,
                logo,
                overwrite
            )
            e.detail.callback(code)
        }) as EventListener

        window.addEventListener("get-code", getCodeListener)
        return () => window.removeEventListener("get-code", getCodeListener)
    }, [props])

    const Icon = NodeIconMapping[props.type as TNodeType]
    return <NodeContainer {...props} onAddClick={() => setAvailableNodes(SubRootNodesAvailable)}>
        {Icon && <Icon size={30} strokeWidth={1} />}
        <div className="text-center">{keyToNode(props.type as TNodeType)}</div>
    </NodeContainer>
}

// react sidebar component that appears when a node is selected
export function TokenSidebar() {
    // input states according to node data (modify as needed)
    const [name, setName] = useState("")
    const [ticker, setTicker] = useState("")
    const [totalSupply, setTotalSupply] = useState(0)
    const [denomination, setDenomination] = useState(0)
    const [logo, setLogo] = useState("")
    const [overwrite, setOverwrite] = useState(false)
    const [respawn, setRespawn] = useState(false)
    const [tokenId, setTokenId] = useState<string>("")

    // necessary states
    const [runningCode, setRunningCode] = useState(false)
    const [outputId, setOutputId] = useState<string | null>(null)
    const [output, setOutput] = useState<string | null>(null)

    const { activeNode, activeProcess } = useGlobalState()

    // updates the data in sidebar when the node is selected
    useEffect(() => {
        if (!activeNode) return
        const nodeData = activeNode?.data as data
        setName(nodeData?.name || "")
        setTicker(nodeData?.ticker || "")
        setTotalSupply(nodeData?.totalSupply || 0)
        setDenomination(nodeData?.denomination || 0)
        setLogo(nodeData?.logo || "")
        setOverwrite(nodeData?.overwrite || false)
        setTokenId(nodeData?.tokenId || "")
        setRespawn(nodeData?.respawn || false)
    }, [activeNode?.id])

    useEffect(() => {
        const updateNodeDataListener = ((e: CustomEvent) => {
            if (e.detail.id == activeNode?.id) {
                const nodeData = e.detail.data as data
                if (nodeData.tokenId) {
                    setTokenId(nodeData.tokenId)
                    // @ts-ignore
                    setRespawn(nodeData.respawn)
                }
            }
        }) as EventListener
        window.addEventListener("update-node-data", updateNodeDataListener)

        return () => window.removeEventListener("update-node-data", updateNodeDataListener)
    }, [activeNode?.id])

    // updates the node data in localStorage when the input data updates
    useEffect(() => {
        if (!activeNode) return
        const newNodeData: data = { name, ticker, totalSupply, denomination, logo, overwrite, tokenId, respawn }
        activeNode.data = newNodeData
        updateNodeData(activeNode.id, newNodeData)
    }, [name, ticker, totalSupply, denomination, logo, overwrite, tokenId, respawn])

    function embed(inputs: data) {
        if (!inputs.logo)
            inputs.logo = "nHIO6wFuyEKZ03glfjbpFiKObP782Sp425q4akilT44"
        return getCode(activeNode?.id!, inputs)
    }


    return <div>
        <SmolText className="h-4 p-0 ml-4 mt-4">Token Process ID</SmolText>
        {
            tokenId ? (
                <pre className="text-sm w-fit pl-4 cursor-pointer text-left hover:scale-105 active:scale-95 transition-all duration-200 relative" onClick={(e) => {
                    navigator.clipboard.writeText(tokenId);
                    const popup = document.createElement('div');
                    popup.innerText = 'copied ;)';
                    const rect = e.currentTarget.getBoundingClientRect();
                    popup.style.cssText = `position:fixed;padding:0px;padding-left:8px;padding-right:8px;background:black;color:white;border-radius:4px;z-index:1000;left:${rect.left + rect.width / 2}px;top:${rect.top}px;transform:translate(-50%,-100%);opacity:0.7`;
                    document.body.appendChild(popup);
                    setTimeout(() => popup.remove(), 1000);
                }}>{tokenId}</pre>
            ) : (
                <pre className="text-sm pl-4 text-muted-foreground">token id not found, run this node to create a token</pre>
            )
        }

        <SmolText className="h-4 p-0 ml-4 mt-4">Name (string)</SmolText>
        <Input type="text" placeholder="Name of the token e.g. Points Coin" className="" value={name} onChange={(e) => setName(e.target.value)} />

        <SmolText className="h-4 p-0 ml-4 mt-4">Ticker (string)</SmolText>
        <Input type="text" placeholder="Short name of the token e.g. PNTS" className="" value={ticker} onChange={(e) => setTicker(e.target.value)} />

        <SmolText className="h-4 p-0 ml-4 mt-4">Total Supply (number)</SmolText>
        <Input
            placeholder="Total supply of the token e.g. 1000000"
            type="number"
            value={totalSupply}
            onChange={(e) => {
                if (Number(e.target.value) >= 1) setTotalSupply(Number(e.target.value))
                else setTotalSupply(1)
            }}
        />

        <SmolText className="h-4 p-0 ml-4 mt-4">Denomination (number)</SmolText>
        <Input
            placeholder="Number of decimals e.g. 12"
            type="number"
            value={denomination}
            onChange={(e) => {
                if (Number(e.target.value) >= 0) setDenomination(Number(e.target.value))
                else setDenomination(0)
            }}
        />

        <SmolText className="h-4 p-0 ml-4 mt-4">Logo (tx string)</SmolText>
        <Input type="text" placeholder="Logo of the token e.g. nHIO6wFuyEKZ03glfjbpFiKObP782Sp425q4akilT44" className="" value={logo} onChange={(e) => setLogo(e.target.value)} />

        <div className="flex items-center justify-start w-full px-4 mt-4">
            <div className="w-1/2 flex items-center justify-center gap-2">
                <SmolText className="h-4 p-0 mt-3 text-sm">Overwrite</SmolText>
                <Switch
                    className="mt-4"
                    checked={overwrite}
                    onCheckedChange={(checked) => {
                        if (checked) {
                            if (confirm("Are you sure you want to overwrite the token? This will update the token name, ticker, logo and denomination.")) {
                                setOverwrite(true);
                            }
                        } else {
                            setOverwrite(false);
                        }
                    }}
                />
            </div>

            <div className="w-1/2 flex items-center justify-center gap-2">
                <SmolText className="h-4 p-0 mt-3 text-sm">Respawn</SmolText>
                <Switch
                    className="mt-4"
                    checked={respawn}
                    onCheckedChange={(checked) => {
                        if (checked) {
                            if (confirm("Are you sure you want to respawn the token? This will create a new token process and replace the current one.")) {
                                setRespawn(true);
                            }
                        } else {
                            setRespawn(false);
                        }
                    }}
                />
            </div>
        </div>
        {
            overwrite && (
                <div className="text-destructive text-xs p-2 font-bold flex items-center justify-start gap-2 mt-4">
                    <AlertTriangle className="w-4 h-4 mx-2" /> Overwriting token will only update the token name, ticker, logo, and denomination.<br />(not recommended unless needed)
                </div>
            )
        }
        {
            respawn && (
                <div className="text-destructive text-xs p-2 font-bold flex items-center justify-start gap-2 mt-4">
                    <AlertTriangle className="w-4 h-4 mx-2" /> Respawning token will create a new token process and replace the current one.<br />(not recommended unless needed)
                </div>
            )
        }

        <pre className="text-xs mt-6 p-4 w-full overflow-y-scroll bg-muted border-y border-muted-foreground/30">
            {embed({ name, ticker, totalSupply, denomination, logo, overwrite })}
        </pre>
    </div>
}
