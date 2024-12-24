import { Block } from 'blockly';
import { BlockRegistration, registerBlock } from '../../utils/registry';
import * as Lua from 'blockly/lua';
import * as Blockly from 'blockly';

const type = "key_value"
const block: BlockRegistration = {
    hidden: true,
    type,
    category: 'Lua Tables',
    block: {
        init: function (this: Block) {
            this.appendValueInput("key")
                // .setCheck("text")
                .appendField("Key");
            this.appendValueInput("value")
                // .setCheck("text")
                .appendField("Value");
            this.setOutput(true, "key_value")
            this.setColour(230);
            this.setTooltip("Create a new key value pair");
            this.setHelpUrl("");
        }
    },
    generator: (block: Block) => {
        const key = Lua.luaGenerator.valueToCode(block, 'key', Lua.Order.ATOMIC) || 'nil';
        const value = Lua.luaGenerator.valueToCode(block, 'value', Lua.Order.ATOMIC) || 'nil';
        return [`[${key}] = ${value}`, Lua.Order.ATOMIC];
    },
    toolbox: {
        type,
        kind: "block"
    }
};

registerBlock(block); 