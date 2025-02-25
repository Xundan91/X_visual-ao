import { EdgeProps, getBezierPath } from '@xyflow/react';

const LoopEndEdge = ({
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
                style={{ ...style, strokeDasharray: '4,4' }}
                className="react-flow__edge-path"
                d={(() => {
                    // Calculate the midpoint between source and target
                    const midX = (sourceX + targetX) / 2;

                    // Calculate vertical offset based on distance
                    const distance = Math.abs(targetX - sourceX) + Math.abs(targetY - sourceY);
                    const verticalOffset = Math.min(Math.max(distance * 0.5, 80), 200);

                    // Create a more uniform curved path with smoother arcs
                    return `M${sourceX},${sourceY} 
                            C${sourceX},${sourceY + verticalOffset / 2} 
                            ${sourceX},${sourceY + verticalOffset} 
                            ${midX},${Math.max(sourceY, targetY) + verticalOffset}
                            C${targetX},${Math.max(sourceY, targetY) + verticalOffset}
                            ${targetX},${targetY + verticalOffset / 2}
                            ${targetX},${targetY}`;
                })()}
                markerEnd={markerEnd}
            />
            {/* Calculate a point along the bezier curve for the label */}
            {(() => {
                // Calculate the midpoint between source and target
                const midX = (sourceX + targetX) / 2;

                // Calculate vertical offset based on distance
                const distance = Math.abs(targetX - sourceX) + Math.abs(targetY - sourceY);
                const verticalOffset = Math.min(Math.max(distance * 0.5, 80), 200);

                // Position the label at the bottom of the curve
                const x = midX;
                const y = Math.max(sourceY, targetY) + verticalOffset - 5;

                return (
                    <>
                        <circle
                            cx={x}
                            cy={y}
                            r={12}
                            fill="#f2f2f299"
                            strokeWidth={1}
                        />
                        <text
                            x={x}
                            y={y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className='text-center text-[10px]'
                        >
                            loop
                        </text>
                    </>
                );
            })()}

            {/* Add a small arrow near the target to show flow direction */}
            {(() => {
                // Calculate position for the arrow slightly before the target
                const arrowSize = 12; // Increased from 8 to 12
                const arrowDistance = 20; // Increased distance from target

                // Calculate the position on the curve where the arrow should be
                // Use a point closer to the target but still on the curved path
                const t = 0.85; // Parameter along the curve (0 to 1)

                // Bezier curve point calculation
                const distance = Math.abs(targetX - sourceX) + Math.abs(targetY - sourceY);
                const verticalOffset = Math.min(Math.max(distance * 0.5, 80), 200);
                const midX = (sourceX + targetX) / 2;

                // Calculate point on the bezier curve
                // P = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
                const p0 = { x: sourceX, y: sourceY };
                const p1 = { x: sourceX, y: sourceY + verticalOffset / 2 };
                const p2 = { x: sourceX, y: sourceY + verticalOffset };
                const p3 = { x: midX, y: Math.max(sourceY, targetY) + verticalOffset };
                const p4 = { x: targetX, y: Math.max(sourceY, targetY) + verticalOffset };
                const p5 = { x: targetX, y: targetY + verticalOffset / 2 };
                const p6 = { x: targetX, y: targetY };

                // For the second half of the curve (where our arrow should be)
                const t2 = (t - 0.5) * 2; // Rescale t for the second half

                // Calculate point on the second bezier curve
                const mt = 1 - t2;
                const arrowX = mt * mt * mt * p3.x + 3 * mt * mt * t2 * p4.x + 3 * mt * t2 * t2 * p5.x + t2 * t2 * t2 * p6.x;
                const arrowY = mt * mt * mt * p3.y + 3 * mt * mt * t2 * p4.y + 3 * mt * t2 * t2 * p5.y + t2 * t2 * t2 * p6.y;

                // Calculate tangent direction at this point (derivative of bezier)
                const tx = 3 * mt * mt * (p4.x - p3.x) + 6 * mt * t2 * (p5.x - p4.x) + 3 * t2 * t2 * (p6.x - p5.x);
                const ty = 3 * mt * mt * (p4.y - p3.y) + 6 * mt * t2 * (p5.y - p4.y) + 3 * t2 * t2 * (p6.y - p5.y);

                // Normalize tangent vector
                const magnitude = Math.sqrt(tx * tx + ty * ty);
                const angle = Math.atan2(ty, tx);

                // Calculate arrow points
                const x1 = arrowX - arrowSize * Math.cos(angle - Math.PI / 6);
                const y1 = arrowY - arrowSize * Math.sin(angle - Math.PI / 6);
                const x2 = arrowX - arrowSize * Math.cos(angle + Math.PI / 6);
                const y2 = arrowY - arrowSize * Math.sin(angle + Math.PI / 6);

                return (
                    <polygon
                        points={`${arrowX},${arrowY} ${x1},${y1} ${x2},${y2}`}
                        fill={style.stroke || 'gray'}
                    />
                );
            })()}
        </>
    );
};

export default LoopEndEdge; 