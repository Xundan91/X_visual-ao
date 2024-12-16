import { Button } from '@/components/ui/button';
import { useGlobalState } from '@/hooks/useGlobalStore';
import { CheckIcon, XIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { ToolboxDefinition, BlocklyWorkspace, useBlocklyWorkspace } from "react-blockly"
import { toolboxConfiguration } from './toolbox';

export default function BlocklyComponent() {
    const blocklyRef = useRef(null);
    const { workspace, xml } = useBlocklyWorkspace({
        ref: blocklyRef,
        workspaceConfiguration: { readOnly: false },
        toolboxConfiguration: toolboxConfiguration, // this must be a JSON toolbox definition
        initialXml: `<xml xmlns="http://www.w3.org/1999/xhtml"></xml>`,
        onWorkspaceChange(workspace) {
            // console.log("workspace changed", workspace)
        },
    });
    const { setEditingNode, nodebarOpen, toggleNodebar } = useGlobalState()

    useEffect(() => {
        function onSaveEvent() {
            saveBlocks()
        }

        window.addEventListener("save-blocks", onSaveEvent)
        return () => window.removeEventListener("save-blocks", onSaveEvent)

    }, [])

    function saveBlocks() {
        console.log("xml", xml)
        setEditingNode(false)
    }

    return <div className="z-20 flex flex-col items-center justify-center">
        <div ref={blocklyRef} className="relative z-10 w-[90vw] h-[90vh] border bg-white rounded-md overflow-clip"></div>
        {/* <div className='w-full max-w-[90vw] p-1 flex gap-1 items-center justify-end'>
            <Button variant="secondary" className="hover:bg-destructive hover:text-white" onClick={discardBlocks}><XIcon /></Button>
            <Button variant="secondary" className="hover:bg-green-500 hover:text-white" onClick={saveBlocks}><CheckIcon /></Button>
        </div> */}
    </div>
}