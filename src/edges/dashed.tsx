import { EdgeProps, getBezierPath } from '@xyflow/react';

const DashedEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
}: EdgeProps) => {
    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
    });

    return (
        <path
            id={id}
            style={{ ...style, strokeDasharray: '4,4' }}
            className="react-flow__edge-path"
            d={edgePath}
            markerEnd={markerEnd}
        />
    );
};

export default DashedEdge;