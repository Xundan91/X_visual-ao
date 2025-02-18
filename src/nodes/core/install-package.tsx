import { CheckIcon, CodeIcon, Download, FunctionSquareIcon, Icon, Loader, Minus, PackagePlus, Play, Plus, PlusIcon, XIcon } from "lucide-react";
import { Handle, Node, Position } from "@xyflow/react"
import { Button } from "@/components/ui/button";
import { useGlobalState } from "@/hooks/useGlobalStore";
import { keyToNode, TNodes } from "..";
import { useEffect, useState } from "react";
import { SmolText } from "@/components/right-sidebar";
import { Input } from "@/components/ui/input";
import { replaceXMLFieldValue, xmlToLua } from "@/blockly/utils/xml";
import { cn } from "@/lib/utils";
import Ansi from "ansi-to-react";
import Link from "next/link";
import { installAPM, installPackage, parseOutupt, runLua, searchPackages } from "@/lib/aos";
import { Switch } from "@/components/ui/switch";
import NodeContainer from "../common/node";
import { TPackage } from "@/lib/types";
import { embedFunction } from "./function";
import { NodeIconMapping } from "..";

// data field structure for react-node custom node
export interface data {
    installedPackages: TPackage[];
}

export function embedInstallPackageFunction(inputs: data) {
    return `
${inputs.installedPackages.map(pkg => `apm.install("${pkg.Vendor}/${pkg.Name}")`).join("\n")}

return "Installing ${inputs.installedPackages.length} packages"`
}

// the install package node for react-flow
export default function InstallPackageNode(props: Node) {
    const Icon = NodeIconMapping[props.type as TNodes]
    return <NodeContainer {...props}>
        {Icon && <Icon size={30} strokeWidth={1} />}
        <div className="text-center">{keyToNode(props.type as TNodes)}</div>
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
    </NodeContainer>
}

