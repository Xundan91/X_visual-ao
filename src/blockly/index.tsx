import { Button } from '@/components/ui/button';
import { useGlobalState } from '@/hooks/useGlobalStore';
import { CheckIcon, XIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useBlocklyWorkspace } from "react-blockly"
import { DEFAULT_XML, replaceXMLFieldValue } from './utils/xml';
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
        workspaceConfiguration: {
            readOnly: false,
            renderer: "thrasos",
            oneBasedIndex: true,
            theme: "material",
            comments: false,
            grid: {
                snap: true,
                spacing: 25,
                length: 5,
                colour: "#eee",
            },
            zoom: { controls: true },

        },
        toolboxConfiguration: getToolboxConfiguration(),
        initialXml: data.blocklyXml || DEFAULT_XML.replace("<HANDLER_NAME>", data.handlerName + "Handler"),
        onWorkspaceChange(workspace) {
            // console.log("workspace changed", workspace)
            console.log(luaGenerator.workspaceToCode(workspace))
            // console.log(workspace.getToolbox())
        },
    });
    console.log(getToolboxConfiguration())
    const { setEditingNode, nodebarOpen, toggleNodebar } = useGlobalState()

    function discardBlocks() {
        setEditingNode(false)
    }

    function saveBlocks() {
        if (!xml) return
        // find the field with name="NAME" and replace the value with the handler name
        const newXml = replaceXMLFieldValue(xml, "NAME", data.handlerName + "Handler")

        dispatchEvent(new CustomEvent("save-blocks", { detail: { xml: newXml } }))
        setEditingNode(false)
    }

    return <>
        <div className='w-fit absolute right-[5vw] top-16 pr-8 z-40 max-w-[90vw] flex gap-1 items-center justify-end'>
            <Button variant="secondary" className="!bg-transparent border-[#cfcfcf] border-[2.5px] hover:border-destructive text-[#cfcfcf] hover:text-destructive rounded-full p-0 !aspect-square" onClick={discardBlocks}><XIcon strokeWidth={3} /></Button>
            <Button variant="secondary" className="!bg-transparent border-[#cfcfcf] border-[2.5px] hover:border-green-500 text-[#cfcfcf] hover:text-green-500 rounded-full p-0 !aspect-square" onClick={saveBlocks}><CheckIcon strokeWidth={3} /></Button>
        </div>
        <div ref={blocklyRef} className="z-10 w-[90vw] h-[90vh] border bg-white rounded-md overflow-clip"></div>
    </>
}