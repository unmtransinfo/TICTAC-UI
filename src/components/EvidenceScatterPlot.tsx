import { useCallback } from 'react';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import type { DiseaseTargetAssociation, TDL } from '@/types/tictac';

interface ScatterPlotProps {
    data: DiseaseTargetAssociation[];
    onPointClick?: (association: DiseaseTargetAssociation) => void;
}

const TDL_COLORS: Record<TDL, string> = {
    Tclin: 'hsl(210, 100%, 45%)',
    Tchem: 'hsl(145, 65%, 40%)',
    Tbio: 'hsl(45, 95%, 50%)',
    Tdark: 'hsl(220, 10%, 50%)',
};

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        payload: DiseaseTargetAssociation;
    }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;
    return (
        <div className="bg-card border rounded-lg shadow-lg p-3 max-w-xs">
            <div className="font-semibold text-foreground">{data.geneSymbol}</div>
            <div className="text-sm text-muted-foreground mb-2">{data.geneName}</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <span className="text-muted-foreground">Score:</span>
                <span className="font-medium">{data.meanRankScore.toFixed(1)}</span>
                <span className="text-muted-foreground">Publications:</span>
                <span className="font-medium">{data.nPub}</span>
                <span className="text-muted-foreground">Studies:</span>
                <span className="font-medium">{data.nStud}</span>
                <span className="text-muted-foreground">TDL:</span>
                <span className="font-medium">{data.tdl}</span>
            </div>
        </div>
    );
};

export const EvidenceScatterPlot = ({ data, onPointClick }: ScatterPlotProps) => {
    const navigate = useNavigate();

    const handleClick = useCallback(
        (entry: DiseaseTargetAssociation) => {
            if (onPointClick) {
                onPointClick(entry);
            } else {
                navigate(`/evidence/${entry.id}`);
            }
        },
        [navigate, onPointClick]
    );

    const chartData = data.map((d) => ({
        ...d,
        x: d.meanRankScore,
        y: d.nPub,
    }));

    return (
        <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                        type="number"
                        dataKey="x"
                        name="Evidence Score"
                        domain={[0, 100]}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        tickLine={{ stroke: 'hsl(var(--border))' }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        label={{
                            value: 'Mean Rank Score',
                            position: 'bottom',
                            offset: 40,
                            fill: 'hsl(var(--foreground))',
                        }}
                    />
                    <YAxis
                        type="number"
                        dataKey="y"
                        name="Publications"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        tickLine={{ stroke: 'hsl(var(--border))' }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        label={{
                            value: 'Publication Count',
                            angle: -90,
                            position: 'insideLeft',
                            offset: -40,
                            fill: 'hsl(var(--foreground))',
                        }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Scatter
                        data={chartData}
                        onClick={(e) => handleClick(e as unknown as DiseaseTargetAssociation)}
                        cursor="pointer"
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={TDL_COLORS[entry.tdl]}
                                fillOpacity={0.8}
                                stroke={TDL_COLORS[entry.tdl]}
                                strokeWidth={2}
                                r={Math.sqrt(entry.nStud) + 5}
                            />
                        ))}
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
};
