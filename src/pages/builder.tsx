import { SmolText } from "@/components/right-sidebar";
import TopBar from "@/components/top-bar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NodeConfig } from "@/nodes/index/registry";
import { useEffect, useState } from "react";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup, } from "@/components/ui/resizable"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip"
import { Plus, X, ChevronDown, ChevronUp, Trash2, Save, Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { convertor, TextOrVariable, TConverted, sanitizeVariableName } from "@/lib/utils";
import { GenerateNode, GenerateSidebar } from "@/nodes/index/generators";
import { useGlobalState } from "@/hooks/useGlobalStore";
import { Node } from "@/nodes/index";

// inputs:
// - node name
// - node type (autogenerated from name)
// - node icon (selector for lucide icons)
// - output type (default or inherit)
// - inputs:
//   - name (is the key of the entry)
//   - type (text, number, boolean)
//   - input type (normal, dropdown, checkbox)
//   - label (optional)
//   - showVariableToggle (optional, default is false)
//   - values (optional, for dropdown and checkbox)
//   - placeholder (optional)
// - codeGenerator

interface InputConfig {
    input: "normal" | "dropdown" | "checkbox";
    type: "text" | "number" | "boolean";
    label?: string;
    showVariableToggle?: boolean;
    values?: TConverted[];
    placeholder?: string;
}

interface NodeInputs {
    [key: string]: InputConfig;
}

export default function NodeBuildder() {
    const [node, setNode] = useState<NodeConfig>({
        name: "",
        type: "" as any,
        iconName: "",
        outputType: "inherit",
        inputs: {}
    });
    const [iconSearch, setIconSearch] = useState("");
    const [selectedIcon, setSelectedIcon] = useState<string>("");
    const [newInputKey, setNewInputKey] = useState("");
    const [sidebarComponent, setSidebarComponent] = useState<React.FC<any>>(() => null);

    // Get all Lucide icons and filter out non-icon exports
    const iconList = Object.entries(LucideIcons).map(([name]) => name).filter((name) => !name.endsWith("Icon"));

    // Filter icons based on search
    const filteredIcons = iconList
        .filter(name => name.toLowerCase().includes(iconSearch.toLowerCase()))
        .slice(0, 25); // Limit to first N icons for performance

    useEffect(() => {
        // const _ = GenerateSidebar(node as NodeConfig)
        // setSidebarComponent(_)
        console.log(node)
    }, [node]);


    const addInput = () => {
        if (!newInputKey || !node.inputs) return;

        // Default input configuration
        const defaultInput: InputConfig = {
            input: "normal",
            type: "text",
            label: newInputKey,
            placeholder: newInputKey,
            showVariableToggle: false
        };

        setNode(prev => ({
            ...prev,
            inputs: {
                ...prev.inputs,
                [newInputKey]: defaultInput
            }
        }));
        setNewInputKey("");
    };

    const removeInput = (key: string) => {
        if (!node.inputs) return;
        const newInputs = { ...node.inputs };
        delete newInputs[key];
        setNode(prev => ({ ...prev, inputs: newInputs }));
    };

    const updateInput = (key: string, field: string, value: any) => {
        if (!node.inputs) return;
        const currentInputs = node.inputs as NodeInputs;

        // Special handling for input type changes
        if (field === 'input') {
            let updatedInput = {
                ...currentInputs[key],
                [field]: value,
            };

            // Handle input type changes while preserving values where possible
            if (value === 'dropdown') {
                updatedInput = {
                    ...updatedInput,
                    // Keep existing values if they exist
                    values: currentInputs[key]?.values || [],
                    showVariableToggle: false,
                    type: currentInputs[key]?.type === 'boolean' ? 'text' : currentInputs[key]?.type || 'text',
                };
            } else if (value === 'checkbox') {
                updatedInput = {
                    ...updatedInput,
                    type: 'boolean',
                    showVariableToggle: false,
                    // Convert to single value array
                    values: currentInputs[key]?.values?.length ?
                        [currentInputs[key].values[0]] :
                        [{ type: "TEXT", value: "false" }],
                };
            } else if (value === 'normal') {
                updatedInput = {
                    ...updatedInput,
                    // Convert to single value array
                    values: currentInputs[key]?.values?.length ?
                        [currentInputs[key].values[0]] :
                        [{ type: "TEXT", value: "" }],
                    showVariableToggle: false,
                };
            }

            setNode(prev => ({
                ...prev,
                inputs: {
                    ...currentInputs,
                    [key]: updatedInput
                }
            }));
            return;
        }

        // Special handling for type changes
        if (field === 'type') {
            // Don't allow changing type for checkbox inputs
            if (currentInputs[key]?.input === 'checkbox') return;

            // Don't allow boolean type for dropdown or normal inputs
            if (value === 'boolean' && ['dropdown', 'normal'].includes(currentInputs[key]?.input)) return;

            // If changing to number type, convert all values to VARIABLE type
            if (value === 'number') {
                const currentValues = currentInputs[key]?.values || [];
                const updatedValues = currentValues.map(val => {
                    const currentValue = typeof val === 'string' ? val : val.value;
                    return {
                        type: "VARIABLE" as const,
                        value: currentValue
                    };
                });

                setNode(prev => ({
                    ...prev,
                    inputs: {
                        ...currentInputs,
                        [key]: {
                            ...currentInputs[key],
                            [field]: value,
                            values: updatedValues,
                            showVariableToggle: false
                        }
                    }
                }));
                return;
            }

            setNode(prev => ({
                ...prev,
                inputs: {
                    ...currentInputs,
                    [key]: {
                        ...currentInputs[key],
                        [field]: value,
                    }
                }
            }));
            return;
        }

        // Special handling for values array
        if (field === 'values' && currentInputs[key]?.input === 'dropdown') {
            // If type is number, force all new values to be VARIABLE type
            if (currentInputs[key]?.type === 'number') {
                const newValues = (value as (string | TConverted)[]).map(val => {
                    const currentValue = typeof val === 'string' ? val : val.value;
                    return {
                        type: "VARIABLE" as const,
                        value: currentValue
                    };
                });

                setNode(prev => ({
                    ...prev,
                    inputs: {
                        ...currentInputs,
                        [key]: {
                            ...currentInputs[key],
                            values: newValues
                        }
                    }
                }));
                return;
            }

            setNode(prev => ({
                ...prev,
                inputs: {
                    ...currentInputs,
                    [key]: {
                        ...currentInputs[key],
                        values: value
                    }
                }
            }));
            return;
        }

        // Default handling for other fields
        setNode(prev => ({
            ...prev,
            inputs: {
                ...currentInputs,
                [key]: {
                    ...currentInputs[key],
                    [field]: value
                }
            }
        }));
    };

    const updateDropdownValueType = (inputKey: string, valueIndex: number, type: TextOrVariable) => {
        const currentInputs = node.inputs as NodeInputs;
        if (!currentInputs?.[inputKey]?.values) return;

        const currentValues = [...currentInputs[inputKey].values!];
        currentValues[valueIndex] = {
            ...currentValues[valueIndex],
            type
        };

        setNode(prev => ({
            ...prev,
            inputs: {
                ...currentInputs,
                [inputKey]: {
                    ...currentInputs[inputKey],
                    values: currentValues
                }
            }
        }));
    };

    return (
        <div className="flex flex-col h-screen">
            <TopBar />
            <div className="w-full border-b flex items-center p-2 px-6">
                <div className="text-xl font-light">Node Builder</div>
                <Button
                    variant="outline"
                    className="ml-auto"
                    onClick={() => {
                        const json = JSON.stringify(node, null, 2);
                        const blob = new Blob([json], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${node.type || 'node'}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                    }}
                >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                </Button>
                <Button
                    variant="outline"
                    className="ml-2"
                    onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'application/json';
                        input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (!file) return;

                            const reader = new FileReader();
                            reader.onload = (e) => {
                                try {
                                    const json = JSON.parse(e.target?.result as string);
                                    setNode(json);
                                    if (json.iconName) {
                                        setSelectedIcon(json.iconName);
                                    }
                                } catch (err) {
                                    console.error('Failed to parse JSON:', err);
                                }
                            };
                            reader.readAsText(file);
                        };
                        input.click();
                    }}
                >
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                </Button>
            </div>
            <ResizablePanelGroup direction="horizontal" className="">
                <ResizablePanel defaultSize={35} minSize={20} maxSize={50} className="p-2 h-[calc(100vh-120px)] !overflow-y-scroll">
                    <SmolText className="ml-2 mt-2 text-lg font-semibold">Node Name</SmolText>
                    <Input placeholder="Enter friendly display name (e.g. Send Message)"
                        value={node.name}
                        onChange={(e) => setNode((node) => { return { ...node, name: e.target.value, type: e.target.value.toLowerCase().replace(/ /g, "-").replaceAll(/[^a-z0-9-]/g, "") as any } })}
                    />
                    <SmolText className="ml-2 mt-2 text-lg font-semibold">Node Type</SmolText>
                    <Input placeholder="Enter node type (e.g. send-message)"
                        value={node.type}
                        onChange={(e) => setNode((node) => { return { ...node, type: e.target.value as any } })}
                    />
                    <SmolText className="ml-2 mt-2 text-lg font-semibold">Node Icon</SmolText>
                    <Input
                        placeholder="Search icons..."
                        value={iconSearch}
                        onChange={(e) => setIconSearch(e.target.value)}
                        className="mb-4"
                    />
                    <div className="flex flex-wrap gap-2 items-center justify-center px-2 mx-auto" suppressHydrationWarning>
                        {filteredIcons.map(iconName => {
                            const Icon = LucideIcons[iconName as keyof typeof LucideIcons] as React.FC<any>;
                            return (
                                <TooltipProvider key={iconName} delayDuration={0}>
                                    <Tooltip>
                                        <TooltipTrigger data-selected={selectedIcon == iconName} suppressHydrationWarning onClick={() => {
                                            setSelectedIcon(iconName);
                                            setNode(node => ({ ...node, iconName }));
                                        }}
                                            className="!aspect-square w-11 h-11 !p-0 border flex items-center justify-center rounded-md data-[selected=true]:bg-green-400/20"
                                            title={iconName}>
                                            <Icon />
                                        </TooltipTrigger>
                                        <TooltipContent sideOffset={2} side="bottom" className="bg-[#cdcdcd] shadow p-1 px-2 text-foreground">
                                            <p>{iconName}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            );
                        })}
                    </div>
                    <SmolText className="ml-2 mt-2 text-lg font-semibold">Node Output Type</SmolText>
                    <div className="grid grid-cols-2 gap-2 justify-center px-2">
                        <Button data-selected={node.outputType === "default"} variant="outline" className="w-full data-[selected=true]:bg-green-400/20" onClick={() => setNode((node) => { return { ...node, outputType: "default" } })}>Default</Button>
                        <Button data-selected={node.outputType === "inherit"} variant="outline" className="w-full data-[selected=true]:bg-green-400/20" onClick={() => setNode((node) => { return { ...node, outputType: "inherit" } })}>Inherit</Button>
                        <div className="text-sm text-center text-muted-foreground">Default edge type (no labels)</div>
                        <div className="text-sm text-center text-muted-foreground">Inherits the edge type from the previous node</div>
                    </div>

                    <div className="ml-2 mt-2 flex items-center justify-between gap-2">
                        <SmolText className="text-lg mt-4 font-semibold">Node Inputs</SmolText>
                        <div className="flex gap-2 items-center mt-4">
                            <Input
                                placeholder="Input key"
                                value={newInputKey}
                                onChange={(e) => setNewInputKey(e.target.value)}
                                className="w-32"
                            />
                            <Button variant="outline" onClick={addInput}><Plus className="w-4 h-4" /></Button>
                        </div>
                    </div>

                    <div className="overflow-y-auto mt-4 w-full px-2">
                        {node.inputs && Object.entries(node.inputs).map(([key, input]) => (
                            <div key={key} className="border rounded-lg p-4 mb-4 mx-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="font-medium">{key}</div>
                                    <Button variant="ghost" size="icon" onClick={() => removeInput(key)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <div className="text-sm font-medium">Input Type</div>
                                        <Select
                                            value={input.input}
                                            onValueChange={(value) => updateInput(key, 'input', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="normal">Normal</SelectItem>
                                                <SelectItem value="dropdown">Dropdown</SelectItem>
                                                <SelectItem value="checkbox">Checkbox</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-2">
                                        <div className="text-sm font-medium">Data Type</div>
                                        <Select
                                            value={input.type}
                                            onValueChange={(value) => updateInput(key, 'type', value)}
                                            disabled={input.input === 'checkbox'}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="text">Text</SelectItem>
                                                <SelectItem value="number">Number</SelectItem>
                                                <SelectItem value="boolean" disabled={['dropdown', 'normal'].includes(input.input)}>Boolean</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-2">
                                        <div className="text-sm font-medium">Label (Optional)</div>
                                        <Input
                                            placeholder="Enter label"
                                            value={input.label || ''}
                                            onChange={(e) => updateInput(key, 'label', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <div className="text-sm font-medium">Placeholder (Optional)</div>
                                        <Input
                                            placeholder="Enter placeholder"
                                            value={input.placeholder || ''}
                                            onChange={(e) => updateInput(key, 'placeholder', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="text-sm font-medium">Values</div>
                                        <div className="space-y-2">
                                            {((input.values || []) as (string | TConverted)[]).map((val, idx) => {
                                                const value = typeof val === 'string' ? val : val.value;
                                                const type = typeof val === 'string' ? 'TEXT' as const : val.type;

                                                return (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <Input
                                                            value={value}
                                                            onChange={(e) => {
                                                                const newValues = [...(input.values || [])] as (string | TConverted)[];
                                                                if (typeof val === 'string') {
                                                                    newValues[idx] = e.target.value;
                                                                } else {
                                                                    let newValue = e.target.value;

                                                                    // Handle number type inputs
                                                                    if (input.type === 'number') {
                                                                        // Always treat as variable for number type
                                                                        // newValue = sanitizeVariableName(newValue);
                                                                        // sanitize as number (remove all non-numeric characters)
                                                                        newValue = newValue.replace(/[^0-9]/g, '');
                                                                    } else if (val.type === "VARIABLE") {
                                                                        // Regular variable sanitization for non-number types
                                                                        newValue = sanitizeVariableName(newValue);
                                                                    }

                                                                    newValues[idx] = {
                                                                        ...val,
                                                                        value: newValue
                                                                    };
                                                                }
                                                                updateInput(key, 'values', newValues);
                                                            }}
                                                            placeholder={`Value ${idx + 1}`}
                                                        />
                                                        <div className="flex items-center gap-2">
                                                            {typeof val !== 'string' && input.type !== 'number' && (
                                                                <>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className={type === "TEXT" ? "bg-green-400/20" : ""}
                                                                        onClick={() => {
                                                                            const newValues = [...(input.values || [])] as TConverted[];
                                                                            newValues[idx] = {
                                                                                type: "TEXT",
                                                                                value: value
                                                                            };
                                                                            updateInput(key, 'values', newValues);
                                                                        }}
                                                                    >
                                                                        Text
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className={type === "VARIABLE" ? "bg-green-400/20" : ""}
                                                                        onClick={() => {
                                                                            const newValues = [...(input.values || [])] as TConverted[];
                                                                            newValues[idx] = {
                                                                                type: "VARIABLE",
                                                                                value: sanitizeVariableName(value)
                                                                            };
                                                                            updateInput(key, 'values', newValues);
                                                                        }}
                                                                    >
                                                                        Variable
                                                                    </Button>
                                                                </>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => {
                                                                    const newValues = [...(input.values || [])] as (string | TConverted)[];
                                                                    newValues.splice(idx, 1);
                                                                    updateInput(key, 'values', newValues);
                                                                }}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => {
                                                    const isVariable = input.type === 'number' || false;
                                                    const defaultValue = input.type === 'number' ? "0" : "New Value";
                                                    const newValues = [
                                                        ...(input.values || []),
                                                        {
                                                            type: isVariable ? "VARIABLE" : "TEXT" as const,
                                                            value: isVariable ? sanitizeVariableName(defaultValue) : defaultValue
                                                        }
                                                    ];
                                                    updateInput(key, 'values', newValues);
                                                }}
                                            >
                                                <Plus className="w-4 h-4 mr-2" /> Add Value
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center space-x-2">
                                        <div data-disabled={input.input != "normal" || input.type == "number"} className="text-sm font-medium data-[disabled=true]:text-muted-foreground/80">Show Variable Toggle</div>
                                        <Switch
                                            disabled={input.input != "normal" || input.type == "number"}
                                            checked={input.showVariableToggle || false}
                                            onCheckedChange={(checked) => updateInput(key, 'showVariableToggle', checked)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel>
                    <ResizablePanelGroup direction="vertical">
                        <ResizablePanel defaultSize={50} className="flex items-center justify-center gap-5">
                            <ResizablePanelGroup direction="horizontal">
                                {/* node component */}
                                <ResizablePanel defaultSize={50} minSize={30} className="flex items-center justify-center">
                                    <div className="bg-white w-[114px] h-[114px] rounded-md border flex flex-col items-center justify-center">
                                        {(() => {
                                            if (!node.iconName) return null;
                                            const Icon = LucideIcons[node.iconName as keyof typeof LucideIcons] as React.FC<any>;
                                            return <Icon className="w-10 h-10" strokeWidth={1.2} />
                                        })()}
                                        {node.name}
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle />
                                <ResizablePanel defaultSize={50} minSize={30}>
                                    {/* sidebar component */}
                                    <div className="h-full">
                                        <div className="h-14 border-b">
                                            <div className="p-2 pb-0">{node.name}</div>
                                            <SmolText className="pt-0 pb-2.5">{node.type}</SmolText>
                                        </div>
                                        {(() => {
                                            const SidebarComponent = GenerateSidebar(node as NodeConfig);
                                            return <SidebarComponent />
                                        })()}
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={25} maxSize={50} minSize={20} className="!overflow-scroll p-4 relative">
                            <SmolText className="pt-0 pb-4">Node JSON</SmolText>
                            <pre className="text-xs">{JSON.stringify(node, null, 2)}</pre>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}