import { Handle, Node, Position } from "@xyflow/react"
import { useGlobalState } from "@/hooks/useGlobalStore";
import { Tag } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Loader, MessageSquareShare, MousePointerClick, Play, RotateCwSquare } from "lucide-react";
import { keyToNode, NodeIconMapping } from "..";
import { TNodes } from "..";
import { useEffect, useState } from "react";
import { SmolText } from "@/components/right-sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { parseOutupt, runLua } from "@/lib/aos";
import Ansi from "ansi-to-react";
import Link from "next/link";
import NodeContainer from "../common/node";


// data field structure for react-node custom node
export interface data {
    target: string;
    targetType: InputTypes;
    action: string;
    actionType: InputTypes;
    data: string;
    dataType: InputTypes;
    tags: (Tag & { type: InputTypes })[];
}

// the handler add node for react-flow
export default function AOSendNode(props: Node) {
    const Icon = NodeIconMapping[props.type as TNodes]
    return <NodeContainer {...props} >
        {Icon && <Icon size={30} strokeWidth={1} />}
        <div className="text-center">{keyToNode(props.type as TNodes)}</div>
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
    </NodeContainer>


}

type SendFunctionInputs = {
    target: string;
    targetType: InputTypes;
    action: string;
    actionType: InputTypes;
    data: string;
    dataType: InputTypes;
    tags: (Tag & { type: InputTypes })[];
}

type InputTypes = "TEXT" | "VARIABLE"
export function embedSendFunction(inputs: SendFunctionInputs) {
    const { target, targetType, action, actionType, data, dataType, tags } = inputs

    const targetCode = targetType == "TEXT" ? `"${target}"` : `${target}`
    const actionCode = actionType == "TEXT" ? `"${action}"` : `${action}`
    const dataCode = dataType == "TEXT" ? `"${data}"` : `${data}`

    const tagsCode = tags.length > 0 ? tags.map(tag => `["${tag.name}"] = ${tag.type == "TEXT" ? `"${tag.value}"` : `${tag.value}`}`).join(",") : ""

    // strip first 8 lines of the code
    try {
        return (require("lua-format").Beautify(`Send({${target ? `Target = ${targetCode},` : ""}${action ? `Action = ${actionCode},` : ""}${data ? `Data = ${dataCode},` : ""}${tags.length > 0 ? `Tags = {${tagsCode}}` : ""}})
`, {
            RenameVariables: false,
            RenameGlobals: false,
            SolveMath: true
        }) as string).split("\n").slice(8).join("\n")
    } catch (e: any) {
        console.log(e.message)
        return e.message as string
    }
}


