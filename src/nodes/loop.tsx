import NodeContainer from "@/nodes/node";
import { Handle, Position } from "@xyflow/react";
import { keyToNode, Node, NodeIconMapping } from "@/nodes/index";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useGlobalState } from "@/hooks/useGlobalStore";
import { InputTypes, SmolText, ToggleButton } from "@/components/right-sidebar";
import { Loader, Play, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import Ansi from "ansi-to-react";
import { parseOutupt, runLua } from "@/lib/aos";
import Link from "next/link";
import { SubRootNodesAvailable } from "./index/registry";
import { TNodeType } from "./index/type";
import { getCode, getConnectedNodes, removeEdge, addEdge, TConnectedNodes, updateNodeData } from "@/lib/events";
import { formatLua, sanitizeVariableName } from "@/lib/utils";
import SyntaxHighlighter from "@/components/syntax-highlighter";
import { useTheme } from "next-themes";

// Common values for loop inputs
const CommonValues = {
    "not done": "not done",
    "x < retries": "x < retries",
    "x < #array": "x < #array",
};

// data field structure for react-node custom node
export interface data {
    loopType: "condition" | "range" | "iterator";
    condition: string;
    startIndex: number;
    endIndex: number;
    stepValue: number;
    iteratorVariable: string;
}

// react flow node component
export function LoopNode(props: Node) {
    const { setAvailableNodes } = useGlobalState();
    const [lastNode, setLastNode] = useState<Node>();

    useEffect(() => {
        const walkNode = (node: TConnectedNodes) => {
            if (Array.isArray(node)) {
                for (const n of node) {
                    console.log("walking node", n);
                    walkNode(n as TConnectedNodes);
                }
            } else {
                setLastNode(node);
            }
        }

        function getLastNode() {
            const connectedNodes = getConnectedNodes(props.id);
            console.log("connected nodes", connectedNodes);
            if (connectedNodes.length > 0) {
                walkNode(connectedNodes);
            }
        }

        window.addEventListener("update-node-data", getLastNode)
        window.addEventListener("delete-node", () => setTimeout(getLastNode, 100))
        return () => {
            window.removeEventListener("update-node-data", getLastNode)
            window.removeEventListener("delete-node", getLastNode)
        }
    }, [setLastNode])

    useEffect(() => {
        if (!lastNode) return;
        console.log("last node", lastNode);
        // when last node changes, remove all edges with the id `endloop-${props.id}`
        // add a new edge with the id `endloop-${props.id}`
        removeEdge(`endloop-${props.id}`)
        addEdge({
            id: `endloop-${props.id}`,
            source: lastNode.id,
            target: props.id,
            type: "loopEnd"
        })
    }, [lastNode]);

    // get code event
    useEffect(() => {
        const getCodeListener = ((e: CustomEvent) => {
            const me = e.detail.id == props.id;
            if (!me) return;

            const inputs = (e.detail.data || props.data) as data;

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
                        body += nodeCode;
                    }
                };

                for (const node of connectedNodes) {
                    await iterateNode(node);
                }

                // If body is empty, add a placeholder comment
                if (body.trim() === "") {
                    body = "-- Add nodes to the graph to add code here";
                }

                let code = ""
                if (inputs.loopType == "range") {
                    code = `for ${props.id.replaceAll("-", "_")} = ${inputs.startIndex}, ${inputs.endIndex}, ${inputs.stepValue} do
${body}
end`
                } else if (inputs.loopType == "condition") {
                    code = `
${props.id.replaceAll("-", "_")} = 1
while ${inputs.condition} do
${body}

${props.id.replaceAll("-", "_")} = ${props.id.replaceAll("-", "_")} + 1
end`
                } else if (inputs.loopType == "iterator") {
                    code = `${props.id.replaceAll("-", "_")} = 1
for i, item in pairs(${inputs.iteratorVariable}) do
${body}
${props.id.replaceAll("-", "_")} = ${props.id.replaceAll("-", "_")} + 1
end`
                }

                code = `\n\n-- [start:${props.id}]\n${formatLua(code)}\n-- [end:${props.id}]\n`

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
    return <NodeContainer {...props} onAddClick={() => setAvailableNodes(SubRootNodesAvailable)}>
        {Icon ? <Icon size={30} strokeWidth={1} /> : <Repeat size={30} strokeWidth={1} />}
        <div className="text-center">{keyToNode(props.type as TNodeType) || "Loop"}</div>
    </NodeContainer>;
}

// react sidebar component that appears when a node is selected
export function LoopSidebar() {
    // Loop type
    const [loopType, setLoopType] = useState<"condition" | "range" | "iterator">("range");

    // While loop condition
    const [condition, setCondition] = useState("");

    // For loop indices
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(10);
    const [stepValue, setStepValue] = useState(1);

    // Iterator variable
    const [iteratorVariable, setIteratorVariable] = useState("");

    // Code preview
    const [code, setCode] = useState("");

    const { activeNode, activeProcess } = useGlobalState();
    const { theme } = useTheme()
    // updates the data in sidebar when the node is selected
    useEffect(() => {
        if (!activeNode) return;
        const nodeData = activeNode?.data as data;

        // Set values from node data
        setLoopType(nodeData?.loopType || "range");
        setCondition(nodeData?.condition || "");
        setStartIndex(nodeData?.startIndex ?? 0);
        setEndIndex(nodeData?.endIndex ?? 10);
        setStepValue(nodeData?.stepValue ?? 1);
        setIteratorVariable(nodeData?.iteratorVariable || "");

        embed(nodeData);
    }, [activeNode?.id]);

    // updates the node data when the input data updates
    useEffect(() => {
        if (!activeNode) return;

        const newNodeData: data = {
            loopType,
            condition,
            startIndex,
            endIndex,
            stepValue,
            iteratorVariable,
        };

        activeNode.data = newNodeData;
        updateNodeData(activeNode.id, newNodeData);

        embed(newNodeData).then((code) => {
            setCode(code);
        });
    }, [loopType, condition, startIndex, endIndex, stepValue, iteratorVariable]);

    // takes in input data and returns a string of lua code via promise
    async function embed(inputs: data) {
        let code = await getCode(activeNode?.id!, inputs);
        setCode(code.trim());
        return code;
    }

    return <div>
        <div className="flex mt-4 px-2 items-end gap-1 justify-between h-5">
            <SmolText className="h-4 p-0">Loop Type</SmolText>
        </div>

        <div className="flex gap-1 mt-2 mb-4 px-2">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setLoopType("range")}
                className={`flex-1 h-7 rounded-md border ${loopType === "range" ? "border-primary bg-primary/10" : "border-muted-foreground/30"}`}
            >
                Range
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setLoopType("condition")}
                className={`flex-1 h-7 rounded-md border ${loopType === "condition" ? "border-primary bg-primary/10" : "border-muted-foreground/30"}`}
            >
                Condition
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setLoopType("iterator")}
                className={`flex-1 h-7 rounded-md border ${loopType === "iterator" ? "border-primary bg-primary/10" : "border-muted-foreground/30"}`}
            >
                Iterator
            </Button>
        </div>

        {loopType === "condition" ? (
            <>
                <SmolText className="h-4 p-0 ml-4 mt-4">Loop Condition</SmolText>
                <Input
                    type="text"
                    placeholder="When should the loop continue? (e.g., i < 10)"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                />
                <div className="flex flex-wrap gap-1 px-2 mt-1">
                    {Object.entries(CommonValues).map(([key, value]) => {
                        const kv = value.replaceAll("x", activeNode?.id!).replaceAll("-", "_")
                        return <Button
                            key={`cond-${kv}`}
                            data-active={condition === kv}
                            variant="ghost"
                            onClick={() => setCondition(kv)}
                            className="p-0 m-0 h-4 px-2 py-0.5 text-xs rounded-full border border-dashed border-muted-foreground/30 data-[active=true]:border-muted-foreground/100 data-[active=true]:bg-muted-foreground/10 data-[active=false]:text-muted-foreground/60 data-[active=false]:hover:bg-muted-foreground/5"
                        >
                            {key}
                        </Button>
                    })}
                </div>
            </>
        ) : loopType === "range" ? (
            <>
                <div className="flex mt-4 px-2 items-end gap-1 justify-between h-5">
                    <SmolText className="h-4 p-0 ml-2">Count Settings</SmolText>
                </div>
                <div className="flex gap-2 px-2 mt-1">
                    <div className="flex flex-col flex-1">
                        <SmolText className="h-4 p-0 ml-2">From</SmolText>
                        <Input
                            type="number"
                            placeholder="0"
                            value={startIndex}
                            onChange={(e) => setStartIndex(parseInt(e.target.value) || 0)}
                            className="h-8"
                        />
                    </div>
                    <div className="flex flex-col flex-1">
                        <SmolText className="h-4 p-0 ml-2">To</SmolText>
                        <Input
                            type="number"
                            placeholder="10"
                            value={endIndex}
                            onChange={(e) => setEndIndex(parseInt(e.target.value) || 0)}
                            className="h-8"
                        />
                    </div>
                    <div className="flex flex-col flex-1">
                        <SmolText className="h-4 p-0 ml-2">Change By</SmolText>
                        <Input
                            type="number"
                            placeholder="1"
                            value={stepValue}
                            onChange={(e) => {
                                let val = parseInt(e.target.value);
                                if (val == 0) {
                                    val = stepValue > 0 ? -1 : 1;
                                }
                                if (startIndex < endIndex && val < 0) {
                                    val = Math.abs(val);
                                } else if (startIndex > endIndex && val > 0) {
                                    val = -Math.abs(val);
                                }
                                setStepValue(val || 1);
                            }}
                            className="h-8"
                        />
                    </div>
                </div>
            </>
        ) : (
            <>
                <SmolText className="h-4 p-0 ml-4 mt-4">Variable to Iterate</SmolText>
                <Input
                    type="text"
                    placeholder="Enter table/array variable name"
                    value={iteratorVariable}
                    onChange={(e) => setIteratorVariable(e.target.value)}
                />
            </>
        )}

        <SyntaxHighlighter code={code.trim()} theme={theme} />

        <div className="text-muted-foreground text-xs p-2 mt-4">
            {loopType === "condition" ? (
                <>
                    This loop will repeat as long as the condition is true.<br />
                    The code inside the loop will run over and over until the condition becomes false.
                </>
            ) : loopType === "range" ? (
                <>
                    This loop will count from {startIndex} to {endIndex} by steps of {stepValue}.<br />
                    The code inside the loop will run once for each number in that range.
                </>
            ) : (
                <>
                    This loop will iterate through each item in the {iteratorVariable} table/array.<br />
                    The code inside the loop will run once for each item in the collection.
                </>
            )}
        </div>
    </div>;
} 