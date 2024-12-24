import { Block } from 'blockly';
import { BlockRegistration, registerBlock } from '../../utils/registry';
import * as Lua from 'blockly/lua';

const type = "table_length"
const block: BlockRegistration = {
    type,
    category: 'Lua Tables',
    block: {
        init: function (this: Block) {
            this.setOutput(true, 'Number');
            this.setColour(230);
            this.appendValueInput('TABLE')
                .setCheck('TABLE')
                .appendField('length of table');
            this.setTooltip("Get the length of a table");
            this.setHelpUrl("");
        }
    },
    generator: (block: Block) => {
        const table = Lua.luaGenerator.valueToCode(block, 'TABLE', Lua.Order.ATOMIC) || '{}';
        return [`#${table}`, Lua.Order.ATOMIC];
    },
    toolbox: {
        type,
        kind: "block",
        inputs: {
            TABLE: {
                shadow: {
                    type: "TABLE",
                    fields: {
                        TABLE: "table"
                    }
                }
            }
        }
    }
};

registerBlock(block); 