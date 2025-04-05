"use client";
// import BlocklyComponent from '@/blockly';
// import { xmlToLua } from '@/blockly/utils/xml';
import FlowPanel from '@/components/flow-panel';
import { Edge, Edges, TEdges } from '@/edges';
import { useGlobalState } from '@/hooks/useGlobalStore';
import { installAPM, installPackage, parseOutupt, runLua, spawnToken } from '@/lib/aos';
import { getCode, getConnectedNodes, updateNodeData } from '@/lib/events';
import { customNodes, Node, Nodes, NodeSizes } from '@/nodes/index';
import { attachables, nodeConfigs, RootNodesAvailable, SubRootNodesAvailable } from '@/nodes/index/registry';
import '@xyflow/react/dist/style.css';
import { useActiveAddress } from 'arweave-wallet-kit';
import { data as TokenData } from '@/nodes/token';
import { toast } from 'sonner';
import { TNodeType } from '@/nodes/index/type';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button'; 
import { useHistoryStore } from '@/hooks/history-store'; 
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { BoxIcon, Redo2Icon, Undo2Icon } from 'lucide-react'; 
import { addEdge, Background, BackgroundVariant, Controls, MiniMap, ReactFlow, useEdgesState, useNodesState, NodeChange, EdgeChange, useReactFlow, ReactFlowProvider, SelectionMode } from '@xyflow/react';


