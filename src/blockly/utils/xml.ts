import * as Blockly from "blockly"
import { luaGenerator } from "blockly/lua";

export const DEFAULT_XML = `<xml xmlns="https://developers.google.com/blockly/xml">
    <variables>
        <variable id="msg">msg</variable>
    </variables>
    <block type="procedures_defnoreturn" id="xyz" x="63" y="63">
        <mutation>
            <arg name="msg" varid="msg"></arg>
        </mutation>
        <field name="NAME"><HANDLER_NAME></field>
    </block>
</xml>`

export function replaceXMLFieldValue(xmlString: string, fieldName: string, value: string): string {
    const xmlDoc = new DOMParser().parseFromString(xmlString, "application/xml");
    const field = xmlDoc.querySelector(`field[name="${fieldName}"]`);
    if (field) field.textContent = value

    const newXml = new XMLSerializer().serializeToString(xmlDoc)
    return newXml
}

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