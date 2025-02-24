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

const maxTries = 1000

export type TConnectedNodes = (Node | (Node | (Node | Node[])[])[])[]
export function getConnectedNodes(id: string): TConnectedNodes {
    let connectedNodes: TConnectedNodes | undefined = undefined
    dispatchEvent(new CustomEvent("get-connected-nodes", {
        detail: {
            id,
            callback: (nodes: TConnectedNodes) => connectedNodes = nodes
        }
    }))

    let tries = 0
    while (connectedNodes == undefined && tries < maxTries) {
        tries++
        console.log("waiting for connected nodes")
    }

    if (connectedNodes == undefined) {
        console.error("failed to get connected nodes")
        return []
    }
    connectedNodes = connectedNodes as TConnectedNodes
    return connectedNodes
}

export function getCode(id: string, data: {}): Promise<string> {
    return new Promise((resolve) => {
        dispatchEvent(new CustomEvent("get-code", {
            detail: { id, data, callback: resolve }
        }))
    })
}