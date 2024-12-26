import { Handle, Node, Position } from "@xyflow/react"
import { useGlobalState } from "@/hooks/useGlobalStore";
import { Tag } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Loader, MessageSquareShare } from "lucide-react";
import { keyToNode } from ".";
import { TNodes } from ".";
import { useEffect, useState } from "react";
import { SmolText } from "@/components/right-sidebar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"


// data field structure for react-node custom node
export interface data {
    target: string;
    action: string;
    data: string;
    tags: Tag[];
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

type InputTypes = "TEXT" | "VARIABLE"
export function AOSendNodeSidebar() {
    const [targetType, setTargetType] = useState<InputTypes>("TEXT")
    const [target, setTarget] = useState("")
    const [actionType, setActionType] = useState<InputTypes>("TEXT")
    const [action, setAction] = useState("")
    const [dataType, setDataType] = useState<InputTypes>("TEXT")
    const [data, setData] = useState("")
    const [tags, setTags] = useState<Tag[]>([])

    const { activeNode } = useGlobalState()

    useEffect(() => {
        const nodeData = activeNode?.data as data
        setTarget(nodeData?.target || "")
        setAction(nodeData?.action || "")
        setData(nodeData?.data || "")
        setTags(nodeData?.tags || [])
    }, [activeNode?.id])

    useEffect(() => {
        console.log(target, action, data, tags)
        updateNodeData()
    }, [target, action, data, tags])


    function valueFromType(value: string, type: InputTypes) {
        if (type == "TEXT") {
            return `"${value}"`
        } else {
            return value
        }
    }

    function updateNodeData() {
        const newNodeData: data = {
            target,
            action,
            data,
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
            onChange={(e) => setTarget(valueFromType(e.target.value, targetType))}
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
            onChange={(e) => setAction(valueFromType(e.target.value, actionType))}
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
            disabled={action.length <= 0}
            className=" bg-yellow-50 border-x-0"
            placeholder="Input Data"
            defaultValue={data.replaceAll('"', '')}
            value={data.replaceAll('"', '')}
            onChange={(e) => setData(valueFromType(e.target.value, dataType))}
        />


    </div>
}