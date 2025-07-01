// components/SimulationChart.tsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface SimulationChartProps {
  chartData: Array<{ index: number; value: number }>;
}

const SimulationChart = React.memo<SimulationChartProps>(({ chartData }) => (
  <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
    <h3 className="text-lg font-semibold mb-4">Simulation Results</h3>
    <ResponsiveContainer width="100%" height={500}>
      <LineChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis
          dataKey="index"
          stroke="#e0e0e0"
          tick={{ fill: "#e0e0e0", fontSize: 12 }}
          interval={9}
          tickFormatter={(value) => value.toString()}
          tickLine={false}
          axisLine={{ stroke: "#777" }}
          angle={-45}
          textAnchor="end"
          height={60}
          label={{
            value: "Spatial Index",
            position: "insideBottom",
            fill: "#e0e0e0",
            fontSize: 14,
          }}
        />
        <YAxis
          stroke="#e0e0e0"
          tick={{ fill: "#e0e0e0" }}
          label={{
            value: "Value",
            angle: -90,
            position: "insideLeft",
            fill: "#e0e0e0",
            fontSize: 14,
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#3d3d3d",
            border: "none",
            borderRadius: 4,
            color: "#fff",
          }}
          formatter={(value: number) => value.toFixed(6)}
          labelFormatter={(label) => `Index: ${label}`}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#82ca9d"
          dot={false}
          strokeWidth={2}
        />
        <Legend wrapperStyle={{ color: "#e0e0e0" }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
));

SimulationChart.displayName = "SimulationChart";

export default SimulationChart;
