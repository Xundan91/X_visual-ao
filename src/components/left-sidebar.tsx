import { useGlobalState } from "@/hooks/useGlobalStore"
import { findMyPIDs } from "@/lib/aos"
import { shortAddress } from "@/lib/utils"
import { ConnectButton, useActiveAddress } from "arweave-wallet-kit"
import { ChevronLeft, ChevronRight, CopyIcon, Inbox, Plug, PlusIcon, RefreshCw, TerminalSquare, X, Loader2, Loader } from "lucide-react"
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
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Arrow } from "@radix-ui/react-dropdown-menu"
import { Input } from "./ui/input"


function Process({ processId, name, loading }: { processId: string, name?: string, loading?: boolean }) {
    const { activeProcess, setActiveProcess } = useGlobalState()

    return <div data-active={activeProcess === processId} className={`text-sm font-medium tracking-wider flex justify-between cursor-pointer data-[active=false]:hover:bg-[#dedede]/30 items-center px-4 py-0.5 data-[active=true]:bg-[#dedede]`} onClick={() => !loading && setActiveProcess(processId)}>
        <div className="truncate overflow-clip mr-auto">
            {loading ? (
                <div className="flex items-center gap-2">
                    <Loader size={18} strokeWidth={1.3} className="animate-spin" />
                </div>
            ) : name}
        </div>
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
    const { activeProcess, setActiveProcess } = useGlobalState()
    const [processes, setProcesses] = useState<{ cursor: string, id: string, name: string }[]>([])
    const [loading, setLoading] = useState(false)
    const [cursorHistory, setCursorHistory] = useState<string[]>([])
    const [currentCursorIndex, setCurrentCursorIndex] = useState(-1)

    const [newProcessName, setNewProcessName] = useState("")
    const [connectProcessId, setConnectProcessId] = useState("")

    async function myProcesses(nextCursor?: string, isPrevious: boolean = false) {
        setLoading(true)
        try {
            const result = await findMyPIDs(address, 10, nextCursor)
            setProcesses(result)

            if (!isPrevious && nextCursor) {
                setCursorHistory(prev => [...prev.slice(0, currentCursorIndex + 1), nextCursor])
                setCurrentCursorIndex(prev => prev + 1)
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        myProcesses()
    }, [address])

    useEffect(() => {
        if (!activeProcess) return

        toast(`Active process set to ${shortAddress(activeProcess)}`, { style: { backgroundColor: "white" } })
    }, [activeProcess])

    const handlePreviousPage = () => {
        if (currentCursorIndex > 0) {
            const previousCursor = cursorHistory[currentCursorIndex - 1]
            setCurrentCursorIndex(prev => prev - 1)
            myProcesses(previousCursor, true)
        } else {
            // First page
            myProcesses(undefined, true)
            setCurrentCursorIndex(-1)
        }
    }

    const handleNextPage = () => {
        if (processes.length === 10) {
            myProcesses(processes[processes.length - 1].cursor)
        }
    }

    async function spawnProcess(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault()
        console.log("spawnProcess", newProcessName)
        const cancelButton = document.getElementById("new-process-cancel")
        cancelButton?.click()
    }

    async function connectProcess(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault()
        console.log("connectProcess", connectProcessId)
        if (connectProcessId.length != 43)
            return toast("Invalid process ID", { style: { backgroundColor: "white" } })

        setActiveProcess(connectProcessId)
        const cancelButton = document.getElementById("connect-process-cancel")
        cancelButton?.click()
    }

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
                                {/* NEW PROCESS */}
                                <AlertDialogHeader className="border-b p-2 px-4 flex flex-row justify-between items-center">
                                    <AlertDialogTitle>Create a Process</AlertDialogTitle>
                                    <AlertDialogCancel className="border-none shadow-none" id="new-process-cancel">
                                        <X size={10} strokeWidth={1.3} />
                                    </AlertDialogCancel>
                                </AlertDialogHeader>
                                <div className=" px-4 pb-4 flex flex-col gap-2">
                                    <div>Enter your process name</div>
                                    <Input placeholder="Process Name" className="rounded-md" onChange={(e) => setNewProcessName((e.target.value as string).trim())} />
                                    <AlertDialogAction className="w-fit" onClick={spawnProcess}>create</AlertDialogAction>
                                </div>
                            </AlertDialogContent>
                        </AlertDialog>
                        <AlertDialog>
                            <AlertDialogTrigger>
                                <Button variant="ghost" className="h-5 rounded-none hover:bg-white bg-white hover:scale-[101%] transition-all duration-100"><Plug size={10} strokeWidth={1.5} className=" rotate-45" /> CONNECT TO A PROCESS</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white p-0">
                                {/* CONNECT TO A PROCESS */}
                                <AlertDialogHeader className="border-b p-2 px-4 flex flex-row justify-between items-center">
                                    <AlertDialogTitle>Enter Process ID?</AlertDialogTitle>
                                    <AlertDialogCancel className="border-none shadow-none" id="connect-process-cancel">
                                        <X size={10} strokeWidth={1.3} />
                                    </AlertDialogCancel>
                                </AlertDialogHeader>
                                <div className=" px-4 pb-4 flex flex-col gap-2">
                                    <div>Enter your process ID</div>
                                    <Input placeholder="Process ID" className="rounded-md" onChange={(e) => setConnectProcessId((e.target.value as string).trim())} />
                                    <AlertDialogAction className="w-fit" onClick={connectProcess}>connect</AlertDialogAction>
                                </div>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
                {/* <Process processId="ib3jhE532TrzYQP5Weg5IigW97fLGzYYpqkUNjhm1Vg" />
                <Process processId="ib3jhE532TrzYQP5Weg5IigW97fLGzYYpqkUNjhm1Vg" name="testaddasdasdasdasdasdasdasdasasd1" />
                <Process processId="ib3jhE532TrzYQP5Weg5IigW97fLGzYYpqkUNjhm1Vg" name="Process 3" /> */}
                {loading ? (
                    <>
                        {[...Array(10)].map((_, index) => (
                            <Process
                                key={`loading-${index}`}
                                processId={'-'}
                                name="-"
                                loading={true}
                            />
                        ))}
                    </>
                ) : processes.length == 0 ? (
                    <div className="text-sm text-center text-gray-500 flex items-center justify-center gap-2">
                        <Inbox size={25} strokeWidth={1.3} />
                        No processes found
                    </div>
                ) : (
                    <>
                        {processes.map((process, index) => (
                            <Process key={index} processId={process.id} name={process.name} />
                        ))}

                    </>
                )}
                <div className="flex justify-between items-center px-4 my-4">
                    <Button
                        variant="outline"
                        className="text-sm shadow-none !bg-[#ECEFEF] border-[#D6D7DC] rounded-s-md hover:scale-[101%] transition-all duration-100 p-2 gap-1"
                        onClick={handlePreviousPage}
                        disabled={currentCursorIndex < 0 || loading}
                    >
                        <ChevronLeft size={20} strokeWidth={1.3} className="" />
                        PREV PAGE
                    </Button>
                    <Button
                        variant="outline"
                        className="text-sm shadow-none !bg-[#ECEFEF] border-[#D6D7DC] rounded-s-md hover:scale-[101%] transition-all duration-100 p-2 gap-1"
                        onClick={handleNextPage}
                        disabled={processes.length < 10 || loading}
                    >
                        NEXT PAGE
                        <ChevronRight size={10} strokeWidth={1.3} />
                    </Button>
                </div>
            </div>
        </>
    )
}