import { TNodeType } from "@/nodes/index/registry"

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

export function getConnectedNodes(id: string) {
    let connectedNodes: Node[] | undefined = undefined
    dispatchEvent(new CustomEvent("get-connected-nodes", {
        detail: {
            id,
            callback: (nodes: Node[]) => connectedNodes = nodes
        }
    }))

    while (connectedNodes == undefined)
        console.log("waiting for connected nodes")

    connectedNodes = connectedNodes as Node[]
    return connectedNodes
}