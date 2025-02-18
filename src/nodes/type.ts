import { data as HandlerAddNodeData } from "./core/handler-add"
import { data as AOSendNodeData } from "./core/ao-send"
import { data as FunctionNodeData } from "./core/function"
import { data as InstallPackageNodeData } from "./core/install-package"
import { data as CreateTokenNodeData } from "./core/token"
import { data as TransferNodeData } from "./core/transfer"

import { data as TemplateNodeData } from "./common/_template"

export type TNodeData = any
    | HandlerAddNodeData
    | AOSendNodeData
    | FunctionNodeData
    | InstallPackageNodeData
    | CreateTokenNodeData
    | TransferNodeData
    | TemplateNodeData
