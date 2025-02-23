import { TNodeType } from "@/nodes/index/registry"
import { Node } from "@/nodes/index"

export function addNode(type: TNodeType, extraDetail?: {}) {
    dispatchEvent(new CustomEvent("add-node", { detail: { type, ...extraDetail } }))
}

export function deleteNode(id: string, extraDetail?: {}) {
    dispatchEvent(new CustomEvent("delete-node", { detail: { id, ...extraDetail } }))
}

export function runNode(id: string, extraDetail?: {}) {
    dispatchEvent(new CustomEvent("run-node", { detail: { id, ...extraDetail } }))
}

export function updateNodeData(id: string, data: {}) {
    dispatchEvent(new CustomEvent("update-node-data", { detail: { id, data } }))
}

export type TConnectedNodes = (Node | (Node | (Node | Node[])[])[])[]
export function getConnectedNodes(id: string): TConnectedNodes {
    let connectedNodes: TConnectedNodes | undefined = undefined
    dispatchEvent(new CustomEvent("get-connected-nodes", {
        detail: {
            id,
            callback: (nodes: TConnectedNodes) => connectedNodes = nodes
        }
    }))

    while (connectedNodes == undefined)
        console.log("waiting for connected nodes")

    connectedNodes = connectedNodes as TConnectedNodes
    return connectedNodes
}

export function getCode(id: string, data: {}): string {
    let code: string | undefined = undefined
    dispatchEvent(new CustomEvent("get-code", {
        detail: { id, data, callback: (_: string) => code = _ }
    }))

    while (code == undefined)
        console.log("waiting for code")

    return code as string
}