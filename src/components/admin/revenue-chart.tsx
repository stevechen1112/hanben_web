"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface RevenueChartProps {
  data: { date: string; amount: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0ece8" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#a8a29e" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#a8a29e" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          width={36}
        />
        <Tooltip
          contentStyle={{
            background: "#fff",
            border: "1px solid #e7e5e4",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value) => [
            `NT$ ${Number(value ?? 0).toLocaleString()}`,
            "營收",
          ]}
        />
        <Line
          type="monotone"
          dataKey="amount"
          stroke="#B72020"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#B72020" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
