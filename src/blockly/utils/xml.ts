import * as Blockly from "blockly"
import { luaGenerator } from "blockly/lua";

export const DEFAULT_XML = `<xml xmlns="https://developers.google.com/blockly/xml">
    <variables>
        <variable id="qP-G\`#ofza~ff3ZnKMWb">msg</variable>
    </variables>
    <block type="procedures_defnoreturn" id=", xZj, zAg\`aycT2$5CNj7" x="244" y="187">
        <mutation>
            <arg name="msg" varid="qP-G\`#ofza~ff3ZnKMWb"></arg>
        </mutation>
        <field name="NAME"><HANDLER_NAME></field>
    </block>
</xml>`

export function xmlToLua(xmlString: string): string {
    // Create a headless workspace
    const workspace = new Blockly.Workspace();
    
    try {
        // Load the XML into the workspace
        const xml = Blockly.utils.xml.textToDom(xmlString);
        Blockly.Xml.domToWorkspace(xml, workspace);
        
        // Generate Lua code
        const code = luaGenerator.workspaceToCode(workspace);
        
        return code;
    } finally {
        // Clean up the workspace
        workspace.dispose();
    }
}