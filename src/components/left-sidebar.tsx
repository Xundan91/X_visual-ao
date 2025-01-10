import { useGlobalState } from "@/hooks/useGlobalStore"
import { findMyPIDs } from "@/lib/aos"
import { shortAddress } from "@/lib/utils"
import { ConnectButton, useActiveAddress } from "arweave-wallet-kit"
import { CopyIcon, PlusIcon, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "./ui/button"

function Process({ processId, name }: { processId: string, name?: string }) {
    const { activeProcess, setActiveProcess } = useGlobalState()

    return <div data-active={activeProcess === processId} className={`text-sm font-medium tracking-wider flex justify-between cursor-pointer data-[active=false]:hover:opacity-50 items-center px-4 py-0.5 data-[active=true]:bg-[#dedede]`} onClick={() => setActiveProcess(processId)}>
        <div className="truncate overflow-clip mr-auto">{name}</div>
        {/* <div className="font-mono text-sm">{shortAddress(processId)}</div> */}
        <div className="font-robotoMono text-sm">#{processId.slice(0, 6)}</div>
        <div className="pl-2">
            <Button variant="ghost" size="icon" className="p-0 m-0">
                <CopyIcon size={10} strokeWidth={1.3} />
            </Button>
        </div>
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

        toast(`Active process set to ${shortAddress(activeProcess)}`, { style: { backgroundColor: "white" } })
    }, [activeProcess])

    return (
        <>

            <div className="p-0 flex flex-col">
                <div className="p-4 flex text-sm items-center gap-2 font-robotoMono tracking-tight">MY PROCESSES
                    {/* <Button variant="ghost" onClick={myProcesses}><RefreshCw size={10} strokeWidth={1.3} /></Button> */}
                </div>
                <Button variant="outline" className=" mx-4 mb-4 text-sm shadow-none !bg-[#ECEFEF] border-[#D6D7DC] rounded-s-md hover:scale-[101%] transition-all duration-100">
                    <PlusIcon size={10} strokeWidth={1.3} />
                    <div className="text-sm tracking-tight">ADD PROCESS</div>
                </Button>
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
