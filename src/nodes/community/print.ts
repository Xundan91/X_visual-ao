import { NodeConfig } from "@/nodes/index/registry"
import { TNodeData } from "../index/type"
import { convertor } from "@/lib/utils"

export type data = {
    var: string
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
    },
    codeGenerator: (data_: TNodeData) => {
        const inputs = data_ as any
        console.log(inputs)
        return `print(${(inputs.varType == "VARIABLE" ? convertor.variable(inputs.var) : convertor.text(inputs.var)) || ""})`
    },
}