"use client";
// import BlocklyComponent from '@/blockly';
// import { xmlToLua } from '@/blockly/utils/xml';
import FlowPanel from '@/components/flow-panel';
import { Edge, Edges } from '@/edges';
import { useGlobalState } from '@/hooks/useGlobalStore';
import { installAPM, installPackage, parseOutupt, runLua } from '@/lib/aos';
import { getConnectedNodes } from '@/lib/events';
import { customNodes, Node, NodeEmbedFunctionMapping, Nodes, NodeSizes } from '@/nodes/index';
import { attachables, RootNodesAvailable, SubRootNodesAvailable, TNodeType } from '@/nodes/index/registry';
import { addEdge, Background, BackgroundVariant, Controls, MiniMap, ReactFlow, useEdgesState, useNodesState, useNodesData, NodeChange, EdgeChange, useReactFlow, ReactFlowProvider, SelectionMode } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useActiveAddress } from 'arweave-wallet-kit';
import { BoxIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const defaultNodes = [
  {
    id: "start",
    position: { x: 50, y: 200 },
    type: "start",
    data: {}
  }
];


export default function Main({ heightPerc }: { heightPerc?: number }) {
  return <ReactFlowProvider>
    <Flow heightPerc={heightPerc} />
  </ReactFlowProvider>
}

const ignoreChangesForNodes = ["start", "annotation"]
function Flow({ heightPerc }: { heightPerc?: number }) {
  const globals = useGlobalState()
  const address = useActiveAddress()
  const { setCenter, setViewport } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // add node
  useEffect(() => {
    const addNodeListener = ((e: CustomEvent) => {
      if (!globals.activeProcess) return
      const type = e.detail.type as TNodeType
      const attachTo = globals.attach
      const id = `${type}-${nodes.length}`

      const startNode = nodes.find(n => n.id == "start")
      if (!startNode) return console.log("no start node")
      const startNodePosition = startNode.position

      const newNodePosition = {
        x: startNodePosition.x + NodeSizes.normal.width + 50,
        y: startNodePosition.y
      }

      console.log("addNodeListener", type, attachTo)

      let leftAttachedNode: Node | undefined
      let lastAttachedNode: Node | undefined
      let attachable = false

      if (attachTo == "start") {
        leftAttachedNode = nodes.find(n => n.id == "start") as Node
        attachable = attachables.includes(type)

        // Find last node attached to start to position below it
        const attachedToStart = nodes.filter(n =>
          edges.some(e => e.source == "start" && e.target == n.id)
        ).sort((a, b) => a.position.y - b.position.y)

        if (attachedToStart.length > 0) {
          lastAttachedNode = attachedToStart[attachedToStart.length - 1] as Node
          newNodePosition.y = lastAttachedNode.position.y + NodeSizes.normal.height + 20
        }

        newNodePosition.x = leftAttachedNode.position.x + NodeSizes.normal.width + 50

      } else {
        leftAttachedNode = nodes.find(n => n.id == attachTo) as Node
        attachable = (leftAttachedNode?.data as any).attachable ?? false

        // Find last node attached to this node to position to the right of it
        const attachedToNode = nodes.filter(n =>
          edges.some(e => e.source == leftAttachedNode!.id && e.target == n.id)
        ).sort((a, b) => a.position.x - b.position.x)

        if (attachedToNode.length > 0) {
          const lastAttachedNode = attachedToNode[attachedToNode.length - 1]
          newNodePosition.x = leftAttachedNode.position.x + NodeSizes.normal.width + 50
          newNodePosition.y = lastAttachedNode.position.y + NodeSizes.normal.height + 20
        } else {
          // If no attached nodes yet, position to the right of the attached node
          newNodePosition.x = leftAttachedNode.position.x + NodeSizes.normal.width + 50
          newNodePosition.y = leftAttachedNode.position.y
        }
      }



      const newNode = {
        id,
        position: newNodePosition,
        type,
        data: { attachable }
      }

      setNodes(nodes => nodes.concat(newNode))

      if (attachTo == "start") {
        setEdges(edges => edges.concat({
          id: `start-${id}`,
          source: "start",
          target: id,
          type: "default"
        }))
      } else {
        setEdges(edges => edges.concat({
          id: `${attachTo!}-${id}`,
          source: attachTo!,
          target: id,
          type: "message"
        }))
      }

      globals.setAttach(undefined)
      globals.toggleSidebar(true)
      globals.setActiveNode({ ...newNode, data: newNode.data as any } as Node)

    }) as EventListener

    window.addEventListener("add-node", addNodeListener)
    return () => window.removeEventListener("add-node", addNodeListener)
  }, [nodes, setEdges, globals.activeProcess, globals.attach])

  // update node data
  useEffect(() => {
    const updateNodeDataListener = ((e: CustomEvent) => {
      const id = e.detail.id
      const data = e.detail.data
      setNodes(nodes => nodes.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n))
      console.log("updateNodeDataListener", id, data)
    }) as EventListener

    window.addEventListener("update-node-data", updateNodeDataListener)
    return () => window.removeEventListener("update-node-data", updateNodeDataListener)
  }, [nodes, setEdges, globals.activeProcess])

  // delete node
  useEffect(() => {
    const deleteNodeListener = ((e: CustomEvent) => {
      const id = e.detail.id

      // Check if node is connected to start
      const isConnectedToStart = edges.some(e => e.source === 'start' && e.target === id)


      if (isConnectedToStart) {
        // ask for confirmation
        if (!confirm("Are you sure you want to delete this node and all its descendants?")) return

        // Get all nodes that need to be deleted (the node and its descendants)
        const nodesToDelete = new Set<string>([id])
        let foundNew = true

        // Keep looking for connected nodes until no new ones are found
        while (foundNew) {
          foundNew = false
          edges.forEach(edge => {
            if (nodesToDelete.has(edge.source) && !nodesToDelete.has(edge.target)) {
              nodesToDelete.add(edge.target)
              foundNew = true
            }
          })
        }

        // Delete all connected nodes and their edges
        setNodes(nodes => nodes.filter(n => !nodesToDelete.has(n.id)))
        setEdges(edges => edges.filter(e => !nodesToDelete.has(e.source) && !nodesToDelete.has(e.target)))
      } else {
        // ask for confirmation
        if (!confirm("Are you sure you want to delete this node?")) return

        // Find edges connected to this node
        const incomingEdge = edges.find(e => e.target === id)
        const outgoingEdge = edges.find(e => e.source === id)

        // Delete the node
        setNodes(nodes => nodes.filter(n => n.id !== id))

        // Delete edges connected to this node
        setEdges(edges => {
          const filteredEdges = edges.filter(e => e.source !== id && e.target !== id)

          // If node had both incoming and outgoing edges, connect them
          if (incomingEdge && outgoingEdge) {
            filteredEdges.push({
              id: `${incomingEdge.source}-${outgoingEdge.target}`,
              source: incomingEdge.source,
              target: outgoingEdge.target,
              type: "message"
            })
          }

          return filteredEdges
        })
      }
    }) as EventListener

    window.addEventListener("delete-node", deleteNodeListener)
    return () => window.removeEventListener("delete-node", deleteNodeListener)
  }, [nodes, setEdges, edges])

  // load nodes and edges from localStorage
  useEffect(() => {
    if (!globals.activeProcess) return

    const savedNodes = localStorage.getItem(`flow-${globals.activeProcess}`)
    if (savedNodes) {
      setNodes(JSON.parse(savedNodes).nodes)
      setEdges(JSON.parse(savedNodes).edges)
    } else {
      setNodes(defaultNodes)
      setEdges([])
      localStorage.setItem(`flow-${globals.activeProcess}`, JSON.stringify({ nodes: defaultNodes, edges: [] }))
    }
  }, [globals.activeProcess])

  // save nodes and edges to localStorage
  useEffect(() => {
    if (!globals.activeProcess) return

    // Only save if this process was previously loaded
    const existingData = localStorage.getItem(`flow-${globals.activeProcess}`)
    if (!existingData) return

    // Compare with default state to avoid saving initial state
    const isDefaultState = nodes.length === 1 && nodes[0].id === "start" && edges.length === 0
    if (isDefaultState) return

    const saveItem = { nodes, edges }
    localStorage.setItem(`flow-${globals.activeProcess}`, JSON.stringify(saveItem))
  }, [globals.activeProcess, nodes, edges])


  // event: input: node id, callback: list of nodes connected to this node
  useEffect(() => {
    const getConnectedNodesListener = ((e: CustomEvent) => {
      const id = e.detail.id
      const result: any[] = []

      // Find direct connections from source node
      const directEdges = edges.filter(edge => edge.source === id)

      // Sort edges by y position of target nodes (top to bottom)
      const sortedEdges = directEdges.sort((a, b) => {
        const nodeA = nodes.find(n => n.id === a.target)
        const nodeB = nodes.find(n => n.id === b.target)
        return (nodeA?.position?.y || 0) - (nodeB?.position?.y || 0)
      })

      // Helper function to recursively build nested arrays of nodes
      const buildNodeTree = (currentId: string): any => {
        const currentNode = nodes.find(n => n.id === currentId)
        if (!currentNode) return null

        // Find nodes connected to current node
        const nextEdges = edges.filter(edge => edge.source === currentId)

        // Sort child edges by y position
        const sortedNextEdges = nextEdges.sort((a, b) => {
          const nodeA = nodes.find(n => n.id === a.target)
          const nodeB = nodes.find(n => n.id === b.target)
          return (nodeA?.position?.y || 0) - (nodeB?.position?.y || 0)
        })

        if (sortedNextEdges.length === 0) {
          // Leaf node
          return currentNode
        }

        // Get subtrees for all child nodes in sorted order
        const children = sortedNextEdges.map(edge => buildNodeTree(edge.target))
          .filter(child => child !== null)

        if (children.length === 0) {
          return currentNode
        }

        // Return node followed by array of child subtrees
        return [currentNode, children]
      }

      // Build tree starting from each direct connection in sorted order
      sortedEdges.forEach(edge => {
        const tree = buildNodeTree(edge.target)
        if (tree) {
          result.push(tree)
        }
      })

      e.detail.callback(result)
    }) as EventListener

    window.addEventListener("get-connected-nodes", getConnectedNodesListener)
    return () => window.removeEventListener("get-connected-nodes", getConnectedNodesListener)
  }, [nodes, edges])

  useEffect(() => {
    globals.setActiveProcess("")
    globals.setActiveNode(undefined)
    globals.setAttach(undefined)
    globals.setAvailableNodes([])
    globals.toggleSidebar(false)
  }, [address])

  async function onNodeClick(e: any, node: Node) {
    if (globals.flowIsRunning) return
    console.log("onNodeClick", node)

    switch (node.type) {
      case "annotation": break;
      case "start": {
        globals.setActiveNode(undefined)
        globals.setAttach(undefined)
        globals.toggleSidebar(false)

        const n = getConnectedNodes("start")
        console.log("n", n)

        break;
      }
      case "add-node": {
        globals.setAvailableNodes(RootNodesAvailable)
        globals.toggleSidebar(true)
        globals.setActiveNode(undefined)
        globals.setAttach(undefined)
        break;
      }

      default: {
        globals.setActiveNode(node)
        globals.toggleSidebar(true)
      }
    }
  }

  return (
    <div className="w-full h-[calc(100%-20px)]">
      <div className="h-5 flex items-center px-1 border-b text-xs">
        {globals.activeProcess && <>
          <BoxIcon size={14} className='mr-1' strokeWidth={1.2} />{globals.activeProcess}
          {globals.activeNode && <>
            <div className='px-1.5 text-base'>/</div>
            <div>{globals.activeNode?.id}</div>
            {/* {
              globals.editingNode && <>
                <div className='px-1.5 text-base'>/</div>
                <div>block editor</div>
              </>
            } */}
          </>}
        </>}
      </div>


      <ReactFlow
        // nodesDraggable={false}
        nodesConnectable={false}
        // nodesFocusable={false}
        // elementsSelectable={false}
        selectionOnDrag={true}
        selectionMode={SelectionMode.Partial}
        panOnDrag={false}
        panOnScroll={true}
        selectNodesOnDrag={true}
        style={{ height: `calc(calc(100vh-20px)-${heightPerc}%) !important` }}
        nodeTypes={Nodes}
        edgeTypes={Edges}
        nodes={globals.activeProcess ? nodes :
          [{ id: "no-prc-message", position: { x: 50, y: 50 }, data: { label: "Please select a process to start", muted: true, italic: true }, type: "annotation" }]}
        edges={edges}
        onNodeClick={onNodeClick as any}
        onNodesChange={(e: NodeChange[]) => {
          // prevent deletion
          const e_ = e.filter(e__ => e__.type !== "remove").filter(e__ => !ignoreChangesForNodes.includes((e__ as any).id))
          onNodesChange(e_ as any)
        }}
        onPaneClick={() => {
          globals.setActiveNode(undefined)
          globals.toggleSidebar(false)
          globals.setAttach(undefined)
          globals.setAvailableNodes([])
        }}
      >
        <FlowPanel />
        <Background variant={BackgroundVariant.Dots} bgColor="#f2f2f2" />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
}
