import { Node } from "@xyflow/react"
import * as PingTemplate from "./ping"
import * as TokenTemplate from "./token"

export interface Template {
    name: string,
    description: string,
    nodes: Node[]
}

const templates: Template[] = [
    {
        name: "Ping Pong",
        description: "Simple Ping-Pong handler",
        nodes: PingTemplate.nodes
    },
    {
        name: "Token",
        description: "Create a new token",
        nodes: TokenTemplate.nodes
    }
]

export { templates }