import { LeftSidebar } from "@/components/left-sidebar";
import { RightSidebar } from "@/components/right-sidebar";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import Main from "./main";
import Terminal from "@/components/console";
import { useEffect, useRef, useState } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";
import { useGlobalState } from "@/hooks/useGlobalStore";
import { getResults } from "@/lib/aos";
import { toast } from "sonner";
import Ansi from "ansi-to-react";
import { tutorial } from "@/tutorial";
import TopBar from "@/components/top-bar";

export default function Index() {
    const consoleRef = useRef<ImperativePanelHandle>(null);
    const sidebarRef = useRef<ImperativePanelHandle>(null);
    const { setConsoleRef, setSidebarRef } = useGlobalState();
    const { activeProcess, addOutput } = useGlobalState();
    const [consoleSize, setConsoleSize] = useState(0);

    useEffect(() => {
        if (consoleRef.current) {
            setConsoleRef(consoleRef);
        }
    }, [consoleRef]);

    useEffect(() => {
        if (sidebarRef.current) {
            setSidebarRef(sidebarRef);
        }
    }, [sidebarRef]);

    useEffect(() => {
        if (!activeProcess) return clearInterval(localStorage.getItem("intervalId") as string)

        const intervalId = setInterval(async () => {
            const res = await getResults(activeProcess, localStorage.getItem("cursor") || "")
            localStorage.setItem("cursor", res.cursor)
            if (res.results.length > 5) return
            res.results.forEach(result => {
                console.log(result)
                if (result.Output.print && result.Output.data) {
                    addOutput({ type: "output", message: result.Output.data as string })
                    toast(<pre className="max-h-[269px] overflow-scroll"><Ansi>{result.Output.data as string}</Ansi></pre>, { style: { backgroundColor: "whitesmoke" } })
                }
            })
        }, 2000) as unknown as string
        localStorage.setItem("intervalId", intervalId)

        return () => {
            clearInterval(intervalId)
        }
    }, [activeProcess])

    return <div className="flex flex-col border h-screen">
        <TopBar />
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel maxSize={25} minSize={15} defaultSize={15} className="overflow-visible">
                <LeftSidebar />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel>
                {/* <Main /> */}
                <ResizablePanelGroup direction="vertical" className=" transition-all duration-200">
                    <ResizablePanel>
                        {/* console size to whole number */}
                        {/* <ReactFlowProvider>
                        </ReactFlowProvider> */}
                        <Main heightPerc={Math.round(consoleSize)} />
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel ref={consoleRef} minSize={5} maxSize={50} collapsedSize={0} defaultSize={0} collapsible
                        onResize={(current, prev) => { setConsoleSize(current) }}>
                        <Terminal />
                    </ResizablePanel>
                </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel ref={sidebarRef} maxSize={50} minSize={15} defaultSize={5} collapsible>
                <RightSidebar />
            </ResizablePanel>
        </ResizablePanelGroup>
    </div>
}