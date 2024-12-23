import * as Blockly from "blockly";
import * as Lua from 'blockly/lua';

export function registerBlocks() {
    // define a custom checker type called TABLE
    Blockly.Blocks['TABLE'] = {
        init: function (this: Blockly.Block) {
            // make key value pair inputs possible
            // make any number of key value pairs possible
            this.setOutput(true, "TABLE");
            this.setColour(230);
            this.setTooltip("A table");
            this.setHelpUrl("");
        }
    }

    Lua.luaGenerator.forBlock['TABLE'] = function (block) {
        return "{}";
    }

    Blockly.Blocks['ao_send'] = {
        init: function (this: Blockly.Block) {
            // TypeError: Invalid block definition for type: TABLE

            this.appendValueInput("Message")
                .setCheck("TABLE")
                .appendField("Send");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(230);
            this.setTooltip("Send a message to an AO process");
            this.setHelpUrl("");

        }
    }

    Lua.luaGenerator.forBlock['ao_send'] = function (block) {
        console.log(block)
        const code = "ao.send({})"
        return code;
    }
}