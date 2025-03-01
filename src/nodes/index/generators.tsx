import { FC, useEffect, useReducer, useState } from "react";
import NodeContainer, { NodeContainerProps } from "../node";
import { NodeConfig } from "./registry";
import { keyToNode, Node } from ".";
import { TNodeData, TNodeType } from "./type";
import { FileQuestion, Repeat } from "lucide-react";
import { NodeIconMapping } from ".";
import { Input } from "@/components/ui/input";
import { SmolText, ToggleButton } from "@/components/right-sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatLua, sanitizeVariableName } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { getCode, getConnectedNodes, updateNodeData } from "@/lib/events";
import { useGlobalState } from "@/hooks/useGlobalStore";
import { Button } from "@/components/ui/button";

export function GenerateNode(node: NodeConfig) {

    const NodeComponent: FC<any> = (props: NodeContainerProps) => {

        // get code event
        useEffect(() => {
            const getCodeListener = ((e: CustomEvent) => {
                const me = e.detail.id == props.id;
                if (!me) return;

                const inputs = (e.detail.data || props.data) as Record<string, any>;

                // Create async function to handle code generation
                const generateCode = async () => {
                    const connectedNodes = getConnectedNodes(props.id);
                    let body = "";

                    const iterateNode = async (node: any) => {
                        if (Array.isArray(node)) {
                            for (const n of node) {
                                await iterateNode(n);
                            }
                        } else {
                            const nodeCode = await getCode(node.id, node.data);
                            if (!body.includes(`-- [start:${node.id}]`)) {
                                body += nodeCode;
                            }
                        }
                    };

                    for (const node of connectedNodes) {
                        await iterateNode(node);
                    }

                    let code = "";
                    if (node.codeGenerator) {
                        const inputsClone = { ...inputs };
                        Object.keys(inputsClone).forEach(key => {
                            if (inputsClone[`${key}Type`] == "VARIABLE") {
                                inputsClone[key] = sanitizeVariableName(`${inputsClone[key]}`);
                            }
                        });

                        code = node.codeGenerator(inputsClone as TNodeData);
                    } else {
                        code = "-- there is no code generator for this node";
                    }
                    code = `\n\n-- [start:${props.id}]\n${formatLua(code)}\n-- [end:${props.id}]\n\n${(formatLua(body))}`

                    e.detail.callback(code);
                };

                // Execute the async code generation
                generateCode().catch(err => {
                    console.error("Error generating code:", err);
                    e.detail.callback("");
                });
            }) as EventListener;

            window.addEventListener("get-code", getCodeListener);
            return () => window.removeEventListener("get-code", getCodeListener);
        }, [props]);

        const Icon = NodeIconMapping[props.type as TNodeType];
        return <NodeContainer {...props} >
            {Icon ? <Icon size={30} strokeWidth={1} /> : <FileQuestion size={30} strokeWidth={1} />}
            <div className="text-center">{keyToNode(props.type as TNodeType) || "Loop"}</div>
        </NodeContainer>
    }
    return NodeComponent;
}

