import { TNodeData } from "@/nodes/index/type";
import { convertor } from "./utils";

export function processTemplate(template: string, data: TNodeData): string {
    let result = template;

    // Replace {varName} with actual values
    Object.entries(data).forEach(([key, value]: [string, any]) => {
        const varType = (data as any)[key + 'Type'];
        const placeholder = new RegExp(`{${key}}`, 'g');

        if (varType === 'VARIABLE') {
            result = result.replace(placeholder, convertor.variable(value).value);
        } else {
            result = result.replace(placeholder, convertor.text(value).value);
        }
    });

    return result;
} 