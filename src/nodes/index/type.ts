// import { data as HandlerAddNodeData } from "./core/handler-add"
// import { data as AOSendNodeData } from "./core/ao-send"
// import { data as FunctionNodeData } from "./core/function"
// import { data as InstallPackageNodeData } from "./core/install-package"
// import { data as CreateTokenNodeData } from "./core/token"
// import { data as TransferNodeData } from "./core/transfer"
import { data as HandlerNodeData } from "@/nodes/handler"
import { data as TokenNodeData } from "@/nodes/token"
import { data as CodeblockNodeData } from "@/nodes/codeblock"
import { data as SendMessageNodeData } from "@/nodes/send-message"

import { data as TemplateNodeData } from "@/nodes/_template"

// export type TNodeData = any
//     | HandlerAddNodeData
//     | AOSendNodeData
//     | FunctionNodeData
//     | InstallPackageNodeData
//     | CreateTokenNodeData
//     | TransferNodeData
//     | TemplateNodeData

export type TNodeData = { attachable?: boolean | true } & (
    | HandlerNodeData
    | TokenNodeData
    | CodeblockNodeData
    | SendMessageNodeData
    | TemplateNodeData
)