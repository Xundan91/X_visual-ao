import { Button } from "@/components/ui/button";
import { Loader, PlayIcon, Plus } from "lucide-react";
import { Handle, Node, Position } from "@xyflow/react"
import { useGlobalState } from "@/hooks/useGlobalStore";
import { RootNodesAvailable, SubRootNodesAvailable } from "./registry";

export default function StartNode(props: Node) {
    const { flowIsRunning, setAvailableNodes, toggleSidebar, setAttach, setActiveNode, attach } = useGlobalState()

    return <div className="bg-white border border-black/50 rounded-md aspect-square cursor-pointer w-24 h-12">
        <Button disabled={flowIsRunning} className="aspect-square h-full w-full" variant="ghost">
            {flowIsRunning ? <Loader size={25} color="green" className="animate-spin" /> : <PlayIcon size={25} color="green" fill="green" />}
            RUN
            <Handle type="source" position={Position.Right} />
            <Button variant="ghost"
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setAvailableNodes(RootNodesAvailable)
                    toggleSidebar(true)
                    setActiveNode(undefined)
                    setAttach(props.id)
                }}
                data-willattach={attach == props.id}
                className="absolute -right-3 bg-white p-0 border rounded-full w-6 h-6 flex justify-center items-center data-[willattach=true]:bg-yellow-100">
                <Plus size={20} />
            </Button>
        </Button>
    </div>
}