import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from "recharts";
import type { HealthEntry } from "./HealthLogForm";

type MetricKey = "heartRate" | "bloodPressure" | "weight" | "peakFlow";

interface MetricConfig {
  key: MetricKey;
  label: string;
  unit: string;
  color: string;
  getValues: (entry: HealthEntry) => number | undefined;
}

const METRICS: MetricConfig[] = [
  { key: "heartRate", label: "Heart Rate", unit: "bpm", color: "hsl(172, 66%, 30%)", getValues: e => e.heartRate },
  { key: "bloodPressure", label: "Blood Pressure", unit: "mmHg", color: "hsl(215, 16%, 47%)", getValues: e => e.systolic },
  { key: "weight", label: "Weight", unit: "kg", color: "hsl(172, 40%, 45%)", getValues: e => e.weight },
  { key: "peakFlow", label: "Peak Flow", unit: "L/min", color: "hsl(172, 66%, 25%)", getValues: e => e.peakFlow },
];

interface HealthChartsProps {
  entries: HealthEntry[];
  quitDate: Date;
}

const HealthCharts = ({ entries, quitDate }: HealthChartsProps) => {
  const [activeMetric, setActiveMetric] = useState<MetricKey>("heartRate");

  const availableMetrics = useMemo(() => {
    return METRICS.filter(m => entries.some(e => m.getValues(e) !== undefined));
  }, [entries]);

  const selectedMetric = METRICS.find(m => m.key === activeMetric) || METRICS[0];

  const chartData = useMemo(() => {
    return entries
      .filter(e => selectedMetric.getValues(e) !== undefined)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(e => {
        const daysSinceQuit = Math.floor((new Date(e.date).getTime() - quitDate.getTime()) / 86400000);
        return {
          date: new Date(e.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          day: `Day ${daysSinceQuit}`,
          value: selectedMetric.getValues(e),
          ...(activeMetric === "bloodPressure" && { diastolic: e.diastolic }),
        };
      });
  }, [entries, selectedMetric, activeMetric, quitDate]);

  // Calculate trend
  const trend = useMemo(() => {
    if (chartData.length < 2) return null;
    const first = chartData[0].value ?? 0;
    const last = chartData[chartData.length - 1].value ?? 0;
    const diff = last - first;
    const pct = first !== 0 ? ((diff / first) * 100).toFixed(1) : "0";
    return { diff, pct, direction: diff > 0 ? "up" : diff < 0 ? "down" : "stable" as const };
  }, [chartData]);

  if (entries.length === 0 || availableMetrics.length === 0) {
    return null;
  }

  return (
    <div className="card-elevated p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Health Progress
        </p>
        {trend && (
          <span className={`font-mono-tabular text-xs font-medium ${
            activeMetric === "peakFlow"
              ? trend.direction === "up" ? "text-primary" : "text-muted-foreground"
              : trend.direction === "down" ? "text-primary" : "text-muted-foreground"
          }`}>
            {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→"} {Math.abs(Number(trend.pct))}%
          </span>
        )}
      </div>

      {/* Metric tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {availableMetrics.map(m => (
          <button
            key={m.key}
            onClick={() => setActiveMetric(m.key)}
            className={`relative shrink-0 rounded-[10px] px-3 py-1.5 text-xs font-medium transition-colors ${
              activeMetric === m.key ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {activeMetric === m.key && (
              <motion.div
                layoutId="metric-tab"
                className="absolute inset-0 rounded-[10px] bg-primary"
                transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
              />
            )}
            <span className="relative z-10">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Chart */}
      {chartData.length >= 2 ? (
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={selectedMetric.color} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={selectedMetric.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "hsl(215, 16%, 47%)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fontSize: 10, fill: "hsl(215, 16%, 47%)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(0, 0%, 100%)",
                  border: "none",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  fontSize: "12px",
                  padding: "8px 12px",
                }}
                formatter={(value: number) => [`${value} ${selectedMetric.unit}`, selectedMetric.label]}
                labelFormatter={(label) => label}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={selectedMetric.color}
                strokeWidth={2}
                fill="url(#chartGradient)"
                dot={{ r: 3, fill: selectedMetric.color, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: selectedMetric.color, strokeWidth: 2, stroke: "white" }}
              />
              {activeMetric === "bloodPressure" && (
                <Area
                  type="monotone"
                  dataKey="diastolic"
                  stroke="hsl(215, 16%, 67%)"
                  strokeWidth={1.5}
                  fill="none"
                  dot={{ r: 2, fill: "hsl(215, 16%, 67%)", strokeWidth: 0 }}
                  strokeDasharray="4 2"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center">
          <p className="text-xs text-muted-foreground">Log at least 2 entries to see trends.</p>
        </div>
      )}

      {/* Latest reading */}
      {chartData.length > 0 && (
        <div className="flex items-baseline gap-2">
          <span className="font-mono-tabular text-2xl font-semibold text-foreground">
            {chartData[chartData.length - 1].value}
          </span>
          <span className="text-xs text-muted-foreground">{selectedMetric.unit}</span>
          <span className="text-[0.6rem] text-muted-foreground/60 ml-auto">
            latest · {chartData[chartData.length - 1].date}
          </span>
        </div>
      )}
    </div>
  );
};

export default HealthCharts;
