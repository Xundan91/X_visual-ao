import { TNodeType } from "@/nodes/index/registry"
import { Node } from "@/nodes/index"
import { Edge } from "@/edges"

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

export function addEdge(edge: Edge) {
    dispatchEvent(new CustomEvent("add-edge", { detail: { edge } }))
}

export function removeEdge(id: string) {
    dispatchEvent(new CustomEvent("remove-edge", { detail: { id } }))
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

export function getCode(nodeId: string, nodeData?: any): Promise<string> {
    return new Promise((resolve) => {
        const event = new CustomEvent("get-code", {
            detail: {
                id: nodeId,
                data: nodeData,
                callback: (code: string) => {
                    resolve(code);
                }
            }
        });

        window.dispatchEvent(event);
    });
}