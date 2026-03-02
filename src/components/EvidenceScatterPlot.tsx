import React, { useMemo } from 'react';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    Label,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import type { DiseaseTargetAssociation, TDL } from '@/types/tictac';

interface ScatterPlotProps {
    data: DiseaseTargetAssociation[];
    yAxisKey?: 'nPub' | 'nStud' | 'nDrug';
    onPointClick?: (association: DiseaseTargetAssociation) => void;
}

const TDL_COLORS: Record<TDL, string> = {
    Tclin: '#f97316',
    Tchem: '#3b82f6',
    Tbio: '#16a34a',
    Tdark: '#ef4444',
};

export const EvidenceScatterPlot = ({ data, yAxisKey = 'nPub', onPointClick }: ScatterPlotProps) => {
    const navigate = useNavigate();

    const chartData = useMemo(() => {
        return data.map(d => ({
            x: d.meanRankScore,
            y: d[yAxisKey] || 0,
            tdl: d.tdl,
            id: d.id,
            geneSymbol: d.geneSymbol,
            uniprotId: d.uniprotId,
            nPub: d.nPub,
            nStud: d.nStud,
        }));
    }, [data, yAxisKey]);

    const yAxisLabel = {
        nPub: 'nPub',
        nStud: 'nStud',
        nDrug: 'nDrug',
    }[yAxisKey];

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const d = payload[0].payload;
            return (
                <div className="bg-white/95 p-4 border border-gray-200 shadow-xl rounded-lg pointer-events-none relative z-50">
                    <div className="font-bold text-base border-b pb-2 mb-2 text-gray-900">
                        {d.uniprotId}
                    </div>
                    <div className="text-gray-600 mb-3 text-sm">
                        {d.geneSymbol}
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <span className="text-gray-500">Score:</span>
                        <span className="font-medium text-gray-900">{d.x.toFixed(1)}</span>
                        <span className="text-gray-500">Publications:</span>
                        <span className="font-medium text-gray-900">{d.nPub}</span>
                        <span className="text-gray-500">Studies:</span>
                        <span className="font-medium text-gray-900">{d.nStud}</span>
                        <span className="text-gray-500">TDL:</span>
                        <span className="font-medium text-gray-900">{d.tdl}</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    const maxY = Math.max(...chartData.map(d => d.y), 10);
    const getIntervals = (max: number) => {
        if (max <= 10) return { major: 2, minor: 1 };
        if (max <= 50) return { major: 10, minor: 5 };
        if (max <= 100) return { major: 20, minor: 10 };
        if (max <= 500) return { major: 100, minor: 50 };
        const order = Math.pow(10, Math.floor(Math.log10(max)));
        return { major: order, minor: order / 2 };
    };

    const { major: yMajor, minor: yMinor } = getIntervals(maxY);
    const yMax = Math.ceil(maxY / yMajor) * yMajor;
    const yGap = yMajor * 0.35;

    const yTicks: number[] = [-yGap / 2];
    for (let i = 0; i <= yMax; i += yMinor) {
        yTicks.push(i);
    }

    const xAllTicks = [20, 30, 40, 50, 60, 70, 80, 90, 100];
    const xMajorTicks = new Set([20, 40, 60, 80, 100]);

    return (
        <div className="w-full h-[450px] mt-2 relative">
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 30, right: 20, bottom: 50, left: 50 }}>
                    <XAxis
                        type="number"
                        dataKey="x"
                        name="Mean Rank Score"
                        domain={[10, 105]}
                        ticks={xAllTicks}
                        tickLine={false}
                        tickMargin={0}
                        axisLine={{ stroke: '#666', strokeWidth: 1.5 }}
                        tick={(props: any) => {
                            const { x, y, payload, index } = props;
                            const isMajor = xMajorTicks.has(payload.value);
                            return (
                                <g transform={`translate(${x},${y})`}>
                                    <line y1={-2} y2={isMajor ? 7 : 4} stroke="#666" strokeWidth={isMajor ? 1.5 : 1} />
                                    {isMajor && (
                                        <text x={0} y={18} textAnchor="middle" fill="#555" fontSize={12}>
                                            {payload.value}
                                        </text>
                                    )}
                                </g>
                            );
                        }}
                    >
                        <Label
                            value="Evidence (meanRankScore)"
                            position="bottom"
                            offset={20}
                            style={{ fill: '#555', fontSize: 13, fontStyle: 'italic' }}
                        />
                    </XAxis>
                    <YAxis
                        type="number"
                        dataKey="y"
                        name={yAxisLabel}
                        domain={[-yGap, yMax]}
                        ticks={yTicks}
                        interval={0}
                        width={55}
                        tickLine={false}
                        tickMargin={0}
                        axisLine={{ stroke: '#666', strokeWidth: 1.5 }}
                        tick={(props: any) => {
                            const { x, y, payload } = props;
                            if (payload.value < 0) {
                                return (
                                    <g transform={`translate(${x},${y})`}>
                                        <line x1={2} x2={-4} stroke="#666" strokeWidth={1} />
                                    </g>
                                );
                            }
                            const isMajor = payload.value % yMajor === 0 || Math.abs(payload.value % yMajor) < 0.001;
                            return (
                                <g transform={`translate(${x},${y})`}>
                                    <line x1={2} x2={isMajor ? -7 : -4} stroke="#666" strokeWidth={isMajor ? 1.5 : 1} />
                                    {isMajor && (
                                        <text x={-10} y={4} textAnchor="end" fill="#555" fontSize={12}>
                                            {payload.value}
                                        </text>
                                    )}
                                </g>
                            );
                        }}
                    >
                        <Label
                            value={yAxisLabel}
                            angle={-90}
                            position="insideLeft"
                            offset={-5}
                            style={{ textAnchor: 'middle', fill: '#555', fontSize: 13, fontStyle: 'italic' }}
                        />
                    </YAxis>

                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#ccc' }} />
                    <Scatter
                        data={chartData}
                        onClick={(data: any) => {
                            if (onPointClick) {
                                onPointClick(data);
                            } else {
                                navigate(`/evidence/${data.id}`);
                            }
                        }}
                        cursor="pointer"
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={TDL_COLORS[entry.tdl]}
                                r={3.5}
                                strokeWidth={0}
                            />
                        ))}
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
};
