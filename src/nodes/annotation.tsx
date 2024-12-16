import { PlusIcon } from "lucide-react";
import { Handle, Node, Position } from "@xyflow/react"
import { Button } from "@/components/ui/button";

export default function AnnotationNode(props: Node) {
    return <div className='w-[40vw] h-14'>
        <div className={`
            ${props.data.muted && "text-muted-foreground"}
            ${props.data.bold && "font-bold"}
            ${props.data.italic && "italic"}
            ${props.data.underline && "underline"}
            ${props.data.strike && "line-through"}
            ${props.data.color && `text-${props.data.color}`}
            ${props.data.size && `text-${props.data.size}`}

            `}>{props.data.label as string}</div>
    </div >
} 