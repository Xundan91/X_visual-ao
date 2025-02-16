import { Button } from '@/components/ui/button';
import { useGlobalState } from '@/hooks/useGlobalStore';
import { CheckIcon, XIcon } from 'lucide-react';
import { useRef } from 'react';
import { useBlocklyWorkspace } from 'react-blockly';
import { DEFAULT_XML, replaceXMLFieldValue } from './utils/xml';
import { luaGenerator } from 'blockly/lua';
import { initializeBlocks } from './utils/registry';
import { getToolboxConfiguration } from './toolbox';
import * as Blockly from 'blockly';
import { data as HandlerAddData } from '@/nodes/core/handler-add';
import { data as FunctionData } from '@/nodes/core/function';
import './blocks';

initializeBlocks();

export default function BlocklyComponent() {
    const { activeNode, setEditingNode } = useGlobalState();

    const data = activeNode?.data as HandlerAddData & FunctionData;
    const defaultFunctionName =
        activeNode?.type === 'handler-add'
            ? `${data.handlerName}Handler`
            : data.functionName;

    const blocklyRef = useRef<HTMLDivElement>(null);

    const { xml } = useBlocklyWorkspace({
        ref: blocklyRef,
        workspaceConfiguration: {
            readOnly: false,
            renderer: 'thrasos',
            oneBasedIndex: true,
            comments: false,
            grid: {
                snap: true,
                spacing: 25,
                length: 5,
                colour: '#eee',
            },
            zoom: { controls: true },
        },
        toolboxConfiguration: getToolboxConfiguration(),
        initialXml:
            data.blocklyXml || DEFAULT_XML.replace('<FUNC_NAME>', defaultFunctionName),
        onWorkspaceChange(workspace) {
            console.log(luaGenerator.workspaceToCode(workspace));
        },
    });

    function handleDiscard() {
        setEditingNode(false);
    }

    function handleSave() {
        if (!xml) return;
        const newXml = replaceXMLFieldValue(xml, 'NAME', defaultFunctionName);
        dispatchEvent(
            new CustomEvent('save-blocks', { detail: { id: activeNode?.id, xml: newXml } })
        );
        setEditingNode(false);
    }

    return (
        <>
            <div className="absolute right-[5vw] top-16 pr-8 z-40 max-w-[90vw] flex gap-1 items-center justify-end">
                <Button
                    variant="secondary"
                    className="!bg-transparent border-[#cfcfcf] border-[2.5px] hover:border-destructive text-[#cfcfcf] hover:text-destructive rounded-full p-0 !aspect-square"
                    onClick={handleDiscard}
                >
                    <XIcon strokeWidth={3} />
                </Button>
                <Button
                    variant="secondary"
                    className="!bg-transparent border-[#cfcfcf] border-[2.5px] hover:border-green-500 text-[#cfcfcf] hover:text-green-500 rounded-full p-0 !aspect-square"
                    onClick={handleSave}
                >
                    <CheckIcon strokeWidth={3} />
                </Button>
            </div>
            <div
                ref={blocklyRef}
                className="z-10 w-[90vw] h-[90vh] border bg-white rounded-md overflow-clip"
            ></div>
        </>
    );
}