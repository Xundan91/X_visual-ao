import NodeContainer from "@/nodes/node";
import { Handle, Position } from "@xyflow/react";
import { keyToNode, Node, NodeIconMapping } from "@/nodes/index";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useGlobalState } from "@/hooks/useGlobalStore";
import { InputTypes, SmolText, ToggleButton } from "@/components/right-sidebar";
import { Loader, Minus, Play, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Ansi from "ansi-to-react";
import { parseOutupt, runLua } from "@/lib/aos";
import Link from "next/link";
import { SubRootNodesAvailable, TNodeType } from "./index/registry";
import { Tag } from "@/lib/types";
import { embed } from "./_template";
import { getCode, updateNodeData } from "@/lib/events";
import { formatLua, sanitizeVariableName } from "@/lib/utils";
import { CommonActions } from "@/lib/constants";

// This file should be copied and modified to create new nodes
// Copy inside @nodes/community and rename the file
// Once modified, import the compoments and functions into @nodes/registry.ts

// The file should be self explanatory.
// If you need help or have questions, feel free to reachout to me on X https://x.com/ankushKun_

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

// react flow node component
export function SendMessageNode(props: Node) {
    const { setAvailableNodes, toggleSidebar, attach, setAttach, setActiveNode } = useGlobalState()

    // get code event
    useEffect(() => {
        const getCodeListener = ((e: CustomEvent) => {
            const me = e.detail.id == props.id
            if (!me) return

            const inputs = (e.detail.data || props.data) as data
            const { target, targetType, action, actionType, data, dataType, tags } = inputs

            const targetCode = targetType == "TEXT" ? `"${target}"` : `${target}`
            const actionCode = actionType == "TEXT" ? `"${action}"` : `${action}`
            const dataCode = dataType == "TEXT" ? `"${data}"` : `${data}`
            const tagsCode = tags.length > 0 ? tags.map(tag => `["${tag.name}"] = ${tag.type == "TEXT" ? `"${tag.value}"` : `${tag.value}`}`).join(",") : ""

            let code = `Send({${target ? `Target = ${targetCode},` : ""}${action ? `Action = ${actionCode},` : ""}${data ? `Data = ${dataCode},` : ""}${tags.length > 0 ? `Tags = {${tagsCode}}` : ""}})`

            code = formatLua(code)
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
export function SendMessageSidebar() {
    // input states according to node data (modify as needed)
    const [target, setTarget] = useState("")
    const [targetType, setTargetType] = useState<InputTypes>("TEXT")
    const [action, setAction] = useState("")
    const [actionType, setActionType] = useState<InputTypes>("TEXT")
    const [data, setData] = useState("")
    const [dataType, setDataType] = useState<InputTypes>("TEXT")
    const [tags, setTags] = useState<(Tag & { type: InputTypes })[]>([])

    // necessary states
    const [runningCode, setRunningCode] = useState(false)
    const [outputId, setOutputId] = useState<string | null>(null)
    const [output, setOutput] = useState<string | null>(null)

    // Add these new state variables
    const [newTagKey, setNewTagKey] = useState("")
    const [newTagValue, setNewTagValue] = useState("")

    const { activeNode, activeProcess } = useGlobalState()

    // updates the data in sidebar when the node is selected
    useEffect(() => {
        if (!activeNode) return
        const nodeData = activeNode?.data as data
        setTarget(nodeData?.target || "")
        setTargetType(nodeData?.targetType || "TEXT")
        setAction(nodeData?.action || "")
        setActionType(nodeData?.actionType || "TEXT")
        setData(nodeData?.data || "")
        setDataType(nodeData?.dataType || "TEXT")
        setTags(nodeData?.tags || [])
    }, [activeNode?.id])

    // updates the node data in localStorage when the input data updates
    useEffect(() => {
        if (!activeNode) return
        const newNodeData: data = { target, targetType, action, actionType, data, dataType, tags }
        activeNode.data = newNodeData
        dispatchEvent(new CustomEvent("update-node-data", { detail: { id: activeNode?.id, data: newNodeData } }))
    }, [target, targetType, action, actionType, data, dataType, tags])

    // helper function to toggle the input type between text and variable
    // fields which can be toggled between text and variable
    type InputField = keyof Pick<data, "targetType" | "actionType" | "dataType">;
    function handleTypeToggle(
        currentType: InputTypes,
        setType: (type: InputTypes) => void,
        field: InputField
    ) {
        const newType = currentType === "TEXT" ? "VARIABLE" : "TEXT"
        setType(newType)

        if (!activeNode) return

        // If switching to variable type, sanitize the corresponding value
        let sanitizedValue = ""
        if (newType === "VARIABLE") {
            switch (field) {
                case "targetType":
                    sanitizedValue = sanitizeVariableName(target)
                    setTarget(sanitizedValue)
                    break
                case "actionType":
                    sanitizedValue = sanitizeVariableName(action)
                    setAction(sanitizedValue)
                    break
                case "dataType":
                    sanitizedValue = sanitizeVariableName(data)
                    setData(sanitizedValue)
                    break
            }
        }

        const newNodeData: data = {
            target: field === "targetType" ? sanitizedValue || target : target,
            targetType,
            action: field === "actionType" ? sanitizedValue || action : action,
            actionType,
            data: field === "dataType" ? sanitizedValue || data : data,
            dataType,
            tags
        }
        newNodeData[field] = newType

        updateNodeData(activeNode.id, newNodeData)
    }

    function addTag(type: InputTypes) {
        if (newTagKey && newTagValue) {
            setTags([...tags, { name: newTagKey, value: newTagValue, type }])
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

    function embed(inputs: data) {
        return getCode(activeNode?.id!, inputs)
    }


    return <div>
        <div className="flex items-end">
            <SmolText className="h-4 p-0 ml-4 mt-4">Target (string)</SmolText>
            <ToggleButton
                className="ml-auto mb-0.5 mr-4"
                nameType={targetType}
                onClick={() => handleTypeToggle(targetType, setTargetType, "targetType")}
            />
        </div>
        <Input type="text" placeholder="id of target to send message to"
            value={target}
            onChange={(e) => {
                if (targetType === "VARIABLE") {
                    const sanitized = sanitizeVariableName(e.target.value)
                    setTarget(sanitized)
                } else {
                    setTarget(e.target.value)
                }
            }} />

        <div className="flex items-end">
            <SmolText className="h-4 p-0 ml-4 mt-4">Action (string)</SmolText>
            <ToggleButton
                className="ml-auto mb-0.5 mr-4"
                nameType={actionType}
                onClick={() => handleTypeToggle(actionType, setActionType, "actionType")}
            />
        </div>
        <Input type="text" placeholder="Action tag of the outgoing message" value={action}
            onChange={(e) => {
                if (actionType === "VARIABLE") {
                    const sanitized = sanitizeVariableName(e.target.value)
                    setAction(sanitized)
                } else {
                    setAction(e.target.value)
                }
            }} />
        <div className="flex flex-wrap gap-1 px-2 mt-2">
            {Object.entries(CommonActions).map(([key, value]) => (
                <Button
                    key={key}
                    data-active={action == value}
                    variant="ghost"
                    onClick={() => { setAction(value); setActionType("TEXT") }}
                    className="p-0 m-0 h-4 px-2 py-0.5 text-xs rounded-full border border-dashed border-muted-foreground/30 data-[active=true]:border-muted-foreground/100 data-[active=true]:bg-muted-foreground/10 data-[active=false]:text-muted-foreground/60 data-[active=false]:hover:bg-muted-foreground/5"
                >
                    {value}
                </Button>
            ))}
        </div>

        <div className="flex items-end">
            <SmolText className="h-4 p-0 ml-4 mt-4">Data (string)</SmolText>
            <ToggleButton
                className="ml-auto mb-0.5 mr-4"
                nameType={dataType}
                onClick={() => handleTypeToggle(dataType, setDataType, "dataType")}
            />
        </div>
        <Input type="text" placeholder="Data to send to the target" value={data}
            onChange={(e) => {
                if (dataType === "VARIABLE") {
                    const sanitized = sanitizeVariableName(e.target.value)
                    setData(sanitized)
                } else {
                    setData(e.target.value)
                }
            }} />

        <SmolText className="h-4 p-0 ml-4 relative top-5">Tags ({`{TagName = "TagValue"}`})</SmolText>
        {/* Existing tags */}
        {tags.map((tag, index) => (
            <div key={index} className="grid grid-cols-2 items-center justify-center gap-0">
                <div></div>
                <ToggleButton
                    className="ml-auto mr-14 mb-0.5"
                    nameType={tag.type}
                    onClick={() => setTags(tags.map((t, i) => {
                        if (i === index) {
                            const newType = t.type === "TEXT" ? "VARIABLE" : "TEXT"
                            // Sanitize value when switching to VARIABLE type
                            const newValue = newType === "VARIABLE" ? sanitizeVariableName(t.value) : t.value
                            return { ...t, type: newType, value: newValue }
                        }
                        return t
                    }))}
                />
                <div className="flex items-center col-span-2">
                    <Input
                        data-error={tag.name.length <= 0}
                        className=""
                        placeholder="TagName"
                        value={tag.name}
                        onChange={(e) => setTags(tags.map((t, i) =>
                            i === index ? { ...t, name: e.target.value } : t
                        ))}
                    />
                    <Input
                        className=""
                        placeholder="TagValue"
                        value={tag.value}
                        onChange={(e) => {
                            if (tag.type === "VARIABLE") {
                                const sanitized = sanitizeVariableName(e.target.value)
                                setTags(tags.map((t, i) =>
                                    i === index ? { ...t, value: sanitized } : t
                                ))
                            } else {
                                setTags(tags.map((t, i) =>
                                    i === index ? { ...t, value: e.target.value } : t
                                ))
                            }
                        }}
                    />
                    <Button
                        variant="ghost"
                        className="p-0 rounded-none border mx-0.5 aspect-square w-9 h-9 bg-white/50 hover:bg-white transition-colors"
                        onClick={() => removeTag(index)}
                    >
                        <Minus size={22} className="m-0 p-0 w-full h-full" />
                    </Button>
                </div>
            </div>
        ))}

        <SmolText className="h-4 p-0 ml-4 mt-4">Add New Tag</SmolText>
        {/* New tag input */}
        <div className="flex items-center">
            <Input
                className=""
                placeholder="TagName"
                value={newTagKey}
                onChange={(e) => setNewTagKey(e.target.value)}
            />
            <Input
                className=""
                placeholder="TagValue"
                value={newTagValue}
                onChange={(e) => setNewTagValue(e.target.value)}
            />
            <Button
                variant="ghost"
                className="p-0 rounded-none border mx-0.5 aspect-square w-9 h-9 bg-white/50 hover:bg-white transition-colors"
                onClick={() => addTag("TEXT")}
            >
                <Plus size={22} className="m-0 p-0 w-full h-full" />
            </Button>
        </div>

        <pre className="text-xs mt-6 p-4 w-full overflow-y-scroll bg-muted border-y border-muted-foreground/30">
            {embed({ target, action, data, tags, targetType, actionType, dataType })}
        </pre>
    </div>
}
