import { EdgeProps, getBezierPath } from '@xyflow/react';

const MessageEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
}: EdgeProps) => {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
    });

    return (
        <>
            <path
                id={id}
                style={style}
                className="react-flow__edge-path"
                d={edgePath}
                markerEnd={markerEnd}
            />
            <circle
                cx={labelX}
                cy={labelY}
                r={12}
                fill={style.fill || "transparent"}
                id="edge-circle"
            />
            <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={style.fill || "gray"}
                className='text-center text-[10px]'
                id="edge-circle-text"
            >
                msg
            </text>
        </>
    );
};

export default MessageEdge; 