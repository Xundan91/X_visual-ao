import { LeftSidebar } from "@/components/left-sidebar";
import { RightSidebar } from "@/components/right-sidebar";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import Main from "./main";
import Terminal from "@/components/console";
import { useEffect, useRef } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";
import { useGlobalState } from "@/hooks/useGlobalStore";
import { getResults } from "@/lib/aos";

export default function Index() {
    const consoleRef = useRef<ImperativePanelHandle>(null);
    const { setConsoleRef } = useGlobalState();
    const { activeProcess, addOutput } = useGlobalState();

    useEffect(() => {
        if (consoleRef.current) {
            setConsoleRef(consoleRef);
        }
    }, [consoleRef]);

    useEffect(() => {
        if (!activeProcess) return clearInterval(localStorage.getItem("intervalId") as string)

        const intervalId = setInterval(async () => {
            const res = await getResults(activeProcess, localStorage.getItem("cursor") || "")
            localStorage.setItem("cursor", res.cursor)
            if (res.results.length > 5) return
            res.results.forEach(result => {
                console.log(result)
                if (result.Output.print && result.Output.data)
                    addOutput({ type: "output", message: result.Output.data as string })
            })
        }, 1000) as unknown as string
        localStorage.setItem("intervalId", intervalId)

        return () => {
            clearInterval(intervalId)
        }
    }, [activeProcess])

    return <div className="flex border h-screen">
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel maxSize={30} minSize={15} defaultSize={20}>
                <LeftSidebar />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel>
                {/* <Main /> */}
                <ResizablePanelGroup direction="vertical">
                    <ResizablePanel>
                        <Main />
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel ref={consoleRef} minSize={5} maxSize={50} collapsedSize={0} defaultSize={0} collapsible
                        onCollapse={() => console.log("collapse")} onExpand={() => console.log("expand")} >
                        <Terminal />
                    </ResizablePanel>
                </ResizablePanelGroup>
            </ResizablePanel>
        </ResizablePanelGroup>
        <div className="z-20 absolute right-0">
            <RightSidebar />
        </div>
    </div>
}