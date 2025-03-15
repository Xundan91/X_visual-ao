import NodeContainer from "@/nodes/node";
import { Handle, Position } from "@xyflow/react";
import { keyToNode, Node, NodeIconMapping } from "@/nodes/index";
import { RootNodesAvailable, SubRootNodesAvailable } from "@/nodes/index/registry";
import { TNodeType } from "@/nodes/index/type";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useGlobalState } from "@/hooks/useGlobalStore";
import { InputTypes, SmolText, ToggleButton } from "@/components/right-sidebar";
import { Loader, LucideIcon, Play, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Ansi from "ansi-to-react";
import { parseOutupt, runLua } from "@/lib/aos";
import Link from "next/link";
import { getCode, getConnectedNodes, updateNodeData } from "@/lib/events";
import { CommonActions } from "@/lib/constants";
import { formatLua } from "@/lib/utils";
import SyntaxHighlighter from "@/components/syntax-highlighter";
import { useTheme } from "next-themes";

// This file should be copied and modified to create new nodes
// Copy inside @nodes/community and rename the file
// Once modified, import the compoments and functions into @nodes/registry.ts

// The file should be self explanatory.
// If you need help or have questions, feel free to reachout to me on X https://x.com/ankushKun_

// data field structure for react-node custom node
export interface data {
    name: string;
    action: string;
}

// react flow node component
export function HandlerNode(props: Node) {
    const { setAvailableNodes, toggleSidebar, setActiveNode, attach, setAttach } = useGlobalState()

    // get code event
    useEffect(() => {
        const getCodeListener = ((e: CustomEvent) => {
            const me = e.detail.id == props.id
            if (!me) return

            const inputs = (e.detail.data || props.data) as data

            // Create async function to handle code generation
            const generateCode = async () => {
                const connectedNodes = getConnectedNodes(props.id)
                let body = ""

                const iterateNode = async (node: any) => {
                    if (Array.isArray(node)) {
                        for (const n of node) {
                            await iterateNode(n)
                        }
                    } else {
                        const nodeCode = await getCode(node.id, node.data)
                        if (body.includes(`-- [start:${node.id}]`)) return
                        body += nodeCode
                    }
                }

                for (const node of connectedNodes) {
                    await iterateNode(node)
                }

                let code = `Handlers.add(
"${inputs.name}",
{ Action = "${inputs.action}" },
function(msg)
${body.length > 0 ? body : "-- Add nodes to the graph to add code here"}
end)
print("Handler ${inputs.name} added")
`

                code = `\n\n-- [start:${props.id}]\n${formatLua(code)}\n-- [end:${props.id}]\n`
                e.detail.callback(code)
            }

            // Execute the async code generation
            generateCode().catch(err => {
                console.error("Error generating code:", err)
                e.detail.callback("")
            })
        }) as EventListener

        window.addEventListener("get-code", getCodeListener)
        return () => window.removeEventListener("get-code", getCodeListener)
    }, [props])

    const Icon = NodeIconMapping[props.type as TNodeType]
    return <NodeContainer {...props} onAddClick={() => setAvailableNodes(SubRootNodesAvailable)}>
        {Icon && <Icon key={`icon-${props.id}`} size={30} strokeWidth={1} />}
        <div key={`label-${props.id}`} className="text-center">{keyToNode(props.type as TNodeType)}</div>
    </NodeContainer>
}

// react sidebar component that appears when a node is selected
export function HandlerSidebar() {
    // input states according to node data (modify as needed)
    const [name, setName] = useState("")
    const [action, setAction] = useState("")
    const [code, setCode] = useState("")

    // necessary states
    const [runningCode, setRunningCode] = useState(false)
    const [outputId, setOutputId] = useState<string | null>(null)
    const [output, setOutput] = useState<string | null>(null)

    const { activeNode, activeProcess } = useGlobalState()
    const { theme } = useTheme()
    // takes in input data and returns a string of lua code
    async function embed(inputs: data) {
        try {
            const code = await getCode(activeNode?.id!, inputs)
            setCode(code)
            return code
        } catch (err) {
            console.error("Error embedding code:", err)
            return ""
        }
    }

    // updates the data in sidebar when the node is selected
    useEffect(() => {
        if (!activeNode) return
        const nodeData = activeNode?.data as data
        setName(nodeData?.name || "")
        setAction(nodeData?.action || "")
    }, [activeNode?.id])

    // updates the node data in localStorage when the input data updates
    useEffect(() => {
        if (!activeNode) return
        const newNodeData: data = { name, action }
        activeNode.data = { ...newNodeData }
        updateNodeData(activeNode?.id, newNodeData)

        embed({ name, action }).then((code) => {
            setCode(code.trim())
        })
    }, [name, action, activeNode])


    return <div>
        <SmolText className="h-4 p-0 ml-4 mt-4">Name (string)</SmolText>
        <Input type="text" placeholder="Name of the handler" className="" value={name} onChange={(e) => setName(e.target.value)} />

        <SmolText className="h-4 p-0 ml-4 mt-4">Action (string)</SmolText>
        <Input type="text" placeholder="Action tag of the incoming message" className="mb-2" value={action} onChange={(e) => setAction(e.target.value)} />
        <div className="flex flex-wrap gap-1 px-2">
            {Object.entries(CommonActions).map(([key, value]) => (
                <Button
                    key={key}
                    data-active={action == value}
                    variant="ghost"
                    onClick={() => {
                        setAction(value)
                    }}
                    className="p-0 m-0 h-4 px-2 py-0.5 text-xs rounded-full border border-dashed border-muted-foreground/30 data-[active=true]:border-muted-foreground/100 data-[active=true]:bg-muted-foreground/10 data-[active=false]:text-muted-foreground/60 data-[active=false]:hover:bg-muted-foreground/5"
                >
                    {value}
                </Button>
            ))}
        </div>

        <SyntaxHighlighter code={code.trim()} theme={theme} />
    </div>

}