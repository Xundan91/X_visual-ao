"use client";
import FlowPanel from '@/components/panel';
import { Edge, Edges } from '@/edges';
import { useGlobalState } from '@/hooks/useGlobalStore';
import { Node, Nodes, NodeSizes, TNodes } from '@/nodes';
import { addEdge, Background, BackgroundVariant, Controls, MiniMap, ReactFlow, useEdgesState, useNodesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { MouseEvent, useCallback, useEffect } from 'react';


export default function Home() {
  const globals = useGlobalState()
  const [nodes, setNodes, onNodesChange] = useNodesState([
    { id: "start", position: { x: 50, y: 50 }, data: {}, type: "start" },
    { id: "add", position: { x: 200, y: 100 }, data: {}, type: "add" },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([
    { id: "start-add", source: "start", target: "add", type: "dashed" },
  ]);

  useEffect(() => {
    function onAddNodeEvent(e: CustomEvent) {
      const type = e.detail.type;
      let newId = "";
      setEdges(edges => {
        setNodes(nodes => {
          newId = `node-${nodes.length + 1}`;
          const lastNode = nodes.pop();
          if (!lastNode) return [...nodes];

          // nodes.push({ id: newId, position: { x: lastNode?.position.x! + 100, y: lastNode?.position.y! + 100 }, type: type, data: {} })
          // nodes.push({ id: "add", position: { x: lastNode?.position.x! + 200, y: lastNode?.position.y! + 100 }, data: {}, type: "add" });

          // add new nodes at positions based of size of last node
          const lastNodeSize = NodeSizes[lastNode.type as TNodes];
          const currentNodeSize = NodeSizes[type as TNodes];

          // if last node is "add", then add new node at the same position
          if (lastNode.type === "add") {
            nodes.push({ id: newId, position: { x: lastNode.position.x, y: lastNode.position.y }, type: type, data: {} });
          } else {
            nodes.push({ id: newId, position: { x: lastNode.position.x + lastNodeSize.width + 100, y: lastNode.position.y + 50 }, type: type, data: {} });
          }
          nodes.push({ id: "add", position: { x: lastNode.position.x + lastNodeSize.width + 200, y: lastNode.position.y }, data: {}, type: "add" });
          console.log("nodes", nodes);
          return [...nodes];
        })
        const lastEdge = edges.pop(); // edge from the add node
        const edge1Id = `${lastEdge?.source}-${newId}`;
        const edge2Id = `${newId}-add`;
        edges.push({ id: edge1Id, source: lastEdge?.source as string, target: newId, type: "default" });
        edges.push({ id: edge2Id, source: newId, target: "add", type: "dashed" });
        console.log("edges", edges);
        return [...edges];
      })
      globals.toggleNodebar()
      console.log("add node event", e.detail);
    }

    window.addEventListener("add-node", onAddNodeEvent as EventListener);
    return () => window.removeEventListener("add-node", onAddNodeEvent as EventListener);
  }, [])

  function onNodeClick(e: any, node: Node) {
    switch (node.type) {
      case "add":
        if (!globals.nodebarOpen)
          globals.toggleNodebar()
        globals.setActiveNode(undefined)
        console.log("add node clicked");
        break;
      case "start":
        if (globals.nodebarOpen)
          globals.toggleNodebar()
        globals.setActiveNode(undefined)
        console.log("start node clicked");
        break;
      case "handler-add":
        if (!globals.nodebarOpen)
          globals.toggleNodebar()
        globals.setActiveNode(node)
        break;
      default:
        globals.setActiveNode(undefined)


    }
  }

  return (
    <div className="h-screen w-full bg-gray-200">
      <ReactFlow
        nodeTypes={Nodes as any}
        edgeTypes={Edges}
        nodes={nodes}
        edges={edges}
        onNodesChange={(e: any) => {
          if (e.id != "add") {
            onNodesChange(e)
          }
        }}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick as any}
        onPaneClick={() => {
          globals.setActiveNode(undefined)
          if (globals.nodebarOpen)
            globals.toggleNodebar()
        }}
      >
        {/* <FlowPanel /> */}
        <Background variant={BackgroundVariant.Dots} bgColor="#fef9f2" />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
}
