"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

interface ChartDataPoint {
  year: number;
  value: number;
  invested: number;
}

interface ProjectionChartProps {
  data: ChartDataPoint[];
  holdTimeline: number;
}

function formatHKD(value: number): string {
  if (value >= 1000000) {
    return `HKD ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `HKD ${(value / 1000).toFixed(0)}K`;
  }
  return `HKD ${value.toFixed(0)}`;
}

export function ProjectionChart({ data, holdTimeline }: ProjectionChartProps) {
  const chartConfig = useMemo(() => {
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const width = 800;
    const height = 300;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxValue = Math.max(...data.map((d) => d.value));
    const minValue = Math.min(...data.map((d) => d.invested));
    const valueRange = maxValue - minValue || 1;

    const getX = (year: number) =>
      padding.left + (year / holdTimeline) * chartWidth;
    const getY = (value: number) =>
      padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;

    return {
      width,
      height,
      chartWidth,
      chartHeight,
      padding,
      maxValue,
      minValue,
      getX,
      getY,
    };
  }, [data, holdTimeline]);

  const areaPath = useMemo(() => {
    if (data.length === 0) return "";
    const points = data.map((d) => `${chartConfig.getX(d.year)},${chartConfig.getY(d.value)}`);
    const firstPoint = data[0];
    const lastPoint = data[data.length - 1];
    return `M ${chartConfig.getX(firstPoint.year)},${chartConfig.height - chartConfig.padding.bottom} L ${chartConfig.getX(firstPoint.year)},${chartConfig.getY(firstPoint.value)} ${points.slice(1).map((p) => `L ${p}`).join(" ")} L ${chartConfig.getX(lastPoint.year)},${chartConfig.height - chartConfig.padding.bottom} Z`;
  }, [data, chartConfig]);

  const linePath = useMemo(() => {
    if (data.length === 0) return "";
    return data.map((d, i) => `${i === 0 ? "M" : "L"} ${chartConfig.getX(d.year)},${chartConfig.getY(d.value)}`).join(" ");
  }, [data, chartConfig]);

  const investedLinePath = useMemo(() => {
    if (data.length === 0) return "";
    const firstPoint = data[0];
    const lastPoint = data[data.length - 1];
    return `M ${chartConfig.getX(firstPoint.year)},${chartConfig.getY(firstPoint.invested)} L ${chartConfig.getX(lastPoint.year)},${chartConfig.getY(lastPoint.invested)}`;
  }, [data, chartConfig]);

  const yLabels = useMemo(() => {
    const labels = [];
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const value = chartConfig.minValue + (chartConfig.maxValue - chartConfig.minValue) * (i / steps);
      labels.push({ value, y: chartConfig.getY(value), label: formatHKD(value) });
    }
    return labels;
  }, [chartConfig]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card rounded-xl p-5 mt-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <h3 className="font-serif text-lg text-foreground">Capital Appreciation Curve</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-silver">Projected Value</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-silver" />
            <span className="text-xs text-silver">Initial Investment</span>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${chartConfig.width} ${chartConfig.height}`} className="w-full min-w-[600px]" preserveAspectRatio="xMidYMid meet">
          {yLabels.map((label, i) => (
            <g key={i}>
              <line x1={chartConfig.padding.left} y1={label.y} x2={chartConfig.width - chartConfig.padding.right} y2={label.y} stroke="currentColor" strokeOpacity={0.1} strokeDasharray="4,4" />
              <text x={chartConfig.padding.left - 8} y={label.y + 4} textAnchor="end" className="fill-silver text-[10px]">{label.label}</text>
            </g>
          ))}

          {data.map((d) => (
            <text key={d.year} x={chartConfig.getX(d.year)} y={chartConfig.height - 10} textAnchor="middle" className="fill-silver text-[10px]">Year {d.year}</text>
          ))}

          <path d={areaPath} fill="url(#areaGradient)" opacity={0.3} />

          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity={0.6} />
              <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(16, 185, 129)" />
              <stop offset="100%" stopColor="rgb(52, 211, 153)" />
            </linearGradient>
          </defs>

          <path d={investedLinePath} fill="none" stroke="currentColor" strokeOpacity={0.3} strokeWidth={2} strokeDasharray="6,4" className="text-silver" />

          <motion.path d={linePath} fill="none" stroke="url(#lineGradient)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeOut" }} />

          {data.map((d, i) => (
            <motion.g key={d.year} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.1 }}>
              <circle cx={chartConfig.getX(d.year)} cy={chartConfig.getY(d.value)} r={i === 0 || i === data.length - 1 ? 5 : 3} fill="rgb(16, 185, 129)" stroke="rgb(13, 13, 13)" strokeWidth={2} />
              {i === data.length - 1 && (
                <text x={chartConfig.getX(d.year)} y={chartConfig.getY(d.value) - 12} textAnchor="middle" className="fill-emerald-400 text-[10px] font-medium">{formatHKD(d.value)}</text>
              )}
            </motion.g>
          ))}
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-xs text-silver">Starting Value</p>
          <p className="font-serif text-lg text-foreground">{data[0] ? formatHKD(data[0].invested) : "HKD 0"}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-silver">Final Value</p>
          <p className="font-serif text-lg text-emerald-400">{data.length > 0 ? formatHKD(data[data.length - 1].value) : "HKD 0"}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-silver">Total Growth</p>
          <p className="font-serif text-lg text-emerald-400">
            {data.length > 0 ? `+${(((data[data.length - 1].value - data[0].invested) / data[0].invested) * 100).toFixed(1)}%` : "0%"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