// the handler add node sidebar component
export function InstallPackageNodeSidebar() {
    const [search, setSearch] = useState("");
    const [packages, setPackages] = useState<TPackage[]>([]);
    const [installedPackages, setInstalledPackages] = useState<TPackage[]>([]);
    const { editingNode, setEditingNode, nodebarOpen, toggleNodebar, activeNode, setActiveNode, activeProcess } = useGlobalState();
    const [output, setOutput] = useState("");
    const [outputId, setOutputId] = useState("");
    const [searching, setSearching] = useState(false);
    const nodeData = activeNode?.data as data;
    const [installing, setInstalling] = useState(false);

    useEffect(() => {
        const nodeData = activeNode?.data as data;
        setInstalledPackages(nodeData?.installedPackages || []);
    }, [activeNode?.id]);

    useEffect(() => {
        if (editingNode && nodebarOpen) {
            toggleNodebar();
        }
        if (!editingNode && !nodebarOpen) {
            toggleNodebar();
        }
    }, [editingNode, nodebarOpen]);

    // Debounce search
    useEffect(() => {
        if (!search) {
            setPackages([]);
            return;
        };

        const debounceTimeout = setTimeout(async () => {
            setSearching(true);
            const results = await searchPackages(search);
            setPackages(results);
            setSearching(false);
        }, 500);

        return () => clearTimeout(debounceTimeout);
    }, [search]);

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            if (!search && installedPackages.length < 1) {
                setSearching(true);
                searchPackages("").then((results) => {
                    setPackages(results);
                    setSearching(false);
                });
            }
        }, 500);

        return () => clearTimeout(debounceTimeout);
    }, [search, installedPackages]);


    // Whenever installedPackages changes, update the node data in react-flow
    useEffect(() => {
        const newNodeData: data = {
            installedPackages: [...installedPackages],
        };

        dispatchEvent(new CustomEvent("update-node-data", { detail: { id: activeNode?.id, data: newNodeData } }));
    }, [installedPackages]);

    async function installNow() {
        console.log(installedPackages);
        setInstalling(true);
        const res = await installAPM(activeProcess);
        console.log(res);
        const code = embedInstallPackageFunction({ installedPackages });
        console.log(code);
        const res2 = await runLua(code, activeProcess);
        console.log(res2);
        // for (const pkg of installedPackages) {
        //     console.log(pkg.PkgID);
        //     const res = await installPackage(`${pkg.Vendor}/${pkg.Name}`, activeProcess);
        //     console.log(res);
        // }
        setInstalling(false);
    }

    function PackageItem({ pkg, Btn }: { pkg: TPackage, Btn: React.ReactNode }) {
        return (
            <div className="flex flex-col gap-1 border-b border-black/20 p-0.5 px-1 cursor-pointer hover:bg-black/10 first:border-t">
                <div className="flex items-center gap-2">
                    <div className="text-sm font-medium flex flex-col items-start">
                        <div>{pkg.Vendor}/{pkg.Name}</div>
                        <div className="text-xs text-muted-foreground"> [v{pkg.Version}] ({pkg.TotalInstalls} installs)</div>
                    </div>
                    {Btn}
                </div>
                <div className="text-xs text-muted-foreground">{pkg.Description}</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-0.5 h-full">
            <SmolText className="mt-2">Search for a package</SmolText>
            <div className="relative">
                <Input
                    className="border-y border-x-0 bg-muted"
                    placeholder="Type a name"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Button variant="ghost" className="absolute right-1 top-2.5 h-4 !w-4 p-0 rounded-none hover:border" onClick={() => { setSearch(""); setPackages([]) }}><XIcon size={14} /></Button>
            </div>

            {/* Merged package list */}
            <div className="flex flex-col">
                {searching && (
                    <div className="text-xs text-muted-foreground w-fit mx-auto">
                        <Loader size={14} className="animate-spin" />
                    </div>
                )}
                {(() => {
                    let listToRender: TPackage[] = [];
                    if (search) {
                        // When a search term is present: show only search results (limited to 5)
                        listToRender = packages.slice(0, 5);
                    } else {
                        // When there is no search term:
                        //   • Show installed packages first, then merge in additional packages from suggestions (without duplicating installed ones)
                        const installedIds = new Set(installedPackages.map((pkg) => pkg.PkgID));
                        listToRender = [
                            ...installedPackages,
                            ...packages.filter((pkg) => !installedIds.has(pkg.PkgID)).slice(0, 5),
                        ];
                    }
                    return <>
                        {!search && <SmolText className="mt-2">Installed packages [{installedPackages.length}]</SmolText>}
                        <div className="flex flex-col">
                            {listToRender.map((pkg) => {
                                const isInstalled = installedPackages.some((p) => p.PkgID === pkg.PkgID);
                                const onClick = () => {
                                    if (isInstalled) {
                                        // Remove package
                                        setInstalledPackages(installedPackages.filter((p) => p.PkgID !== pkg.PkgID));
                                    } else {
                                        setInstalledPackages([...installedPackages, pkg]);
                                    }
                                };
                                return <PackageItem
                                    key={pkg.PkgID}
                                    pkg={pkg}
                                    Btn={
                                        <Button
                                            variant="ghost"
                                            className="rounded-none w-fit h-5 p-0 ml-auto text-sm px-0.5"
                                            onClick={onClick}
                                        >
                                            {isInstalled ? <Minus size={14} /> : <Plus size={14} />}
                                        </Button>
                                    }
                                />
                            })}
                        </div>
                    </>
                })()}
            </div>
            <div className="bg-muted border-y flex flex-col items-start justify-start overflow-clip mt-4">
                <Button disabled={installing} variant="link" className="text-muted-foreground w-full my-2" onClick={installNow}>
                    {installing ? <><Loader size={20} className="animate-spin" /> Installing...</> : <><Download size={20} /> Install Now</>}
                </Button>
                <div className="min-h-[100px] overflow-scroll w-full p-2 pt-0">
                    <pre className="text-xs">
                        {(() => {
                            const data = activeNode?.data as data
                            data.installedPackages = installedPackages
                            return embedInstallPackageFunction(data)
                        })()}
                    </pre>
                </div>
            </div>
        </div>
    );
}