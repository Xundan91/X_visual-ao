import { Node } from '@/nodes';
import { create } from 'zustand'

interface GlobalState {
    nodebarOpen: boolean;
    toggleNodebar: () => void;
    activeProcess: string;
    setActiveProcess: (process: string) => void;
    activeNode: Node | undefined;
    setActiveNode: (node: Node | undefined) => void;
}

export const useGlobalState = create<GlobalState>()((set) => ({
    nodebarOpen: false,
    toggleNodebar: () => set((state) => ({ nodebarOpen: !state.nodebarOpen })),
    activeProcess: "",
    setActiveProcess: (process: string) => set(() => ({ activeProcess: process })),
    activeNode: undefined,
    setActiveNode: (node: Node | undefined) => set(() => ({ activeNode: node }))

}))