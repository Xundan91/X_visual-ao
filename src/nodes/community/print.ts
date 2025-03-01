import { NodeConfig } from "@/nodes/index/registry"
import { TNodeData } from "../index/type"
import { convertor } from "@/lib/utils"

export type data = {
    name: string
    randomText: string
    sampleDropdown: number
    sampleCheckbox: boolean
}

export const templateNode: NodeConfig = {
    name: "Print",
    type: "print",
    iconName: "SquareTerminal",
    outputType: "inherit",
    inputs: {
        "var": {
            label: "Variable Name (variable / value)",
            type: "text",
            input: "normal",
            placeholder: "Hello AO!",
            showVariableToggle: true,
            values: ["Hello AO!", "Hello World!", "gm"],
        },
        // randomText: {
        //     type: "text",
        //     input: "normal",
        //     placeholder: "Enter random text",
        //     values: ["Hello", "World", "Test", "Node"],
        // },
        // sampleDropdown: {
        //     type: "text",
        //     input: "dropdown",
        //     placeholder: "Select an option",
        //     values: ["Option 1", "Option 2", "Option 3", "Option 4"],
        // },
        // numberInputUwu: {
        //     type: "number",
        //     input: "normal",
        //     placeholder: "Enter a number"
        // },
        // sampleCheckbox: {
        //     type: "boolean",
        //     input: "checkbox",
        //     placeholder: "Select an option",
        // }
    },
    codeGenerator: (data_: TNodeData) => {
        const inputs = data_ as any
        console.log(inputs)
        return `print(${(inputs.varType == "VARIABLE" ? convertor.variable(inputs.var) : convertor.text(inputs.var)) || ""})`
    },
}