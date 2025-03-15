import { OutputType, useGlobalState } from "@/hooks/useGlobalStore";
import { ChevronDownIcon, Eraser, SquareArrowOutUpRight, TerminalIcon, TrashIcon } from "lucide-react"
import { useEffect } from "react";
import Ansi from "ansi-to-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import Link from "next/link";

export default function Output() {
    const { outputs, consoleRef, clearOutputs } = useGlobalState();

    useEffect(() => {
        const container = document.getElementById("console-container");
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, [outputs]);

    return <div className="text-sm relative h-full">
        <div className="flex items-center justify-between border-b px-0.5 gap-1">
            <div className="flex items-center gap-1"><TerminalIcon className="w-4 h-4  rounded-xs" />console</div>
            {/* clear button */}
            <div className="flex items-center gap-1 pr-1">
                <Eraser className="w-4 h-4 cursor-pointer hover:bg-black/10 rounded-sm p-[1px]" onClick={() => clearOutputs()} />
                <ChevronDownIcon className="w-4 h-4 cursor-pointer hover:bg-black/10 rounded-sm" onClick={() => consoleRef?.current?.collapse()} />
            </div>
        </div>
        {/* scrollable div for output list */}
        {/* always make sure the scroll is at the bottom */}
        <div id="console-container" className="overflow-scroll h-full scroll-smooth flex flex-col gap-0.5 dark:bg-black/50 pb-20">
            {outputs.map((output: OutputType, index) =>
                <Dialog key={index}>
                    <DialogTrigger data-type={output.type} className="flex items-center justify-start gap-0.5 whitespace-nowrap text-xs font-mono data-[type=error]:text-red-500 data-[type=success]:text-green-500 data-[type=info]:text-blue-500 data-[type=warning]:text-yellow-500 dark:hover:bg-background hover:bg-muted p-1 px-1.5 outline-none">
                        <pre data-type={output.type} className="text-start data-[type=error]:text-red-500 data-[type=success]:text-green-500 data-[type=info]:text-blue-500 data-[type=warning]:text-yellow-500"><Ansi className="">{output.message.toString()}</Ansi></pre>
                    </DialogTrigger>
                    <DialogContent className="max-w-[70vw] text-sm">
                        <DialogHeader className="flex flex-row items-center gap-6">
                            <div className="font-semibold">{output.preMessage ? `node : ${output.preMessage}` : "Output"}</div>
                            {output.aoMessage && <Link href={`https://aolink.ar.io/#/message/${output.aoMessage?.id}`} target="_blank" className="hover:underline pb-1 text-xs flex gap-1 items-center text-muted-foreground">{output.aoMessage?.id} <SquareArrowOutUpRight className="w-3 h-3" /></Link>}
                        </DialogHeader>
                        <pre data-type={output.type}
                            className="max-h-[50vh] bg-muted p-2 rounded-md overflow-scroll data-[type=error]:text-red-500 data-[type=success]:text-green-500 data-[type=info]:text-blue-500 data-[type=warning]:text-yellow-500 dark:bg-black/50 dark:text-white">
                            <Ansi>{output.message.toString()}</Ansi>
                        </pre>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    </div>
}