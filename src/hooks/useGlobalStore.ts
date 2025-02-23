import { Node } from '@/nodes/index';
import { TNodeType } from '@/nodes/index/registry';
import { ImperativePanelHandle } from 'react-resizable-panels';
import { create } from 'zustand'

export type OutputType = { type: "output" | "error" | "success" | "info" | "warning", message: string, preMessage?: string };
interface GlobalState {
    consoleRef: React.RefObject<ImperativePanelHandle> | null;
    sidebarRef: React.RefObject<ImperativePanelHandle> | null;
    setConsoleRef: (ref: React.RefObject<ImperativePanelHandle>) => void;
    setSidebarRef: (ref: React.RefObject<ImperativePanelHandle>) => void;
    toggleSidebar: (open: boolean) => void;
    outputs: OutputType[];
    addOutput: (output: OutputType) => void;
    clearOutputs: () => void;
    attach: string | undefined;
    setAttach: (attach: string | undefined) => void;
    availableNodes: TNodeType[];
    setAvailableNodes: (nodes: TNodeType[]) => void;
    order: { [id: string]: number };
    setOrder: (order: { [id: string]: number }) => void;

    activeProcess: string;
    setActiveProcess: (process: string) => void;
    activeNode: Node | undefined;
    setActiveNode: (node: Node | undefined) => void;

    flowIsRunning: boolean;
    setFlowIsRunning: (running: boolean) => void;
    runningNodes: Node[];
    addRunningNode: (node: Node) => void;
    successNodes: Node[];
    addSuccessNode: (node: Node) => void;
    errorNodes: Node[];
    addErrorNode: (node: Node) => void;
    resetNodes: () => void;

    resetNode: (id: string) => void;
}

export const useGlobalState = create<GlobalState>()((set) => ({
    consoleRef: null,
    setConsoleRef: (ref: React.RefObject<ImperativePanelHandle>) => set(() => ({ consoleRef: ref })),
    sidebarRef: null,
    setSidebarRef: (ref: React.RefObject<ImperativePanelHandle>) => set(() => ({ sidebarRef: ref })),
    toggleSidebar: (open: boolean) => set((state) => {
        if (state.sidebarRef?.current) {
            if (open) {
                state.sidebarRef.current.expand()
                state.sidebarRef.current.resize(40)
            } else {
                state.sidebarRef.current.collapse()
            }
        }
        return { sidebarRef: state.sidebarRef }
    }),
    outputs: [],
    addOutput: (output: OutputType) => set((state) => ({ outputs: [...state.outputs, output] })),
    clearOutputs: () => set(() => ({ outputs: [] })),
    attach: undefined,
    setAttach: (attach: string | undefined) => set(() => ({ attach })),
    availableNodes: [],
    setAvailableNodes: (nodes: TNodeType[]) => set(() => ({ availableNodes: nodes })),
    order: {},
    setOrder: (order: { [id: string]: number }) => set(() => ({ order })),

    activeProcess: "",
    setActiveProcess: (process: string) => set(() => ({ activeProcess: process, editingNode: false })),
    activeNode: undefined,
    setActiveNode: (node: Node | undefined) => set(() => ({ activeNode: node, editingNode: false })),

    flowIsRunning: false,
    setFlowIsRunning: (running: boolean) => set(() => ({ flowIsRunning: running })),
    runningNodes: [],
    addRunningNode: (node: Node) => set((state) => ({ runningNodes: [...state.runningNodes, node] })),
    successNodes: [],
    addSuccessNode: (node: Node) => set((state) => ({ successNodes: [...state.successNodes, node] })),
    errorNodes: [],
    addErrorNode: (node: Node) => set((state) => ({ errorNodes: [...state.errorNodes, node] })),
    resetNodes: () => set(() => ({ runningNodes: [], successNodes: [], errorNodes: [] })),
    resetNode: (id: string) => set((state) => ({ runningNodes: state.runningNodes.filter((node) => node.id !== id), successNodes: state.successNodes.filter((node) => node.id !== id), errorNodes: state.errorNodes.filter((node) => node.id !== id) })),
}))
