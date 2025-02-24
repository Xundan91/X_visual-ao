import NodeContainer from "@/nodes/node";
import { Handle, Position } from "@xyflow/react";
import { keyToNode, Node, NodeIconMapping } from "@/nodes/index";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useGlobalState } from "@/hooks/useGlobalStore";
import { InputTypes, SmolText, ToggleButton } from "@/components/right-sidebar";
import { Loader, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import Ansi from "ansi-to-react";
import { parseOutupt, runLua } from "@/lib/aos";
import Link from "next/link";
import { SubRootNodesAvailable, TNodeType } from "./index/registry";
import { getCode, updateNodeData } from "@/lib/events";
import { formatLua, sanitizeVariableName } from "@/lib/utils";

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

// react flow node component
export function TemplateNode(props: Node) {
    const { setAvailableNodes } = useGlobalState()

    // get code event
    useEffect(() => {
        const getCodeListener = ((e: CustomEvent) => {
            const me = e.detail.id == props.id
            if (!me) return

            const inputs = (e.detail.data || props.data) as data

            // Create async function to handle code generation
            const generateCode = async () => {
                const { name, nameType } = inputs
                const code = formatLua(`print(${nameType == "TEXT" ? `"${name}"` : name})`)
                return code
            }

            // Execute the async code generation
            generateCode()
                .then(code => e.detail.callback(code))
                .catch(err => {
                    console.error("Error generating code:", err)
                    e.detail.callback("")
                })
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
export function TemplateSidebar() {
    // input states according to node data (modify as needed)
    const [name, setName] = useState("")
    const [nameType, setNameType] = useState<InputTypes>("TEXT")
    const [code, setCode] = useState("")

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

    // updates the node data in localStorage when the input data updates
    useEffect(() => {
        if (!activeNode) return
        const newNodeData: data = { name, nameType }
        activeNode.data = newNodeData
        updateNodeData(activeNode.id, newNodeData)

        embed(newNodeData).then((code) => {
            setCode(code)
        })
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

        if (!activeNode) return

        // If switching to variable type, sanitize the value
        let sanitizedValue = ""
        if (newType === "VARIABLE") {
            sanitizedValue = sanitizeVariableName(name)
            setName(sanitizedValue)
        }

        const newNodeData: data = {
            name: sanitizedValue || name,
            nameType: newType
        }

        updateNodeData(activeNode.id, newNodeData)
    }

    // takes in input data and returns a string of lua code via promise
    function embed(inputs: data) {
        return new Promise<string>(async (resolve) => {
            try {
                const code = await getCode(activeNode?.id!, inputs)
                setCode(code)
                resolve(code)
            } catch (err) {
                console.error("Error embedding code:", err)
                resolve("")
            }
        })
    }

    // runs the template code and displays the output
    async function runTemplate() {
        setRunningCode(true)
        try {
            const codeToRun = await embed({ name, nameType })
            console.log("running", codeToRun)
            const result = await runLua(codeToRun, activeProcess)
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
            <ToggleButton
                className="mb-0.5"
                nameType={nameType}
                onClick={() => handleTypeToggle(nameType, setNameType, "nameType")}
            />
        </div>
        <Input
            type="text"
            className="border-y border-x-0 bg-muted"
            value={name}
            onChange={(e) => {
                if (nameType === "VARIABLE") {
                    const sanitized = sanitizeVariableName(e.target.value)
                    setName(sanitized)
                } else {
                    setName(e.target.value)
                }
            }}
        />

        <SmolText className="h-4 p-0 pl-2 mt-4">Lua Code</SmolText>
        <div className="bg-muted p-2 text-xs border-y">
            <Button disabled={runningCode} variant="link" className="text-muted-foreground w-full" onClick={runTemplate}>
                {runningCode ? <><Loader size={20} className="animate-spin" /> Running Code</> : <><Play size={20} /> Run Template</>}
            </Button>
            <pre className="overflow-scroll">
                {code}
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
