import { Button } from '@/components/ui/button';
import { useGlobalState } from '@/hooks/useGlobalStore';
import { CheckIcon, XIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useBlocklyWorkspace } from "react-blockly"
import { DEFAULT_XML, replaceXMLFieldValue } from './utils/xml';
import { luaGenerator } from 'blockly/lua';
import { initializeBlocks } from './utils/registry';
import { getToolboxConfiguration } from './toolbox';
import { data as HandlerAddData } from '@/nodes/handler-add';
import { data as FunctionData } from '@/nodes/function';
import "./blocks"

initializeBlocks()
export default function BlocklyComponent() {
    const { activeNode } = useGlobalState()
    console.log(activeNode)
    const data = activeNode?.data as HandlerAddData & FunctionData
    console.log(data.blocklyXml)
    const blocklyRef = useRef(null);

    let xml_ = data.blocklyXml
    switch (activeNode?.type) {
        case "handler-add":
            xml_ = replaceXMLFieldValue(xml_, "NAME", data.handlerName + "Handler")
            break
        case "function":
            xml_ = replaceXMLFieldValue(xml_, "NAME", data.functionName)
            break
    }

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
        initialXml: xml_ || DEFAULT_XML.replace("<FUNC_NAME>", "func"),
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
        // find the field with name="FUNC_NAME" and replace the value with the handler name
        console.log(xml)
        let name = "func"
        switch (activeNode?.type) {
            case "handler-add":
                name = data.handlerName + "Handler"
                break
            case "function":
                name = data.functionName
                break
        }
        const newXml = replaceXMLFieldValue(xml, "NAME", name)

        dispatchEvent(new CustomEvent("save-blocks", { detail: { id: activeNode?.id, xml: newXml } }))
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