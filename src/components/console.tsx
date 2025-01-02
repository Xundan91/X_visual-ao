import { OutputType, useGlobalState } from "@/hooks/useGlobalStore";
import { ChevronDownIcon, Eraser, TerminalIcon, TrashIcon } from "lucide-react"
import { useEffect } from "react";
import Ansi from "ansi-to-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"

export default function Console() {
    const { outputs, consoleRef, clearOutputs } = useGlobalState();

    useEffect(() => {
        const container = document.getElementById("console-container");
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, [outputs]);

    return <div className="text-sm relative h-full">
        <div className="flex items-center justify-between border-b px-0.5 gap-1">
            <div className="flex items-center gap-1"><TerminalIcon className="w-4 h-4 bg-black/70 text-white rounded-xs" />console</div>
            {/* clear button */}
            <div className="flex items-center gap-1 pr-1">
                <Eraser className="w-4 h-4 cursor-pointer hover:bg-black/10 rounded-sm p-[1px]" onClick={() => clearOutputs()} />
                <ChevronDownIcon className="w-4 h-4 cursor-pointer hover:bg-black/10 rounded-sm" onClick={() => consoleRef?.current?.collapse()} />
            </div>
        </div>
        {/* scrollable div for output list */}
        {/* always make sure the scroll is at the bottom */}
        <div id="console-container" className="overflow-scroll h-full scroll-smooth flex flex-col pb-6">
            {outputs.map((output: OutputType, index) => <>
                <Dialog key={index}>
                    <DialogTrigger data-type={output.type} className="flex items-center gap-0.5 whitespace-nowrap text-xs px-0.5 font-mono data-[type=output]:text-black data-[type=error]:text-red-500 data-[type=success]:text-green-500 data-[type=info]:text-blue-500 data-[type=warning]:text-yellow-500 hover:bg-black/5">
                        <Ansi>{output.message.toString()}</Ansi>
                    </DialogTrigger>
                    <DialogContent className="max-w-[70vw] bg-white text-sm">
                        <DialogHeader>
                            <div className="font-semibold">{output.preMessage || "Output"}</div>
                        </DialogHeader>
                        <pre className="max-h-[50vh] overflow-scroll"><Ansi>{output.message.toString()}</Ansi></pre>
                    </DialogContent>
                </Dialog>
                {/* <div key={index} data-type={output.type} className="flex items-center gap-0.5 whitespace-nowrap text-xs px-0.5 font-mono data-[type=output]:text-black data-[type=error]:text-red-500 data-[type=success]:text-green-500 data-[type=info]:text-blue-500 data-[type=warning]:text-yellow-500">
                    <div className="text-muted-foreground">{output.preMessage}</div><Ansi>{output.message}</Ansi>
                </div> */}
            </>
            )}
        </div>
    </div>
}