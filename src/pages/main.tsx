"use client";
// import BlocklyComponent from '@/blockly';
// import { xmlToLua } from '@/blockly/utils/xml';
import FlowPanel from '@/components/flow-panel';
import { Edge, Edges } from '@/edges';
import { useGlobalState } from '@/hooks/useGlobalStore';
import { installAPM, installPackage, parseOutupt, runLua } from '@/lib/aos';
import { addNode, getNodesOrdered } from '@/lib/utils';
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
        y: startNodePosition.y + NodeSizes.normal.height / 2 - NodeSizes.normal.height / 2
      }

      console.log("addNodeListener", type, attachTo)

      let leftAttachedNode: Node | undefined
      let lastAttachedNode: Node | undefined
      let attachable = false
      if (attachTo == "start") {
        leftAttachedNode = nodes.find(n => n.id == "start") as Node
        attachable = attachables.includes(type)
        newNodePosition.x = leftAttachedNode.position.x + NodeSizes.normal.width + 50
      } else {
        leftAttachedNode = nodes.find(n => n.id == attachTo) as Node
        attachable = (leftAttachedNode?.data as any).attachable ?? false
        newNodePosition.x = leftAttachedNode.position.x + NodeSizes.normal.width + 50
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


      // switch (type) {
      //   case "handler": case "token": {
      //     console.log("handler", e)

      //     const startNode = nodes.find(n => n.type == "start")
      //     if (!startNode) return;
      //     const startNodePosition = startNode.position

      //     const newHandlerPosition = {
      //       x: startNodePosition.x + NodeSizes.normal.width + 50,
      //       y: startNodePosition.y + NodeSizes.normal.height / 2 - NodeSizes.normal.height / 2
      //     }

      //     // position just below the last handler
      //     const lastHandler = nodes.filter(n => n.type == type).sort((a, b) => a.position.y - b.position.y).pop()
      //     if (lastHandler) {
      //       newHandlerPosition.x = lastHandler.position.x
      //       newHandlerPosition.y = lastHandler.position.y + NodeSizes.normal.height + 20
      //     }

      //     const newHandler = {
      //       id,
      //       position: newHandlerPosition,
      //       type,
      //       data: {}
      //     }

      //     setNodes(nodes => nodes.concat(newHandler))
      //     setEdges(edges => edges.concat({
      //       id: `start-${id}`,
      //       source: "start",
      //       target: id,
      //       type: "default"
      //     }))
      //     globals.setActiveNode(newHandler)
      //     globals.toggleSidebar(true)
      //     globals.setAttach(undefined)
      //     break;
      //   }
      //   default: {
      //     console.log("append node", e.detail, globals.attach)
      //     if (!globals.attach) return;
      //     const attachToNode = nodes.find(n => n.id == globals.attach);
      //     if (!attachToNode) return;
      //     const newNode = {
      //       id,
      //       position: {
      //         x: attachToNode.position.x + NodeSizes.normal.width + 50,
      //         y: attachToNode.position.y + NodeSizes.normal.height / 2 - NodeSizes.addNode.height / 2
      //       },
      //       type,
      //       data: {}
      //     }
      //     setNodes(nodes => nodes.concat(newNode))
      //     setEdges(edges => edges.concat({
      //       id: `${globals.attach!}-${id}`,
      //       source: globals.attach!,
      //       target: id,
      //       type: "message"
      //     }))
      //     globals.setAttach(undefined)
      //     globals.setActiveNode(newNode)
      //     globals.toggleSidebar(true)
      //   }
      // }

    }) as EventListener

    window.addEventListener("add-node", addNodeListener)
    return () => window.removeEventListener("add-node", addNodeListener)
  }, [nodes, setEdges, globals.activeProcess, globals.attach])

  useEffect(() => {
    globals.setActiveProcess("")
    globals.setActiveNode(undefined)
  }, [address])

  async function onNodeClick(e: any, node: Node) {
    if (globals.flowIsRunning) return
    console.log("onNodeClick", node)

    switch (node.type) {
      case "start": {
        globals.setActiveNode(undefined)
        globals.setAttach(undefined)
        globals.toggleSidebar(false)
        break;
      }
      case "add-node": {
        globals.setAvailableNodes(RootNodesAvailable)
        globals.toggleSidebar(true)
        globals.setActiveNode(undefined)
        globals.setAttach(undefined)
        break;
      }
      case "annotation": break;

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