// const defaultNodes = [
//   {
//     id: "start",
//     position: { x: 50, y: 200 },
//     type: "start",
//     data: {}
//   }
// ];
//  New defaultNodes 
const defaultNodes: any[] = [
  {
    id: "start",
    position: { x: 50, y: 200 },
    type: "start",
    data: {
      label: "Start",          
      attachable: true          
    }
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
  const { theme } = useTheme()
  const { setCenter, setViewport, fitView } = useReactFlow();
  const { setActiveNode } = useGlobalState()
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  
  // For tracking whether changes should be recorded in history
  const [shouldRecordHistory, setShouldRecordHistory] = useState(true);
  
  // Debounce timer here
  const historyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Get history store methods
  const { 
    saveCurrent, 
    undo, 
    redo, 
    clear: clearHistory, 
    canUndo, 
    canRedo,
    performingUndoRedo,
    setPerformingUndoRedo
  } = useHistoryStore();
  
  const saveToHistory = useCallback(() => {
    if (!shouldRecordHistory || performingUndoRedo) return;
    
    if (historyTimer.current) {
      clearTimeout(historyTimer.current);
    }
    
    historyTimer.current = setTimeout(() => {
      saveCurrent({ nodes, edges });
    }, 300); 
  }, [nodes, edges, saveCurrent, shouldRecordHistory, performingUndoRedo]);
  
  useEffect(() => {
    saveToHistory();
    
    return () => {
      if (historyTimer.current) {
        clearTimeout(historyTimer.current);
      }
    };
  }, [nodes, edges, saveToHistory]);
  
  // Handle undo
  const handleUndo = useCallback(() => {
    if (!canUndo()) return;
    
    const previous = undo();
    if (!previous) return;
    
    setShouldRecordHistory(false);
    
    setNodes(previous.nodes);
    setEdges(previous.edges);
    
    setTimeout(() => {
      setPerformingUndoRedo(false);
      setShouldRecordHistory(true);
    }, 50);
  }, [canUndo, undo, setNodes, setEdges, setPerformingUndoRedo]);
  
  // Handle redo
  const handleRedo = useCallback(() => {
    if (!canRedo()) return;
    
    const next = redo();
    if (!next) return;
    
    setShouldRecordHistory(false);
    
    setNodes(next.nodes);
    setEdges(next.edges);
    
    setTimeout(() => {
      setPerformingUndoRedo(false);
      setShouldRecordHistory(true);
    }, 50);
  }, [canRedo, redo, setNodes, setEdges, setPerformingUndoRedo]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!globals.activeProcess) return;
      
      // Handle Ctrl+Z / Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      
      // Handle Ctrl+Y / Cmd+Y or Ctrl+Shift+Z / Cmd+Shift+Z for redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleUndo, handleRedo, globals.activeProcess]);
  
  useEffect(() => {
    clearHistory();
  }, [globals.activeProcess, clearHistory]);

  // add node - with fixed dependencies
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
      let attachable = true

      if (attachTo == "start") {
        leftAttachedNode = nodes.find(n => n.id == "start") as Node
        // attachable = attachables.includes(type)

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
        // attachable = (leftAttachedNode?.data as any).attachable ?? false

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
        // Find the source node's config to determine edge type
        const sourceNode = nodes.find(n => n.id === attachTo)
        const sourceConfig = nodeConfigs.find(config => config.type === sourceNode?.type)
        let edgeType = sourceConfig?.outputType || "default"

        // If the edge type is "inherit", find the incoming edge type
        if (edgeType === "inherit") {
          const incomingEdge = edges.find(e => e.target === attachTo)
          edgeType = incomingEdge?.type as TEdges || "default"
        }

        console.log("Adding edge from", sourceNode?.type, "with type", edgeType)

        setEdges(edges => edges.concat({
          id: `${attachTo!}-${id}`,
          source: attachTo!,
          target: id,
          type: edgeType
        }))
      }

      globals.setAttach(undefined)
      globals.toggleSidebar(true)
      globals.setActiveNode({ ...newNode, data: newNode.data as any } as Node)

    }) as EventListener

    window.addEventListener("add-node", addNodeListener)
    return () => window.removeEventListener("add-node", addNodeListener)
  }, [nodes, edges, setNodes, setEdges, globals.activeProcess, globals.attach, globals.toggleSidebar, globals.setActiveNode, globals.setAttach])

  // update node data - with fixed dependencies
  useEffect(() => {
    const updateNodeDataListener = ((e: CustomEvent) => {
      const id = e.detail.id
      const data = e.detail.data

      setNodes(nodes => {
        const targetNode = nodes.find(n => n.id === id)
        if (!targetNode) return nodes

        const updatedNode = {
          ...targetNode,
          data: { ...targetNode.data, ...data }
        } as Node

        // Update the global active node if this is the currently active node
        if (globals.activeNode?.id === id) {
          // setTimeout(() => globals.setActiveNode(updatedNode), 0)
          // globals.setActiveNode(updatedNode)
        }

        return nodes.map(n => n.id === id ? updatedNode : n)
      })

      console.log("updateNodeDataListener", id, data)
    }) as EventListener

    window.addEventListener("update-node-data", updateNodeDataListener)
    return () => window.removeEventListener("update-node-data", updateNodeDataListener)
  }, [setNodes])

  // delete node - with fixed dependencies
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

        globals.setActiveNode(undefined)
        globals.setAttach(undefined)
        globals.toggleSidebar(false)
        globals.setAvailableNodes([])
        globals.resetNodes()
        globals.setFlowIsRunning(false)
        globals.setOrder({})
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
            const sourceNode = nodes.find(n => n.id === incomingEdge.source)
            const sourceConfig = nodeConfigs.find(config => config.type === sourceNode?.type)
            let edgeType = sourceConfig?.outputType || "default"

            // If the edge type is "inherit", use the incoming edge type
            if (edgeType === "inherit") {
              edgeType = incomingEdge.type as TEdges
            }

            filteredEdges.push({
              id: `${incomingEdge.source}-${outgoingEdge.target}`,
              source: incomingEdge.source,
              target: outgoingEdge.target,
              type: edgeType
            })
          }

          return filteredEdges
        })
        globals.setActiveNode(undefined)
        globals.setAttach(undefined)
        globals.toggleSidebar(false)
        globals.setAvailableNodes([])
        globals.resetNodes()
        globals.setFlowIsRunning(false)
        globals.setOrder({})
      }
    }) as EventListener

    window.addEventListener("delete-node", deleteNodeListener)
    return () => window.removeEventListener("delete-node", deleteNodeListener)
  }, [nodes, edges, setNodes, setEdges, globals.setActiveNode, globals.setAttach, globals.toggleSidebar, 
      globals.setAvailableNodes, globals.resetNodes, globals.setFlowIsRunning, globals.setOrder])

  // add edge - with fixed dependencies
  useEffect(() => {
    const addEdgeListener = ((e: CustomEvent) => {
      const edge = e.detail.edge
      setEdges(edges => edges.concat(edge))
    }) as EventListener

    window.addEventListener("add-edge", addEdgeListener)
    return () => window.removeEventListener("add-edge", addEdgeListener)
  }, [setEdges])

  // remove edge - with fixed dependencies
  useEffect(() => {
    const removeEdgeListener = ((e: CustomEvent) => {
      const id = e.detail.id
      setEdges(edges => edges.filter(e => e.id !== id))
    }) as EventListener

    window.addEventListener("remove-edge", removeEdgeListener)
    return () => window.removeEventListener("remove-edge", removeEdgeListener)
  }, [setEdges])

  // load nodes and edges from localStorage - memoized for performance
  useEffect(() => {
    if (!globals.activeProcess) return

    // Clear current nodes/edges before loading new process
    const savedData = localStorage.getItem(`flow-${globals.activeProcess}`)
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setNodes(parsedData.nodes)
        setEdges(parsedData.edges)
        
        // Initialize history with current state after loading
        setTimeout(() => {
          saveCurrent({ nodes: parsedData.nodes, edges: parsedData.edges });
        }, 100);
      } catch (e) {
        console.error("Failed to parse saved flow data", e)
        setNodes(defaultNodes)
        setEdges([])
        localStorage.setItem(`flow-${globals.activeProcess}`, JSON.stringify({ nodes: defaultNodes, edges: [] }))
      }
    } else {
      setNodes(defaultNodes)
      setEdges([])
      localStorage.setItem(`flow-${globals.activeProcess}`, JSON.stringify({ nodes: defaultNodes, edges: [] }))
      
      // Initialize history with default state
      setTimeout(() => {
        saveCurrent({ nodes: defaultNodes, edges: [] });
      }, 100);
    }
  }, [globals.activeProcess, setNodes, setEdges, saveCurrent])

  // save nodes and edges to localStorage - debounced with proper deps
  useEffect(() => {
    if (!globals.activeProcess) return

    // Debounce the save operation
    const timeoutId = setTimeout(() => {
      const saveItem = { nodes, edges }
      localStorage.setItem(`flow-${globals.activeProcess}`, JSON.stringify(saveItem))
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [globals.activeProcess, nodes, edges])

  // hotkey to show node execution order on pressing e 
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Alt") {
        const nodes = getConnectedNodes("start")

        let _: Node[] = []
        // iterate through all nodes in nodes array and print the node id and the node type
        const logNode = (node: any) => {
          if (!Array.isArray(node)) {
            _.push(node)
            return
          }
          node.forEach(n => logNode(n))
        }
        nodes.forEach(node => logNode(node))

        const localOrder: { [id: string]: number } = {}
        // iterate through order and display the order number in which the node will run, on the react flow viewport
        _.forEach((node, index) => {
          console.log("node", node.id, node.type, index)
          localOrder[node.id] = index
        })

        globals.setOrder(localOrder)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt") {
        globals.setOrder({})
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [nodes, edges, globals.setOrder])

  // event: input: node id, callback: list of nodes connected to this node
  useEffect(() => {
    const getConnectedNodesListener = ((e: CustomEvent) => {
      const id = e.detail.id
      const result: any[] = []

      // Find direct connections from source node, ignoring loopEnd edges
      const directEdges = edges.filter(edge => edge.source === id && edge.type !== 'loopEnd')

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

        // Find nodes connected to current node, ignoring loopEnd edges
        const nextEdges = edges.filter(edge => edge.source === currentId && edge.type !== 'loopEnd')

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

  useEffect(() => {
    globals.resetNodes()
    globals.setActiveNode(undefined)
  }, [globals.activeProcess])

  // Handle node click - extracted as memoized function
  const onNodeClick = useCallback(async (e: any, node: Node) => {
    if (globals.flowIsRunning) return
    console.log("onNodeClick", node)



    switch (node.type) {
      case "annotation": break;
      case "start": {
        globals.setActiveNode(undefined)
        globals.setAttach(undefined)
        globals.toggleSidebar(false)
        globals.consoleRef?.current?.resize(35)
        globals.resetNodes()

        setTimeout(() => fitView({ padding: 0.2, duration: 500 }), 100)

        let fullCode = ""
        const rootNodes: Node[] = []
        const n = getConnectedNodes("start")
        n.forEach(node => {
          if (Array.isArray(node)) {
            let n = node.find(nn => !Array.isArray(nn)) as Node
            if (n) {
              rootNodes.push(n)
            }
          } else {
            rootNodes.push(node)
          }
        })

        console.log("rootNodes", rootNodes)

        globals.setFlowIsRunning(true)
        for (const node of rootNodes) {
          try {
            // Create a flat list of all nodes in this execution path
            const allNodesInPath: Node[] = []

            // Helper function to recursively collect all nodes
            const collectNodes = (currentNode: any) => {
              if (Array.isArray(currentNode)) {
                // First element is the node, rest are children
                if (currentNode.length > 0 && !Array.isArray(currentNode[0])) {
                  allNodesInPath.push(currentNode[0])
                }
                // Process children (which start at index 1)
                for (let i = 1; i < currentNode.length; i++) {
                  collectNodes(currentNode[i])
                }
              } else if (currentNode && !Array.isArray(currentNode)) {
                // Single node
                allNodesInPath.push(currentNode)
              }
            }

            // Get all connected nodes for this root node
            const connectedNodes = getConnectedNodes(node.id)
            connectedNodes.forEach(connectedNode => collectNodes(connectedNode))

            // Add the root node itself
            allNodesInPath.push(node)

            // Mark all nodes in path as running
            allNodesInPath.forEach(n => globals.addRunningNode(n))

            let code = await getCode(node.id, node.data)
            console.log(node.id, code)

            // Handle token nodes specially, similar to flow-panel.tsx
            if (node.type === "token") {
              // Only spawn token if we don't have a tokenId or respawn is true
              const data = node.data as TokenData
              if (!data.tokenId || data.respawn) {
                try {
                  const tokenId = await spawnToken(data, globals.activeProcess, node)
                  data.tokenId = tokenId
                  updateNodeData(node.id, data)
                } catch (e: any) {
                  // Mark all nodes in this path as error
                  allNodesInPath.forEach(n => globals.addErrorNode(n))
                  globals.addOutput({ type: "error", message: e.message, preMessage: node.id })
                  continue // Skip to next node
                }
              }
              code = await getCode(node.id, node.data)
            }

            fullCode += `\n-- [ ${node.id} ]\n${code}\n`

            const res = await runLua(code, globals.activeProcess)
            console.log(node.id, res)
            if (res.Error) {
              // Mark all nodes in this path as error
              allNodesInPath.forEach(n => globals.addErrorNode(n))
              globals.addOutput({ type: "error", message: res.Error, preMessage: node.id, aoMessage: res })
            } else {
              // Mark all nodes in this path as success
              allNodesInPath.forEach(n => globals.addSuccessNode(n))
              globals.addOutput({ type: "output", message: parseOutupt(res), preMessage: node.id, aoMessage: res })
            }
          } catch (e: any) {
            console.log(node.id, e)
            globals.addErrorNode(node)
            globals.addOutput({ type: "error", message: e.message, preMessage: node.id })
          }
        }
        globals.setFlowIsRunning(false)

        console.log("fullCode", fullCode)
        break;
      }

      default: {
        globals.setActiveNode(node)
        globals.toggleSidebar(true)
        setTimeout(() => setCenter(node.position.x + NodeSizes.normal.width / 2, node.position.y + NodeSizes.normal.height / 2, { duration: 500, zoom: 0.8 }), 100)
      }
    }
  }, [globals.flowIsRunning, globals.setActiveNode, globals.setAttach, globals.toggleSidebar, 
      globals.consoleRef, globals.resetNodes, globals.setFlowIsRunning, globals.addRunningNode, 
      globals.addErrorNode, globals.addOutput, globals.addSuccessNode, fitView, setCenter]);

  // Custom node changes handler to record history
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    // Filter out ignored node types and remove operations
    const filteredChanges = changes
      .filter(change => change.type !== "remove")
      .filter(change => !ignoreChangesForNodes.includes((change as any).id));
    
    // Apply changes
    onNodesChange(filteredChanges as any);
  }, [onNodesChange]);

  return (
    <div className="w-full h-[calc(100%-20px)]">
      <div className="h-5 flex items-center px-1 border-b text-xs">
        {globals.activeProcess && <>
          <BoxIcon key="process-icon" size={14} className='mr-1' strokeWidth={1.2} />{globals.activeProcess}
          {globals.activeNode && <>
            <div key="separator-1" className='px-1.5 text-base'>/</div>
            <div key="node-id">{globals.activeNode?.id}</div>
            {/* {
              globals.editingNode && <>
                <div className='px-1.5 text-base'>/</div>
                <div>block editor</div>
              </>
            } */}
          </>}
          
          {/* Add undo/redo buttons */}
          <div className="ml-auto flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-4 w-4 p-0" 
              onClick={handleUndo} 
              disabled={!canUndo() || globals.flowIsRunning}
              title="Undo (Ctrl+Z)"
            >
              <Undo2Icon size={12} className={canUndo() ? "" : "opacity-30"} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-4 w-4 p-0" 
              onClick={handleRedo} 
              disabled={!canRedo() || globals.flowIsRunning}
              title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
            >
              <Redo2Icon size={12} className={canRedo() ? "" : "opacity-30"} />
            </Button>
          </div>
        </>}
      </div>


      <ReactFlow
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
        onNodeClick={onNodeClick}
        onNodesChange={handleNodesChange}
        onNodeDrag={() => { updateNodeData("", {}) }}
        onPaneClick={() => {
          globals.setActiveNode(undefined)
          globals.toggleSidebar(false)
          globals.setAttach(undefined)
          globals.setAvailableNodes([])
        }}
      >
        <FlowPanel />
        <Background variant={BackgroundVariant.Dots} />
        <MiniMap bgColor={theme == "dark" ? "#3B4252" : "white"} />
        <Controls />
      </ReactFlow>
    </div>
  );
}