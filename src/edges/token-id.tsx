import { EdgeProps, getBezierPath } from '@xyflow/react';

const TokenIdEdge = ({
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
                fill="#f2f2f299"
                // stroke="grey"
                strokeWidth={1}
            />
            <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className='text-center text-[10px]'
            >
                id
            </text>
        </>
    );
};

export default TokenIdEdge; 