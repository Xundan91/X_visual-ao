import { Button } from '@/components/ui/button';
import { useGlobalState } from '@/hooks/useGlobalStore';
import { CheckIcon, XIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useBlocklyWorkspace } from "react-blockly"
import { DEFAULT_XML } from './utils/xml';
import { data as HandlerAddData } from '@/nodes/handler-add';
import { luaGenerator } from 'blockly/lua';
import { initializeBlocks } from './utils/registry';
import { getToolboxConfiguration } from './toolbox';
import "./blocks"


initializeBlocks()
export default function BlocklyComponent() {
    const { activeNode } = useGlobalState()
    console.log(activeNode)
    const data = activeNode?.data as HandlerAddData
    // const [xmlV, setXmlV] = useState(data.blocklyXml || DEFAULT_XML.replace("<HANDLER_NAME>", "MyHandler"))

    const blocklyRef = useRef(null);

    const { workspace, xml } = useBlocklyWorkspace({
        ref: blocklyRef,
        workspaceConfiguration: { readOnly: false },
        toolboxConfiguration: getToolboxConfiguration(),
        initialXml: data.blocklyXml || DEFAULT_XML.replace("<HANDLER_NAME>", data.handlerName + "Handler"),
        onWorkspaceChange(workspace) {
            // console.log("workspace changed", workspace)
            console.log(luaGenerator.workspaceToCode(workspace))
        },
    });
    console.log(getToolboxConfiguration())
    const { setEditingNode, nodebarOpen, toggleNodebar } = useGlobalState()

    function discardBlocks() {
        setEditingNode(false)
    }

    function saveBlocks() {
        dispatchEvent(new CustomEvent("save-blocks", { detail: { xml } }))
        setEditingNode(false)
    }

    return <>
        <div ref={blocklyRef} className="z-10 w-[90vw] h-[90vh] border bg-white rounded-md overflow-clip"></div>
        <div className='w-full max-w-[90vw] p-1 flex gap-1 items-center justify-end'>
            <Button variant="secondary" className="hover:bg-destructive hover:text-white" onClick={discardBlocks}><XIcon /></Button>
            <Button variant="secondary" className="hover:bg-green-500 hover:text-white" onClick={saveBlocks}><CheckIcon /></Button>
        </div>
    </>
}