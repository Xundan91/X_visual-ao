import { Block } from 'blockly';
import { BlockRegistration, registerBlock } from '../../utils/registry';
import { luaGenerator, Order } from 'blockly/lua';
import * as Blockly from 'blockly';

// Define the block
const type = "ao_id"
const block: BlockRegistration = {
    type,
    category: 'AO',
    block: {
        init: function (this: Block) {
            this.appendDummyInput()
                .appendField("ao.id")
            this.setOutput(true, null);
            this.setColour(230);
        }
    },
    generator: (block: Block) => {
        return `ao.id\n`;
    },
    toolbox: {
        type,
        kind: "block",
    }
};

// Register the block
registerBlock(block); 