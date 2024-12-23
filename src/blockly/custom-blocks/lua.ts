import * as Blockly from "blockly";
import * as Lua from 'blockly/lua';

export function registerBlocks() {

    Blockly.Blocks['ao_send'] = {
        init: function (this: Blockly.Block) {
            this.appendValueInput("Message")
                .setCheck("TABLE")
                .appendField("Send");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(230);
            this.setTooltip("Send a message to an AO process");
        }
    };

    Blockly.Blocks['TABLE'] = {
        init: function (this: Blockly.Block) {
            this.setOutput(true, "TABLE");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(230);
            this.setTooltip("A table");
        },
    }

    Blockly.Blocks['lua_create_table'] = {
        init: function (this: Blockly.Block) {
            this.appendDummyInput()
                .appendField("create new table")
                .appendField(new Blockly.FieldVariable("table"), "VAR");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(230);
            this.setTooltip("Create a new Lua table");
        }
    };

    Blockly.Blocks['lua_table_set'] = {
        init: function (this: Blockly.Block) {
            this.appendValueInput("TABLE")
                .setCheck("TABLE")
                .appendField("set in table");
            this.appendValueInput("KEY")
                .appendField("key");
            this.appendValueInput("VALUE")
                .appendField("value");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(230);
            this.setTooltip("Set a value in a Lua table");
        }
    };

    Blockly.Blocks['lua_table_get'] = {
        init: function (this: Blockly.Block) {
            this.appendValueInput("TABLE")
                .setCheck("TABLE")
                .appendField("get from table");
            this.appendValueInput("KEY")
                .appendField("key");
            this.setOutput(true, null);
            this.setColour(230);
            this.setTooltip("Get a value from a Lua table");
        }
    };

    Blockly.Blocks['lua_table_length'] = {
        init: function (this: Blockly.Block) {
            this.appendValueInput("TABLE")
                .setCheck("TABLE")
                .appendField("length of table");
            this.setOutput(true, "Number");
            this.setColour(230);
            this.setTooltip("Get the length of a Lua table");
        }
    };

    Blockly.Blocks['lua_table_insert'] = {
        init: function (this: Blockly.Block) {
            this.appendValueInput("TABLE")
                .setCheck("TABLE")
                .appendField("insert into table");
            this.appendValueInput("VALUE")
                .appendField("value");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(230);
            this.setTooltip("Insert a value into a Lua table");
        }
    };

    Blockly.Blocks['lua_table_remove'] = {
        init: function (this: Blockly.Block) {
            this.appendValueInput("TABLE")
                .setCheck("TABLE")
                .appendField("remove from table");
            this.appendValueInput("INDEX")
                .setCheck("Number")
                .appendField("at index");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(230);
            this.setTooltip("Remove a value from a Lua table at the specified index");
        }
    };

    // Lua code generators
    Lua.luaGenerator.forBlock['ao_send'] = function (block) {
        const message = Lua.luaGenerator.valueToCode(block, 'Message', Lua.Order.ATOMIC);
        return `ao.send(${message})\n`;
    };

    Lua.luaGenerator.forBlock['TABLE'] = function (block) {
        return ["{}", Lua.Order.ATOMIC];
    }

    Lua.luaGenerator.forBlock['lua_create_table'] = function (block) {
        const varName = Lua.luaGenerator.nameDB_?.getName(block.getFieldValue('VAR'), 'VARIABLE');
        return `${varName} = {}\n`;
    };

    Lua.luaGenerator.forBlock['lua_table_set'] = function (block) {
        const table = Lua.luaGenerator.valueToCode(block, 'TABLE', Lua.Order.ATOMIC);
        const key = Lua.luaGenerator.valueToCode(block, 'KEY', Lua.Order.ATOMIC);
        const value = Lua.luaGenerator.valueToCode(block, 'VALUE', Lua.Order.ATOMIC);
        return `${table}[${key}] = ${value}\n`;
    };

    Lua.luaGenerator.forBlock['lua_table_get'] = function (block) {
        const table = Lua.luaGenerator.valueToCode(block, 'TABLE', Lua.Order.ATOMIC);
        const key = Lua.luaGenerator.valueToCode(block, 'KEY', Lua.Order.ATOMIC);
        return [`${table}[${key}]`, Lua.Order.ATOMIC];
    };

    Lua.luaGenerator.forBlock['lua_table_length'] = function (block) {
        const table = Lua.luaGenerator.valueToCode(block, 'TABLE', Lua.Order.ATOMIC);
        return [`#${table}`, Lua.Order.ATOMIC];
    };

    Lua.luaGenerator.forBlock['lua_table_insert'] = function (block) {
        const table = Lua.luaGenerator.valueToCode(block, 'TABLE', Lua.Order.ATOMIC);
        const value = Lua.luaGenerator.valueToCode(block, 'VALUE', Lua.Order.ATOMIC);
        return `table.insert(${table}, ${value})\n`;
    };

    Lua.luaGenerator.forBlock['lua_table_remove'] = function (block) {
        const table = Lua.luaGenerator.valueToCode(block, 'TABLE', Lua.Order.ATOMIC);
        const index = Lua.luaGenerator.valueToCode(block, 'INDEX', Lua.Order.ATOMIC);
        return `table.remove(${table}, ${index})\n`;
    };
    // // define a custom checker type called TABLE
    // Blockly.Blocks['TABLE'] = {
    //     init: function (this: Blockly.Block) {
    //         // make key value pair inputs possible
    //         // make any number of key value pairs possible
    //         this.setOutput(true, "TABLE");
    //         this.setColour(230);
    //         this.setTooltip("A table");
    //         this.setHelpUrl("");
    //     }
    // }

    // Lua.luaGenerator.forBlock['TABLE'] = function (block) {
    //     return "{}";
    // }

    // Blockly.Blocks['ao_send'] = {
    //     init: function (this: Blockly.Block) {
    //         // TypeError: Invalid block definition for type: TABLE

    //         this.appendValueInput("Message")
    //             .setCheck("TABLE")
    //             .appendField("Send");
    //         this.setPreviousStatement(true, null);
    //         this.setNextStatement(true, null);
    //         this.setColour(230);
    //         this.setTooltip("Send a message to an AO process");
    //         this.setHelpUrl("");

    //     }
    // }

    // Lua.luaGenerator.forBlock['ao_send'] = function (block) {
    //     console.log(block)
    //     const code = "ao.send({})"
    //     return code;
    // }
}