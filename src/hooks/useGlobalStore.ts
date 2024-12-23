import { Node } from '@/nodes';
import { create } from 'zustand'

interface GlobalState {
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