export function GenerateSidebar(node_: NodeConfig) {
    const SidebarComponent: FC<any> = () => {
        const { activeNode } = useGlobalState()
        const [nodeData, setNodeData] = useState<Record<string, any>>({});
        const [code, setCode] = useState<string>("");

        const hasInputs = Object.keys(node_.inputs || {}).length > 0;

        useEffect(() => {
            if (!activeNode) return;
            // Initialize nodeData with default values for all inputs
            const initialData: Record<string, any> = {};
            if (node_.inputs) {
                Object.keys(node_.inputs).forEach((input) => {
                    // Use type assertion since we know the structure
                    initialData[input] = (activeNode.data as Record<string, any>)?.[input] || "";
                    initialData[`${input}Type`] = (activeNode.data as Record<string, any>)?.[`${input}Type`] || "TEXT";
                });
            }
            setNodeData(initialData);
            embed(initialData)
        }, []);

        useEffect(() => {
            if (!activeNode) return;
            updateNodeData(activeNode.id, nodeData);
            embed(nodeData)
        }, [nodeData, activeNode]);

        type InputTypes = "TEXT" | "VARIABLE";
        type InputField = string;
        function handleTypeToggle(
            currentType: InputTypes,
            field: InputField,
            value: string
        ) {
            const newType = currentType === "TEXT" ? "VARIABLE" : "TEXT";

            // If switching to variable type, sanitize the value
            let sanitizedValue = value;
            if (newType === "VARIABLE") {
                sanitizedValue = sanitizeVariableName(value);
            }

            setNodeData(prev => ({
                ...prev,
                [field]: sanitizedValue,
                [`${field}Type`]: newType
            }));
        }

        // takes in input data and returns a string of lua code via promise
        function embed(inputs: Record<string, any>) {
            return new Promise<string>(async (resolve) => {
                try {
                    const code = await getCode(activeNode?.id!, inputs);
                    setCode(code.trim());
                    resolve(code);
                } catch (err) {
                    console.error("Error embedding code:", err);
                    resolve("");
                }
            });
        }

        return <div>
            {hasInputs && Object.keys(node_.inputs!).map((input) => {
                const inputConfig = node_.inputs![input];

                return <div key={input} className="mt-4">
                    {inputConfig.input === "normal" && (
                        <>
                            <div className="flex items-end">
                                <SmolText className="h-4 p-0 ml-4">{inputConfig.label}</SmolText>
                                {inputConfig.showVariableToggle && (
                                    <ToggleButton
                                        className="ml-auto mb-0.5 mr-4"
                                        nameType={nodeData[`${input}Type`] || "TEXT"}
                                        onClick={() => handleTypeToggle(
                                            nodeData[`${input}Type`] || "TEXT",
                                            input,
                                            nodeData[input] || ""
                                        )}
                                    />
                                )}
                            </div>
                            <Input
                                type={inputConfig.type == "number" ? "number" : "text"}
                                placeholder={inputConfig.placeholder || ""}
                                value={nodeData[input] || ""}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const type = nodeData[`${input}Type`] || "TEXT";

                                    if (type === "VARIABLE") {
                                        const sanitized = sanitizeVariableName(value);
                                        setNodeData(prev => ({ ...prev, [input]: sanitized }));
                                    } else {
                                        setNodeData(prev => ({ ...prev, [input]: value }));
                                    }
                                }}
                            />
                            {inputConfig.values && (
                                <div className="flex items-center gap-1 ml-3 mt-1 text-xs text-muted-foreground">
                                    {inputConfig.values.map((value) => (
                                        <Button
                                            key={value}
                                            data-active={nodeData[input] == value}
                                            variant="ghost"
                                            onClick={() => {
                                                setNodeData(prev => ({ ...prev, [input]: value }));
                                            }}
                                            className="p-0 m-0 h-4 px-2 py-0.5 text-xs rounded-full border border-dashed border-muted-foreground/30 data-[active=true]:border-muted-foreground/100 data-[active=true]:bg-muted-foreground/10 data-[active=false]:text-muted-foreground/60 data-[active=false]:hover:bg-muted-foreground/5"
                                        >
                                            {value}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {inputConfig.input === "dropdown" && (
                        <>
                            <div className="flex items-end">
                                <SmolText className="h-4 p-0 ml-4">{inputConfig.label}</SmolText>
                            </div>
                            <Select
                                value={nodeData[input] || ""}
                                onValueChange={(value) => setNodeData((prev) => ({
                                    ...prev,
                                    [input]: value
                                }))}
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder={inputConfig.placeholder || ""} />
                                </SelectTrigger>
                                <SelectContent>
                                    {inputConfig.values?.map((value) => (
                                        <SelectItem key={value} value={value}>
                                            {value}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </>
                    )}

                    {inputConfig.input === "checkbox" && (
                        <div className="flex items-center justify-start gap-2 ml-4">
                            <SmolText className="h-4 p-0 text-sm">{inputConfig.label}</SmolText>
                            <Switch
                                className="mt-0.5"
                                checked={nodeData[input] || false}
                                onCheckedChange={(checked) => {
                                    setNodeData(prev => ({
                                        ...prev,
                                        [input]: checked,
                                        [`${input}Type`]: "VARIABLE"
                                    }));
                                }}
                            />
                        </div>

                    )}
                </div>
            })}
            <pre className="text-xs mt-6 p-4 w-full overflow-y-scroll bg-muted border-y border-muted-foreground/30">
                {formatLua(code)}
            </pre>
        </div>
    }
    return SidebarComponent;
}