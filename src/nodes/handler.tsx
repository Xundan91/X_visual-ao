import NodeContainer from "@/nodes/node";
import { Handle, Position } from "@xyflow/react";
import { keyToNode, Node, NodeIconMapping } from "@/nodes/index";
import { RootNodesAvailable, SubRootNodesAvailable, TNodeType } from "@/nodes/index/registry";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useGlobalState } from "@/hooks/useGlobalStore";
import { InputTypes, SmolText, ToggleButton } from "@/components/right-sidebar";
import { Loader, Play, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Ansi from "ansi-to-react";
import { parseOutupt, runLua } from "@/lib/aos";
import Link from "next/link";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { getConnectedNodes, updateNodeData } from "@/lib/events";

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

const commonActions = {
    "Info": "Info",
    "Credit-Notice": "Credit-Notice",
    "Debit-Notice": "Debit-Notice",
    "Balance": "Balance",
}

// react flow node component
export function HandlerNode(props: Node) {
    const { setAvailableNodes, toggleSidebar, setActiveNode, attach, setAttach } = useGlobalState()

    const Icon = NodeIconMapping[props.type as TNodeType]
    return <NodeContainer {...props} onAddClick={() => setAvailableNodes(SubRootNodesAvailable)}>
        {Icon && <Icon size={30} strokeWidth={1} />}
        <div className="text-center">{keyToNode(props.type as TNodeType)}</div>
    </NodeContainer>
}

// react sidebar component that appears when a node is selected
export function HandlerSidebar() {
    // input states according to node data (modify as needed)
    const [name, setName] = useState("")
    const [action, setAction] = useState("")

    // necessary states
    const [runningCode, setRunningCode] = useState(false)
    const [outputId, setOutputId] = useState<string | null>(null)
    const [output, setOutput] = useState<string | null>(null)

    const { activeNode, activeProcess } = useGlobalState()

    // takes in input data and returns a string of lua code
    function embed(inputs: data) {
        // list of nodes connected to this handler node
        const connectedNodes = getConnectedNodes(activeNode?.id!)

        console.dir(connectedNodes, { depth: null })

        return `Handlers.add(
    "${inputs.name}",
    { Action = "${inputs.action}" },
    function(msg)
        -- Add nodes to the graph to add code here
        ${connectedNodes.length}
    end
)`
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
    }, [name, action, activeNode])

    // helper function to toggle the input type between text and variable
    // fields which can be toggled between text and variable
    type InputField = keyof Pick<data, "name">;
    function handleTypeToggle(
        currentType: InputTypes,
        setType: (type: InputTypes) => void,
        field: InputField
    ) {
        const newType = currentType === "TEXT" ? "VARIABLE" : "TEXT"
        setType(newType)

        // This could possibly be removed, but I'm not sure, best to keep this to ensure the node data is updated
        if (!activeNode) return

        const newNodeData: data = {
            name,
            action
        }
        newNodeData[field] = newType

        dispatchEvent(new CustomEvent("update-node-data", {
            detail: {
                id: activeNode.id,
                data: newNodeData
            }
        }))
    }

    // runs the template code and displays the output
    async function run() {
        setRunningCode(true)
        // const code = embed({ name, action })
        // console.log("running", code)
        try {

            // const result = await runLua(code, activeProcess)
            // setOutput(parseOutupt(result))
            // setOutputId(result.id)
        } catch (e: any) {
            // setOutput(e.message)
        } finally {
            setRunningCode(false)
        }
    }


    return <div>
        <SmolText className="h-4 p-0 ml-4 mt-4">Name</SmolText>
        <Input type="text" placeholder="Name of the handler" className="" value={name} onChange={(e) => setName(e.target.value)} />

        <SmolText className="h-4 p-0 ml-4 mt-4">Action</SmolText>
        <Input type="text" placeholder="Action tag of the incoming message" className="mb-2" value={action} onChange={(e) => setAction(e.target.value)} />
        <div className="flex flex-wrap gap-1 px-2">
            {Object.entries(commonActions).map(([key, value]) => (
                <Button
                    key={key}
                    data-active={action == value}
                    variant="ghost"
                    onClick={() => setAction(value)}
                    className="p-0 m-0 h-4 px-2 py-0.5 text-xs rounded-full border border-dashed border-muted-foreground/30 data-[active=true]:border-muted-foreground/100 data-[active=true]:bg-muted-foreground/10 data-[active=false]:text-muted-foreground/60 data-[active=false]:hover:bg-muted-foreground/5"
                >
                    {value}
                </Button>
            ))}
        </div>

        <pre className="text-xs mt-6 p-4 w-full overflow-scroll bg-muted border-y border-muted-foreground/30">
            {embed({ name, action })}
        </pre>
        {/* <SmolText className="h-4 p-0 pl-2 mt-4">Lua Code</SmolText>
        <div className="bg-muted p-2 text-xs border-y">
            <Button disabled={runningCode} variant="link" className="text-muted-foreground w-full" onClick={run}>
                {runningCode ? <><Loader size={20} className="animate-spin" /> Running Code</> : <><Play size={20} /> Run Template</>}
            </Button>
            <pre className="overflow-scroll">
                {embed({ name })}
            </pre>
        </div> */}

        {/* <SmolText className="h-4 p-0 pl-2 mt-4"><>Output {outputId && <Link className="ml-2 text-muted-foreground hover:underline" href={`https://ao.link/#/message/${outputId}`} target="_blank">ao.link</Link>}</></SmolText>
        <div className="bg-muted p-2 text-xs border-y">
            <pre className="overflow-scroll">
                {output ? <Ansi className="text-xs">{output}</Ansi> : <div className="text-muted-foreground">...</div>}
            </pre>
        </div> */}
    </div>

}