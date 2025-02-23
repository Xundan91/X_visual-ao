import NodeContainer from "@/nodes/node";
import { Handle, Position } from "@xyflow/react";
import { keyToNode, Node, NodeIconMapping } from "@/nodes/index";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useGlobalState } from "@/hooks/useGlobalStore";
import { InputTypes, SmolText, ToggleButton } from "@/components/right-sidebar";
import { Loader, Play, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Ansi from "ansi-to-react";
import { parseOutupt, runLua } from "@/lib/aos";
import Link from "next/link";
import { SubRootNodesAvailable, TNodeType } from "./index/registry";

// This file should be copied and modified to create new nodes
// Copy inside @nodes/community and rename the file
// Once modified, import the compoments and functions into @nodes/registry.ts

// The file should be self explanatory.
// If you need help or have questions, feel free to reachout to me on X https://x.com/ankushKun_

// data field structure for react-node custom node
export interface data {
    name: string;
    nameType: InputTypes;
}

// takes in input data and returns a string of lua code
export function embed(inputs: data) {
    return `print(${inputs.nameType == "TEXT" ? `"${inputs.name}"` : inputs.name})`
}

// react flow node component
export function SendMessageNode(props: Node) {
    const { setAvailableNodes, toggleSidebar, attach, setAttach, setActiveNode } = useGlobalState()

    const Icon = NodeIconMapping[props.type as TNodeType]
    return <NodeContainer {...props} onAddClick={() => setAvailableNodes(SubRootNodesAvailable)}>
        {Icon && <Icon size={30} strokeWidth={1} />}
        <div className="text-center">{keyToNode(props.type as TNodeType)}</div>
    </NodeContainer>
}

// react sidebar component that appears when a node is selected
export function SendMessageSidebar() {
    // input states according to node data (modify as needed)
    const [name, setName] = useState("")
    const [nameType, setNameType] = useState<InputTypes>("TEXT")

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
        setNameType(nodeData?.nameType || "TEXT")
    }, [activeNode?.id])

    // updates the node data in localStorage
    function updateNodeData() {
        if (!activeNode) return
        const newNodeData: data = { name, nameType }
        activeNode.data = newNodeData
        dispatchEvent(new CustomEvent("update-node-data", { detail: { id: activeNode?.id, data: newNodeData } }))
    }

    // updates the node data in localStorage when the input data updates
    useEffect(() => {
        updateNodeData()
    }, [name, nameType])

    // helper function to toggle the input type between text and variable
    // fields which can be toggled between text and variable
    type InputField = keyof Pick<data, "nameType">;
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
            nameType,
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
    async function runTemplate() {
        setRunningCode(true)
        const code = embed({ name, nameType })
        console.log("running", code)
        try {
            const result = await runLua(code, activeProcess)
            setOutput(parseOutupt(result))
            setOutputId(result.id)
        } catch (e: any) {
            setOutput(e.message)
        } finally {
            setRunningCode(false)
        }
    }


    return <div>
        <div className="flex mt-4 px-2 items-end gap-1 justify-between h-5">
            <SmolText className="h-4 p-0">Name</SmolText>
            <ToggleButton className="mb-0.5" nameType={nameType} onClick={() => handleTypeToggle(nameType, setNameType, "nameType")} />
        </div>
        <Input type="text" className="border-y border-x-0 bg-muted" value={name} onChange={(e) => setName(e.target.value)} />

        <SmolText className="h-4 p-0 pl-2 mt-4">Lua Code</SmolText>
        <div className="bg-muted p-2 text-xs border-y">
            <Button disabled={runningCode} variant="link" className="text-muted-foreground w-full" onClick={runTemplate}>
                {runningCode ? <><Loader size={20} className="animate-spin" /> Running Code</> : <><Play size={20} /> Run Template</>}
            </Button>
            <pre className="overflow-scroll">
                {embed({ name, nameType })}
            </pre>
        </div>

        <SmolText className="h-4 p-0 pl-2 mt-4"><>Output {outputId && <Link className="ml-2 text-muted-foreground hover:underline" href={`https://ao.link/#/message/${outputId}`} target="_blank">ao.link</Link>}</></SmolText>
        <div className="bg-muted p-2 text-xs border-y">
            <pre className="overflow-scroll">
                {output ? <Ansi className="text-xs">{output}</Ansi> : <div className="text-muted-foreground">...</div>}
            </pre>
        </div>

        <div className="text-destructive text-xs p-2 mt-4">
            This is a sample template meant for developers to be used to create new nodes.<br /><br />
            Copy @nodes/common/_template.tsx to create your own node.<br /><br />
            Once modified, import the compoments and functions into @nodes/registry.ts
        </div>
    </div>
}
