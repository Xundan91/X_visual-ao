import { create } from 'zustand'

interface GlobalState {
    nodebarOpen: boolean;
    toggleNodebar: () => void;
}

export const useGlobalState = create<GlobalState>()((set) => ({
    nodebarOpen: false,
    toggleNodebar: () => set((state) => ({ nodebarOpen: !state.nodebarOpen }))
}))