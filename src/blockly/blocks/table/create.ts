import { Block } from 'blockly';
import { BlockRegistration, registerBlock } from '../../utils/registry';
import * as Lua from 'blockly/lua';

const type = "table_create"
const block: BlockRegistration = {
    type,
    category: 'Lua Tables',
    block: {
        init: function (this: Block) {
            this.setOutput(true, "TABLE");
            this.setColour(230);
            this.setTooltip("Create a new table");
            this.setHelpUrl("");
        }
    },
    generator: (block: Block) => {
        return ["{}", Lua.Order.ATOMIC];
    },
    toolbox: {
        type,
        kind: "block"
    }
};

registerBlock(block); 