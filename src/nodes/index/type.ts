import { data as HandlerNodeData } from "@/nodes/handler"
import { data as TokenNodeData } from "@/nodes/token"
import { data as CodeblockNodeData } from "@/nodes/codeblock"
import { data as SendMessageNodeData } from "@/nodes/send-message"
import { data as ConditionalNodeData } from "@/nodes/conditional"
import { data as LoopNodeData } from "@/nodes/loop"
import { TCommunityNodeType, TCommunityNodeData } from "../community/type"

export type TNodeType =
    | "start"
    | "add-node"
    | "annotation"
    | "handler"
    | "token"
    | "send-message"
    | "codeblock"
    | "conditional"
    | "loop"
    | TCommunityNodeType;

export type TNodeData = { attachable?: boolean | true } & (
    | HandlerNodeData
    | TokenNodeData
    | CodeblockNodeData
    | SendMessageNodeData
    | ConditionalNodeData
    | LoopNodeData
    | TCommunityNodeData
)