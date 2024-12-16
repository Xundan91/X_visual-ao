import { useGlobalState } from "@/hooks/useGlobalStore"
import { findMyPIDs } from "@/lib/aos"
import { shortAddress } from "@/lib/utils"
import { ConnectButton, useActiveAddress } from "arweave-wallet-kit"
import { CopyIcon, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "./ui/button"

function Process({ processId, name }: { processId: string, name?: string }) {
    const { activeProcess, setActiveProcess } = useGlobalState()

    return <div data-active={activeProcess === processId} className={`flex justify-between cursor-pointer data-[active=false]:hover:opacity-50 items-center p-2 data-[active=true]:bg-gray-200`} onClick={() => setActiveProcess(processId)}>
        <div className="truncate overflow-clip">{name}</div>
        <div className="font-mono text-sm">{shortAddress(processId)}</div>
    </div>
}

export function LeftSidebar() {
    const address = useActiveAddress()
    const { activeProcess } = useGlobalState()
    const [processes, setProcesses] = useState<{ cursor: string, id: string, name: string }[]>([])

    async function myProcesses() {
        findMyPIDs(address).then(setProcesses)
    }

    useEffect(() => {
        myProcesses()
    }, [address])

    useEffect(() => {
        if (!activeProcess) return

        toast.success(`Active process set to ${shortAddress(activeProcess)}`, { style: { backgroundColor: "white" } })
    }, [activeProcess])

    return (
        <>
            <div className="p-2">Visual AO</div>
            <ConnectButton className="mx-auto w-full" />
            <div className="p-0 flex flex-col">
                <div className="p-2 flex items-center gap-2">My Processes <Button variant="ghost" className="w-7 h-7" onClick={myProcesses}><RefreshCw size={16} /></Button></div>
                {/* <Process processId="ib3jhE532TrzYQP5Weg5IigW97fLGzYYpqkUNjhm1Vg" />
                <Process processId="ib3jhE532TrzYQP5Weg5IigW97fLGzYYpqkUNjhm1Vg" name="testaddasdasdasdasdasdasdasdasasd1" />
                <Process processId="ib3jhE532TrzYQP5Weg5IigW97fLGzYYpqkUNjhm1Vg" name="Process 3" /> */}
                {
                    processes.map((process, index) => <Process key={index} processId={process.id} name={process.name} />)
                }
            </div>
        </>
    )
}
