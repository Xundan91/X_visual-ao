import { xmlToLua } from "@/blockly/utils/xml"
import { Edge } from "@/edges"
import { Node } from "@/nodes"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortAddress(address: string) {
  return `${address.slice(0, 5)}...${address.slice(-5)}`
}

export function embedHandler(name: string, action: string, xml: string) {
  return `${xmlToLua(xml)}

Handlers.add(
  "${name}",
  "${action}",
  ${name}Handler
)
`
}

export function getNodesOrdered(nodes: any, edges: any): Node[] {
  // make a list of connected nodes in order between start and add
  let edge: Edge = edges[0]
  let node: Node = nodes[0]
  const list = []
  while (edge.target != "add") {
    const nextNode = nodes.find((node: Node) => node.id == edge.target)
    const nextEdge = edges.find((edge: Edge) => edge.source == nextNode.id)
    if (!nextEdge) break
    node = nextNode
    edge = nextEdge
    list.push(node)
  }
  return list
}
