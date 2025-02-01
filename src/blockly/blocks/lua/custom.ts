import * as Blockly from 'blockly';
import { Block } from 'blockly';
import { BlockRegistration, registerBlock } from '../../utils/registry';
import { luaGenerator, Order } from 'blockly/lua';

// Define the block
const type = "custom_lua"
const block: BlockRegistration = {
    type,
    category: 'Lua',
    block: {
        init: function (this: Block) {
            this.appendDummyInput("Value")
                .appendField("run lua")
                .appendField(new Blockly.FieldTextInput(""), "Value")
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(230);
            this.setTooltip("write raw lua code");
        }
    },
    generator: (block: Block) => {
        const value = block.getFieldValue("Value") as string;
        return value + "\n";
    },
    toolbox: {
        type,
        kind: "block",
        inputs: {
            Value: {
                shadow: {
                    type: "text"
                }
            }
        }
    }
};

// Register the block
registerBlock(block); 