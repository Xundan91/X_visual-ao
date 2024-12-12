import { useGlobalState } from "@/hooks/useGlobalStore"
import { CodeIcon, LucideIcon } from "lucide-react"
import { Nodes } from "@/nodes"

function NodeTemplate({ name, Icon }: { name: string, Icon: LucideIcon }) {
    function addThisNode() {
        dispatchEvent(new CustomEvent("add-node", { detail: { type: name } }))
    }

    return <div className="flex items-center gap-2 hover:bg-black/10 p-2 cursor-pointer" onClick={addThisNode}>
        <Icon size={22} />
        <div className="truncate">{name}</div>

    </div>
}

export function RightSidebar() {
    const { nodebarOpen } = useGlobalState()

    return (
        <div data-nodebaropen={nodebarOpen} className="w-[250px] data-[nodebaropen=false]:w-0 transition-all duration-200 border-l">
            <div className="p-2">Available Nodes</div>
            <div className="p-0">
                {
                    Object.keys(Nodes).filter(v => !["add", "start"].includes(v)).map((Node, index) => <NodeTemplate key={index} name={Node} Icon={CodeIcon} />)
                }
            </div>
        </div>
    )
}
