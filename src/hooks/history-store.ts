import {create} from 'zustand'
import { Edge } from '@/edges'
import {  Node } from '@/nodes/index'
import { json } from 'stream/consumers';

interface HistoryState {
    past : Array <{nodes:Node[] , edges : Edge[]}>;
    present : { nodes : Node[], edges: Edge[]} | null;
    future : Array < {nodes: Node[], edges:Edge[]}>

    performingUndoRedo : boolean

    saveCurrent: (state : {nodes : Node[] , edges : Edge[]}) =>void;
    undo : ()=> {nodes: Node[], edges:Edge[]} | null;
    redo :()=>{nodes : Node[], edges:Edge[]} | null;
    clear :() => void;
    setPerformingUndoRedo : (value : boolean) => void;
    canUndo :() => boolean;
    canRedo :() => boolean;


}

export const useHistoryStore = create<HistoryState>((set, get)=>({
    past :[],
    present: null,
    future :[],
    performingUndoRedo: false,
    saveCurrent :(state)=>{
        
        if(get().performingUndoRedo) {
            return;
        }
        const cloneState ={
            nodes : JSON.parse(JSON.stringify(state.nodes)),
            edges: JSON.parse(JSON.stringify(state.edges))
        }
        set((currentState)=>{
            if(currentState.present && JSON.stringify(currentState.present)===JSON.stringify(cloneState)){
                return currentState;
            }
            return {
                past : currentState.present ? [...currentState.past,currentState.present]:currentState.past,
                present: cloneState,
                future: [],
            };
        });

    },
    undo:()=>{
        const {past , present , future} = get();
        if(past.length === 0 ) return null;
        const previous = past[past.length  -1 ]
        const newPast = past.slice(0,past.length -1);

        set({
            past :newPast,
            present :previous,
            future : present ? [present , ...future] : future,
            performingUndoRedo:true,
        })
        return previous;

    },
    redo:()=>{
        const {past , present , future} = get();
        if(future.length ===0 ) {
            return null;
        }
        const next = future[0];
        const newFuture = future.slice(1);
        set({
            past : present ? [...past , present] :past,
            present :next , 
            future :newFuture,
            performingUndoRedo : true,
        })
        return next;
    },
    clear:()=>{
        set({
            past :[],
            present : null , 
            future : [],
            performingUndoRedo : false
        })
    },
    setPerformingUndoRedo:(value)=>{
        set({performingUndoRedo:value})
    },
    canUndo :()=>get().past.length >0,
    canRedo :()=>get().future.length >0
}))