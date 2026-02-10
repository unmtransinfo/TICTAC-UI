import type { TDL } from '@/types/tictac';
import { TDL_INFO } from '@/types/tictac';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface TDLBadgeProps {
    tdl: TDL;
    showTooltip?: boolean;
    className?: string;
}

const TDL_COLORS: Record<TDL, string> = {
    Tclin: 'bg-tdl-tclin text-white hover:bg-tdl-tclin/90',
    Tchem: 'bg-tdl-tchem text-white hover:bg-tdl-tchem/90',
    Tbio: 'bg-tdl-tbio text-foreground hover:bg-tdl-tbio/90',
    Tdark: 'bg-tdl-tdark text-white hover:bg-tdl-tdark/90',
};

export const TDLBadge = ({ tdl, showTooltip = true, className }: TDLBadgeProps) => {
    const info = TDL_INFO[tdl];

    const badge = (
        <Badge className={cn('font-mono font-semibold', TDL_COLORS[tdl], className)}>
            {info.label}
        </Badge>
    );

    if (!showTooltip) return badge;

    return (
        <Tooltip>
            <TooltipTrigger asChild>{badge}</TooltipTrigger>
            <TooltipContent>
                <p className="font-semibold">{info.label}</p>
                <p className="text-sm text-muted-foreground">{info.description}</p>
            </TooltipContent>
        </Tooltip>
    );
};
