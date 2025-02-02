import * as Blockly from 'blockly';
import { Block } from 'blockly';
import { BlockRegistration, registerBlock } from '../../utils/registry';
import { luaGenerator, Order } from 'blockly/lua';

// Define the block
const type = "custom_lua_return"
const block: BlockRegistration = {
    type,
    category: 'Lua',
    block: {
        init: function (this: Block) {
            this.appendDummyInput("Value")
                .appendField("execute")
                .appendField(new Blockly.FieldTextInput("ao.id"), "Value");
            this.setOutput(true, null);
            this.setColour(230);
            this.setTooltip("write raw lua code");
        }
    },
    generator: (block: Block) => {
        const value = (block.getFieldValue("Value") as string);
        // const valueNoReturn = (value.startsWith("return") ? value.slice(6) : value).trim();
        return [`${value}`, Order.ATOMIC];
    },
    toolbox: {
        type,
        kind: "block"
    }
};

// Register the block
registerBlock(block); 