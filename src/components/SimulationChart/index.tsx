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
  channelLabels?: string[];
  yAxisDomain?: [number, number]; // Optional prop to set Y-axis range
}

const SimulationChart = React.memo<SimulationChartProps>(
  ({ chartData, channelLabels, yAxisDomain }) => {
    if (!chartData || chartData.length === 0) {
      return (
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
          No data to display.
        </div>
      );
    }

    return (
      <div className="w-full p-4 bg-gray-800 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">
          Simulation Results {channelLabels ? `- ${channelLabels[0]}` : ""}
        </h3>
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
              domain={yAxisDomain || [-0.25, 1.25]}
              type="number"
              scale="linear"
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
              animationDuration={300}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={"#82ca9d"}
              dot={false}
              strokeWidth={2}
              animationDuration={300}
              isAnimationActive={true}
              name={channelLabels ? channelLabels[0] : `Channel`}
            />
            <Legend wrapperStyle={{ color: "#e0e0e0" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

SimulationChart.displayName = "SimulationChart";
export default SimulationChart;
