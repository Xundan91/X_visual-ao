import { ConnectButton } from "arweave-wallet-kit"
import { CopyIcon } from "lucide-react"

function Process({ processId, name }: { processId: string, name?: string }) {
    return <div className="grid grid-cols-2 items-center gap-1 hover:bg-black/10 p-1.5 cursor-pointer">
        <div className="truncate">{name}</div>
        <div className="flex items-center gap-1 truncate">
            <div className="truncate text-sm font-mono">#{processId}</div>
            <div className="cursor-pointer">
                <CopyIcon size={12} />
            </div>
        </div>
    </div>
}

export function LeftSidebar() {
    return (
        <div className="max-w-[238px] border-r">
            <div className="p-2">Visual AO</div>
            <ConnectButton />
            <div className="p-0">
                <div className="p-2">Processes</div>
                <Process processId="ib3jhE532TrzYQP5Weg5IigW97fLGzYYpqkUNjhm1Vg" />
                <Process processId="ib3jhE532TrzYQP5Weg5IigW97fLGzYYpqkUNjhm1Vg" name="testaddasdasdasdasdasdasdasdasasd1" />
                <Process processId="ib3jhE532TrzYQP5Weg5IigW97fLGzYYpqkUNjhm1Vg" name="Process 3" />
            </div>
        </div>
    )
}