export function AOSendNodeSidebar() {
    const [targetType, setTargetType] = useState<InputTypes>("TEXT")
    const [target, setTarget] = useState("")
    const [actionType, setActionType] = useState<InputTypes>("TEXT")
    const [action, setAction] = useState("")
    const [dataType, setDataType] = useState<InputTypes>("TEXT")
    const [data, setData] = useState("")
    const [tags, setTags] = useState<(Tag & { type: InputTypes })[]>([])
    const [newTagKey, setNewTagKey] = useState("")
    const [newTagValue, setNewTagValue] = useState("")
    const [runningCode, setRunningCode] = useState(false)
    const [output, setOutput] = useState("")
    const [outputId, setOutputId] = useState("")

    const { activeNode, activeProcess, addOutput } = useGlobalState()

    useEffect(() => {
        if (!activeNode) return
        const nodeData = activeNode?.data as data
        setTarget(nodeData?.target || "")
        setAction(nodeData?.action || "")
        setData(nodeData?.data || "")
        setTags(nodeData?.tags || [])
        setTargetType(nodeData?.targetType || "TEXT")
        setActionType(nodeData?.actionType || "TEXT")
        setDataType(nodeData?.dataType || "TEXT")
    }, [activeNode?.id])

    useEffect(() => {
        console.log(target, action, data, tags)
        updateNodeData()
    }, [target, action, data, tags])

    function updateNodeData() {
        if (!activeNode) return
        const newNodeData: data = {
            target,
            targetType,
            action,
            actionType,
            data,
            dataType,
            tags
        }
        dispatchEvent(new CustomEvent("update-node-data", { detail: { id: activeNode?.id, data: newNodeData } }))
    }

    function discardChanges() {
        if (!activeNode) return
        const nodeData = activeNode?.data as data
        setTarget(nodeData?.target || "")
        setAction(nodeData?.action || "")
        setData(nodeData?.data || "")
        setTags(nodeData?.tags || [])
    }

    function addTag(type: InputTypes) {
        if (newTagKey && newTagValue) {
            setTags([...tags, { name: newTagKey, value: newTagValue, type: type }])
            setNewTagKey("")
            setNewTagValue("")
        }
    }

    function removeTag(index: number) {
        if (!activeNode) return
        const newTags = [...tags]
        newTags.splice(index, 1)
        setTags(newTags)
    }

    async function runSendMessage() {
        if (!activeNode) return
        const code = embedSendFunction({ target, targetType, action, actionType, data, dataType, tags })
        console.log("running", code)
        setRunningCode(true)
        setOutput("")
        setOutputId("")
        try {
            const result = await runLua(code, activeProcess)
            console.log(result)
            const resStr = parseOutupt(result)
            setOutput(resStr)
            setOutputId(result.id)
            // addOutput({ type: "output", message: `${resStr}`, preMessage: `[${activeNode?.id}]` })
        } catch (e: any) {
            setOutput(e.message)
            setOutputId("")
            // addOutput({ type: "error", message: `${e.message}`, preMessage: `[${activeNode?.id}]` })
        } finally {
            setRunningCode(false)
        }
    }

    type InputField = keyof Pick<data, "targetType" | "actionType" | "dataType">;

    function handleTypeToggle(
        currentType: InputTypes,
        setType: (type: InputTypes) => void,
        field: InputField
    ) {
        const newType = currentType === "TEXT" ? "VARIABLE" : "TEXT"
        setType(newType)
        if (!activeNode) return

        const newNodeData: data = {
            target,
            targetType,
            action,
            actionType,
            data,
            dataType,
            tags
        }
        newNodeData[field] = newType as any

        dispatchEvent(new CustomEvent("update-node-data", {
            detail: {
                id: activeNode.id,
                data: newNodeData
            }
        }))
    }

    return <div className="flex flex-col gap-0.5 h-full">
        {/* inputs for handler name */}

        <div className="flex mt-4 px-2 items-end gap-1 justify-between h-5">
            <SmolText className="h-4 p-0">Target</SmolText>
            <Button
                variant="outline"
                className="flex items-center justify-center gap-1 rounded-none relative top-0.5 !rounded-t m-0 text-xs h-5 p-0 px-1 w-fit hover:bg-secondary hover:text-secondary-foreground transition-colors border-b-0 border-dashed text-muted-foreground"
                onClick={() => handleTypeToggle(targetType, setTargetType, "targetType")}
            >
                {targetType === "TEXT" ? "Text" : "Variable"} <MousePointerClick size={8} strokeWidth={1} className="" />
            </Button>
        </div>

        <Input
            className=" bg-muted border-x-0"
            placeholder="Input Target"
            defaultValue={target.replaceAll('"', '')}
            value={target.replaceAll('"', '')}
            onChange={(e) => setTarget(e.target.value)}
        />

        <div className="flex mt-4 px-2 items-end gap-1 justify-between h-5">
            <SmolText className="h-4 p-0">Action</SmolText>
            <Button
                variant="outline"
                className="flex items-center justify-center gap-1 rounded-none relative top-0.5 !rounded-t m-0 text-xs h-5 p-0 px-1 w-fit hover:bg-secondary hover:text-secondary-foreground transition-colors border-b-0 border-dashed text-muted-foreground"
                onClick={() => handleTypeToggle(actionType, setActionType, "actionType")}
            >
                {actionType === "TEXT" ? "Text" : "Variable"} <MousePointerClick size={8} strokeWidth={1} className="" />
            </Button>
        </div>

        <Input
            disabled={target.length <= 0}
            className=" bg-muted border-x-0"
            placeholder="Input Action"
            defaultValue={action.replaceAll('"', '')}
            value={action.replaceAll('"', '')}
            onChange={(e) => setAction(e.target.value)}
        />

        <div className="flex mt-4 px-2 items-end gap-1 justify-between h-5">
            <SmolText className="h-4 p-0">Data</SmolText>
            <Button
                variant="outline"
                className="flex items-center justify-center gap-1 rounded-none relative top-0.5 !rounded-t m-0 text-xs h-5 p-0 px-1 w-fit hover:bg-secondary hover:text-secondary-foreground transition-colors border-b-0 border-dashed text-muted-foreground"
                onClick={() => handleTypeToggle(dataType, setDataType, "dataType")}
            >
                {dataType === "TEXT" ? "Text" : "Variable"} <MousePointerClick size={8} strokeWidth={1} className="" />
            </Button>
        </div>

        <Input
            disabled={target.length <= 0}
            className=" bg-muted border-x-0"
            placeholder="Input Data"
            defaultValue={data.replaceAll('"', '')}
            value={data.replaceAll('"', '')}
            onChange={(e) => setData(e.target.value)}
        />

        <SmolText className="mt-4">Tags</SmolText>
        {/* Existing tags */}
        {tags.map((tag, index) => (
            <div key={index} className="grid grid-cols-2 items-center justify-end">
                <div></div>
                <Button
                    variant="outline"
                    className="flex items-center justify-center gap-1 rounded-none relative right-2 !rounded-t m-0 text-xs h-5 p-0 px-1 w-fit hover:bg-secondary hover:text-secondary-foreground transition-colors border-b-0 border-dashed text-muted-foreground ml-auto"
                    onClick={() => setTags(tags.map((t, i) => i == index ? { ...t, type: t.type == "TEXT" ? "VARIABLE" : "TEXT" } : t))}
                >
                    {tag.type == "TEXT" ? "Text" : "Variable"} <MousePointerClick size={8} strokeWidth={1} className="" />
                </Button>

                <Input
                    data-error={tag.name.length <= 0}
                    className="bg-muted border-r data-[error=true]"
                    placeholder="Name"
                    value={tag.name}
                    onChange={(e) => setTags(tags.map((t, i) => i == index ? { ...t, name: e.target.value } : t))}
                />
                <Input
                    className="bg-muted"
                    value={tag.value}
                    onChange={(e) => setTags(tags.map((t, i) => i == index ? { ...t, value: e.target.value } : t))}
                />
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs rounded-none p-0 h-4 col-span-2"
                    onClick={() => removeTag(index)}
                >
                    remove
                </Button>
            </div>
        ))}

        {/* New tag input */}
        <div className="flex gap-0.5 items-center mt-2">
            <Input
                className="bg-muted border-x-0 border-r"
                placeholder="Name"
                value={newTagKey}
                onChange={(e) => setNewTagKey(e.target.value)}
            />
            <Input
                className="bg-muted"
                placeholder="Value"
                value={newTagValue}
                onChange={(e) => setNewTagValue(e.target.value)}
            />
            <Button
                variant="ghost"
                size="sm"
                className="text-lg rounded-none mr-0.5"
                onClick={() => addTag("TEXT")}
            >
                +
            </Button>
        </div>

        <SmolText className="h-4 p-0 pl-2 mt-4">Lua Code</SmolText>
        <div className="bg-muted p-2 text-xs border-y">
            <Button disabled={runningCode} variant="link" className="text-muted-foreground w-full" onClick={runSendMessage}>
                {runningCode ? <><Loader size={20} className="animate-spin" /> Running Code</> : <><Play size={20} /> Send Message</>}
            </Button>
            <pre className="overflow-scroll">
                {embedSendFunction({ target, targetType, action, actionType, data, dataType, tags })}
            </pre>
        </div>

        <SmolText className="h-4 p-0 pl-2 mt-4"><>Output {outputId && <Link className="ml-2 text-muted-foreground hover:underline" href={`https://ao.link/#/message/${outputId}`} target="_blank">ao.link</Link>}</></SmolText>
        <div className="bg-muted p-2 text-xs border-y">
            <pre className="overflow-scroll">
                <Ansi className="text-xs">{output || "..."}</Ansi>
            </pre>
        </div>

    </div>
}