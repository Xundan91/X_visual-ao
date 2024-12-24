import { Block } from 'blockly';
import { BlockRegistration, registerBlock } from '../../utils/registry';
import * as Lua from 'blockly/lua';
import * as Blockly from 'blockly';
const type = "table_get"
const block: BlockRegistration = {
    type,
    category: 'Lua Tables',
    block: {
        init: function (this: Block) {
            this.setOutput(true, null);
            this.setInputsInline(true);
            this.setColour(230);
            this.appendValueInput('TABLE')
                .setCheck('TABLE')
                .appendField('get from table')
            this.appendValueInput('KEY')
                .setCheck(null)
                .appendField('key')
            this.setTooltip("Get a value from a table");
            this.setHelpUrl("");
        }
    },
    generator: (block: Block) => {
        const table = Lua.luaGenerator.valueToCode(block, 'TABLE', Lua.Order.ATOMIC) || '{}';
        const key = Lua.luaGenerator.valueToCode(block, 'KEY', Lua.Order.ATOMIC) || '1';
        return [`${table}[${key}]`, Lua.Order.ATOMIC];
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
            },
            KEY: {
                kind: "input",
                type: "text",
                shadow: {
                    type: "text",
                    fields: {
                        TEXT: "key"
                    }
                }
            }
        }
    }
};

registerBlock(block); 