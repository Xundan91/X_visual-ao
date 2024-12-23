import { Block } from 'blockly';
import { BlockRegistration, registerBlock } from '../../utils/registry';
import * as Lua from 'blockly/lua';

const type = "table_insert"
const block: BlockRegistration = {
    type,
    category: 'Lua Tables',
    block: {
        init: function (this: Block) {
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(230);
            this.appendValueInput('TABLE')
                .setCheck('TABLE')
                .appendField('insert into table');
            this.appendValueInput('VALUE')
                .setCheck(null)
                .appendField('value');
            this.setTooltip("Insert a value at the end of a table");
            this.setHelpUrl("");
        }
    },
    generator: (block: Block) => {
        const table = Lua.luaGenerator.valueToCode(block, 'TABLE', Lua.Order.ATOMIC) || '{}';
        const value = Lua.luaGenerator.valueToCode(block, 'VALUE', Lua.Order.ATOMIC) || 'nil';
        return `table.insert(${table}, ${value})\n`;
    },
    toolbox: {
        type,
        kind: "block"
    }
};

registerBlock(block); 