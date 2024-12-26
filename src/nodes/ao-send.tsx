import { Handle, Node, Position } from "@xyflow/react"
import { useGlobalState } from "@/hooks/useGlobalStore";
import { Tag } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Loader, MessageSquareShare, Play } from "lucide-react";
import { keyToNode } from ".";
import { TNodes } from ".";
import { useEffect, useState } from "react";
import { SmolText } from "@/components/right-sidebar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Button } from "@/components/ui/button";
import { toast } from "sonner";


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
    const { activeNode, runningNodes, successNodes, errorNodes } = useGlobalState()
    const data = props.data as unknown as data


    // order of preference for applying classes is selected > running > success > error
    const iAmSelected = activeNode?.id === props.id
    const iAmError = !!errorNodes.find(node => node.id == props.id)
    const iAmSuccess = !iAmError && !!successNodes.find(node => node.id == props.id)
    const iAmRunning = !iAmError && !iAmSuccess && !!runningNodes.find(node => node.id == props.id)
    // running - yellow
    // success - green
    // error - red
    // selected - blue  

    return <div data-selected={iAmSelected}
        data-running={iAmRunning}
        data-success={iAmSuccess}
        data-error={iAmError}

        className={cn(`bg-white border data-[selected=true]:!border-black p-2 border-black/30 rounded-md aspect-square cursor-pointer flex flex-col items-center justify-center w-28 h-28 relative`,
            `data-[running=true]:bg-yellow-50 data-[success=true]:bg-green-50 data-[error=true]:bg-red-50`,
            `data-[selected=true]:border-black data-[running=true]:border-yellow-500 data-[success=true]:border-green-500 data-[error=true]:border-red-500`,
        )}>
        {
            iAmRunning && <Loader className="absolute top-1 right-1 animate-spin" size={20} />
        }
        <MessageSquareShare size={30} strokeWidth={1} />
        <div className="text-center">{keyToNode(props.type as TNodes)}</div>
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
    </div>
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

    const { activeNode } = useGlobalState()

    useEffect(() => {
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
        const newTags = [...tags]
        newTags.splice(index, 1)
        setTags(newTags)
    }

    return <div className="flex flex-col gap-0.5">
        {/* inputs for handler name */}

        <div className="flex mt-4 items-end gap-1 justify-between h-5">
            <SmolText className="h-4 p-0 pl-2">Target</SmolText>
            <Select value={targetType as string} defaultValue="TEXT" onValueChange={(value) => setTargetType(value as InputTypes)}>
                <SelectTrigger className="rounded-none shadow-none border-0 text-xs h-4 p-0 pr-2 w-fit">
                    <SelectValue className="p-0" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="TEXT">Text</SelectItem>
                    <SelectItem value="VARIABLE">Variable</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <Input
            className=" bg-yellow-50 border-x-0"
            placeholder="Input Target"
            defaultValue={target.replaceAll('"', '')}
            value={target.replaceAll('"', '')}
            onChange={(e) => setTarget(e.target.value)}
        />

        <div className="flex mt-4 items-end gap-1 justify-between h-5">
            <SmolText className="h-4 p-0 pl-2">Action</SmolText>
            <Select value={actionType as string} defaultValue="TEXT" onValueChange={(value) => setActionType(value as InputTypes)}>
                <SelectTrigger className="rounded-none shadow-none border-0 text-xs h-4 p-0 pr-2 w-fit">
                    <SelectValue className="p-0" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="TEXT">Text</SelectItem>
                    <SelectItem value="VARIABLE">Variable</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <Input
            disabled={target.length <= 0}
            className=" bg-yellow-50 border-x-0"
            placeholder="Input Action"
            defaultValue={action.replaceAll('"', '')}
            value={action.replaceAll('"', '')}
            onChange={(e) => setAction(e.target.value)}
        />

        <div className="flex mt-4 items-end gap-1 justify-between h-5">
            <SmolText className="h-4 p-0 pl-2">Data</SmolText>
            <Select value={dataType as string} defaultValue="TEXT" onValueChange={(value) => setDataType(value as InputTypes)}>
                <SelectTrigger className="rounded-none shadow-none border-0 text-xs h-4 p-0 pr-2 w-fit">
                    <SelectValue className="p-0" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="TEXT">Text</SelectItem>
                    <SelectItem value="VARIABLE">Variable</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <Input
            disabled={target.length <= 0}
            className=" bg-yellow-50 border-x-0"
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
                <Select
                    value={tag.type as string} defaultValue="TEXT" onValueChange={(value) => setTags(tags.map((t, i) => i == index ? { ...t, type: value as InputTypes } : t))}>
                    <SelectTrigger className="rounded-none shadow-none border-0 text-xs h-4 p-0 pr-2 w-fit ml-auto">
                        <SelectValue className="p-0" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="TEXT">Text</SelectItem>
                        <SelectItem value="VARIABLE">Variable</SelectItem>
                    </SelectContent>
                </Select>

                <Input
                    data-error={tag.name.length <= 0}
                    className="bg-yellow-50 border-r data-[error=true]"
                    placeholder="Name"
                    value={tag.name}
                    onChange={(e) => setTags(tags.map((t, i) => i == index ? { ...t, name: e.target.value } : t))}
                />
                <Input
                    className="bg-yellow-50"
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
                className="bg-yellow-50 border-x-0 border-r"
                placeholder="Name"
                value={newTagKey}
                onChange={(e) => setNewTagKey(e.target.value)}
            />
            <Input
                className="bg-yellow-50"
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
        <div className="bg-yellow-50 p-2 text-xs border-y">
            <Button variant="link" className="text-muted-foreground w-full" onClick={() => toast("TODO")}>
                <Play size={20} /> Run Code
            </Button>
            <pre className="overflow-scroll">
                {embedSendFunction({ target, targetType, action, actionType, data, dataType, tags })}
            </pre>
        </div>

    </div>
}