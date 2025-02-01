import * as Blockly from 'blockly';
import { Block, MenuOption } from 'blockly';
import { BlockRegistration, registerBlock } from '../../utils/registry';
import { luaGenerator, Order } from 'blockly/lua';

// Define common AO variables
const AO_VARS: MenuOption[] = [
    "ao.id",
    "Owner",
    "Inbox",
    "Handlers.list",
    "Prompt()",
    "ao.env.Module.Id"
].map(v => [v, v]); // Convert to format required by FieldDropdown

// Define the block
const type = "ao_vars"
const block: BlockRegistration = {
    type,
    category: 'AO',
    block: {
        init: function (this: Block) {
            this.appendDummyInput()
                .appendField(new Blockly.FieldDropdown(AO_VARS), "Variable")
            this.setOutput(true, null);
            // this.setPreviousStatement(true, null);
            // this.setNextStatement(true, null);
            this.setColour(230);
            this.setTooltip("Global AO variables");
        }
    },
    generator: (block: Block) => {
        const variable = block.getFieldValue("Variable") as string;
        return [variable, Order.ATOMIC];
    },
    toolbox: {
        type,
        kind: "block"
    }
};

// Register the block
registerBlock(block); 