import { Node } from '@/nodes';
import { ImperativePanelHandle } from 'react-resizable-panels';
import { create } from 'zustand'

export type OutputType = { type: "output" | "error" | "success" | "info" | "warning", message: string };
interface GlobalState {
    consoleRef: React.RefObject<ImperativePanelHandle> | null;
    setConsoleRef: (ref: React.RefObject<ImperativePanelHandle>) => void;
    outputs: OutputType[];
    addOutput: (output: OutputType) => void;
    clearOutputs: () => void;

    nodebarOpen: boolean;
    toggleNodebar: () => void;
    activeProcess: string;
    setActiveProcess: (process: string) => void;
    activeNode: Node | undefined;
    setActiveNode: (node: Node | undefined) => void;
    editingNode: boolean;
    setEditingNode: (editing: boolean) => void;

    flowIsRunning: boolean;
    setFlowIsRunning: (running: boolean) => void;
    runningNodes: Node[];
    addRunningNode: (node: Node) => void;
    successNodes: Node[];
    addSuccessNode: (node: Node) => void;
    errorNodes: Node[];
    addErrorNode: (node: Node) => void;
    resetNodes: () => void;
}

export const useGlobalState = create<GlobalState>()((set) => ({
    consoleRef: null,
    setConsoleRef: (ref: React.RefObject<ImperativePanelHandle>) => set(() => ({ consoleRef: ref })),
    outputs: [],
    addOutput: (output: OutputType) => set((state) => ({ outputs: [...state.outputs, output] })),
    clearOutputs: () => set(() => ({ outputs: [] })),

    nodebarOpen: false,
    toggleNodebar: () => set((state) => ({ nodebarOpen: !state.nodebarOpen })),
    activeProcess: "",
    setActiveProcess: (process: string) => set(() => ({ activeProcess: process, editingNode: false })),
    activeNode: undefined,
    setActiveNode: (node: Node | undefined) => set(() => ({ activeNode: node, editingNode: false })),
    editingNode: false,
    setEditingNode: (editing: boolean) => set(() => ({ editingNode: editing })),

    flowIsRunning: false,
    setFlowIsRunning: (running: boolean) => set(() => ({ flowIsRunning: running })),
    runningNodes: [],
    addRunningNode: (node: Node) => set((state) => ({ runningNodes: [...state.runningNodes, node] })),
    successNodes: [],
    addSuccessNode: (node: Node) => set((state) => ({ successNodes: [...state.successNodes, node] })),
    errorNodes: [],
    addErrorNode: (node: Node) => set((state) => ({ errorNodes: [...state.errorNodes, node] })),
    resetNodes: () => set(() => ({ runningNodes: [], successNodes: [], errorNodes: [] })),
}))
