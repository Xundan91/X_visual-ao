import { useGlobalState } from "@/hooks/useGlobalStore"
import { cn } from "@/lib/utils"
import { Node } from "@xyflow/react"
import { Loader } from "lucide-react"
import { PropsWithChildren } from "react"

export default function NodeContainer(props: PropsWithChildren<Node>) {
    const { activeNode, runningNodes, successNodes, errorNodes } = useGlobalState()

    // order of preference for applying classes is selected > running > success > error
    const iAmSelected = activeNode?.id === props.id
    const iAmError = !!errorNodes.find(node => node.id == props.id)
    const iAmSuccess = !iAmError && !!successNodes.find(node => node.id == props.id)
    const iAmRunning = !iAmError && !iAmSuccess && !!runningNodes.find(node => node.id == props.id)
    // running - yellow
    // success - green
    // error - red
    // selected - blue  

    return <div data-selected={iAmSelected}
        data-running={iAmRunning}
        data-success={iAmSuccess}
        data-error={iAmError}

        className={cn(`bg-white border data-[selected=true]:!border-black p-2 border-black/30 rounded-md aspect-square cursor-pointer flex flex-col items-center justify-center w-28 h-28 relative`,
            `data-[running=true]:bg-yellow-50 data-[success=true]:bg-green-50 data-[error=true]:bg-red-50`,
            `data-[selected=true]:border-black data-[running=true]:border-yellow-500 data-[success=true]:border-green-500 data-[error=true]:border-red-500`,
        )}>
        {
            iAmRunning && <Loader className="absolute top-1 right-1 animate-spin" size={20} />
        }
        {props.children}
    </div>

}