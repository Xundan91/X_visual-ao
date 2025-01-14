import { useGlobalState } from "@/hooks/useGlobalStore"
import { findMyPIDs } from "@/lib/aos"
import { shortAddress } from "@/lib/utils"
import { ConnectButton, useActiveAddress } from "arweave-wallet-kit"
import { ChevronLeft, ChevronRight, CopyIcon, Inbox, Plug, PlusIcon, RefreshCw, TerminalSquare, X } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Arrow } from "@radix-ui/react-dropdown-menu"
import { Input } from "./ui/input"


function Process({ processId, name }: { processId: string, name?: string }) {
    const { activeProcess, setActiveProcess } = useGlobalState()

    return <div data-active={activeProcess === processId} className={`text-sm font-medium tracking-wider flex justify-between cursor-pointer data-[active=false]:hover:bg-[#dedede]/30 items-center px-4 py-0.5 data-[active=true]:bg-[#dedede]`} onClick={() => setActiveProcess(processId)}>
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
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        {/* <Button variant="outline">Open</Button> */}
                        <Button variant="outline" className=" mx-4 mb-4 text-sm shadow-none !bg-[#ECEFEF] border-[#D6D7DC] rounded-s-md hover:scale-[101%] transition-all duration-100">
                            <PlusIcon size={10} strokeWidth={1.3} />
                            <div className="text-sm tracking-tight">ADD PROCESS</div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" className="p-0 border-none flex flex-col py-3 gap-2">
                        <Arrow className=" fill-white" />
                        <AlertDialog>
                            <AlertDialogTrigger>
                                <Button variant="ghost" className="h-5 rounded-none hover:bg-white bg-white hover:scale-[101%] transition-all duration-100"><TerminalSquare size={10} strokeWidth={1.5} /> CREATE A NEW PROCESS</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white p-0">
                                <AlertDialogHeader className="border-b p-2 px-4 flex flex-row justify-between items-center">
                                    <AlertDialogTitle>Create a Process</AlertDialogTitle>
                                    <AlertDialogCancel className="border-none shadow-none">
                                        <X size={10} strokeWidth={1.3} />
                                    </AlertDialogCancel>
                                </AlertDialogHeader>
                                <div className=" px-4 pb-4 flex flex-col gap-2">
                                    <div>Enter your process name</div>
                                    <Input placeholder="Process Name" className="rounded-md" />
                                    {/* <AlertDialogCancel>Cancel</AlertDialogCancel> */}
                                    <AlertDialogAction className="w-fit">create</AlertDialogAction>
                                </div>
                            </AlertDialogContent>
                        </AlertDialog>
                        <AlertDialog>
                            <AlertDialogTrigger>
                                <Button variant="ghost" className="h-5 rounded-none hover:bg-white bg-white hover:scale-[101%] transition-all duration-100"><Plug size={10} strokeWidth={1.5} className=" rotate-45" /> CONNECT TO A PROCESS</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                </AlertDialogHeader>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
                {/* <Process processId="ib3jhE532TrzYQP5Weg5IigW97fLGzYYpqkUNjhm1Vg" />
                <Process processId="ib3jhE532TrzYQP5Weg5IigW97fLGzYYpqkUNjhm1Vg" name="testaddasdasdasdasdasdasdasdasasd1" />
                <Process processId="ib3jhE532TrzYQP5Weg5IigW97fLGzYYpqkUNjhm1Vg" name="Process 3" /> */}
                {
                    processes.length == 0 && <div className="text-sm text-center text-gray-500 flex items-center justify-center gap-2">
                        <Inbox size={25} strokeWidth={1.3} />
                        Loading spawned processes...
                    </div>
                }

                {
                    processes.length > 0 && <>

                        {
                            processes.map((process, index) => <Process key={index} processId={process.id} name={process.name} />)
                        }
                        <div className="flex justify-between items-center px-4 my-4">
                            <Button variant="outline" className="text-sm shadow-none !bg-[#ECEFEF] border-[#D6D7DC] rounded-s-md hover:scale-[101%] transition-all duration-100 p-2 gap-1">
                                <ChevronLeft size={20} strokeWidth={1.3} className="" />
                                PREV PAGE
                            </Button>
                            <Button variant="outline" className="text-sm shadow-none !bg-[#ECEFEF] border-[#D6D7DC] rounded-s-md hover:scale-[101%] transition-all duration-100 p-2 gap-1">
                                NEXT PAGE
                                <ChevronRight size={10} strokeWidth={1.3} />
                            </Button>
                        </div>
                    </>
                }
            </div>
        </>
    )
}