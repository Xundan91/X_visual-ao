import { Block } from 'blockly';
import { BlockRegistration, registerBlock } from '../../utils/registry';
import { luaGenerator, Order } from 'blockly/lua';

// Define the block
const type = "lua_print"
const block: BlockRegistration = {
    type,
    category: 'Lua',
    block: {
        init: function (this: Block) {
            this.appendValueInput("Value")
                .setCheck(null)
                .appendField("print")
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(230);
            this.setTooltip("Prints the value to the console");
        }
    },
    generator: (block: Block) => {
        const message = luaGenerator.valueToCode(block, 'Value', Order.ATOMIC);
        return `print(${message})\n`;
    },
    toolbox: {
        type,
        kind: "block",
    }
};

// Register the block
registerBlock(block); 