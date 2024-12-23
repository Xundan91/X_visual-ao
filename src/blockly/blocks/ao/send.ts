import { Block } from 'blockly';
import { BlockRegistration, registerBlock } from '../../utils/registry';
import { luaGenerator, Order } from 'blockly/lua';

// Define the block
const type = "ao_send"
const block: BlockRegistration = {
    type,
    category: 'AO',
    block: {
        init: function (this: Block) {
            this.appendValueInput("Message")
                .setCheck("TABLE")
                .appendField("Send");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(230);
        }
    },
    generator: (block: Block) => {
        const message = luaGenerator.valueToCode(block, 'Message', Order.ATOMIC);
        return `ao.send(${message})\n`;
    },
    toolbox: {
        type,
        kind: "block",
        inputs: {
            Message: {
                shadow: {
                    type: "TABLE"
                }
            }
        }
    }
};

// Register the block
registerBlock(block); 