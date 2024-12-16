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
}

export const useGlobalState = create<GlobalState>()((set) => ({
    nodebarOpen: false,
    toggleNodebar: () => set((state) => ({ nodebarOpen: !state.nodebarOpen })),
    activeProcess: "",
    setActiveProcess: (process: string) => set(() => ({ activeProcess: process, editingNode: false })),
    activeNode: undefined,
    setActiveNode: (node: Node | undefined) => set(() => ({ activeNode: node, editingNode: false })),
    editingNode: false,
    setEditingNode: (editing: boolean) => set(() => ({ editingNode: editing }))

}))