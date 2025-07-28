import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface SimulationChartProps {
  chartData: Array<{ index: number; value: number }>;
  channelLabels?: string[];
  yAxisDomain?: [number, number]; // Optional prop to set Y-axis range
  fillHeight?: boolean;
}

const SimulationChart = React.memo<SimulationChartProps>(
  ({ chartData, channelLabels, yAxisDomain, fillHeight }) => {
    if (!chartData || chartData.length === 0) {
      return (
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
          No data to display.
        </div>
      );
    }

    // Calculate Y-axis domain and three ticks
    const yDomain = yAxisDomain || [-0.25, 1.25];
    const yMin = yDomain[0];
    const yMax = yDomain[1];
    const yMiddle = (yMin + yMax) / 2;
    const yAxisTicks = [yMin, yMiddle, yMax];

    // Calculate which X-axis indices to show (first, middle, last)
    const dataLength = chartData.length;
    const xTickIndices = [0, Math.floor((dataLength - 1) / 2), dataLength - 1];

    // Custom tick formatter that only shows ticks at our desired positions
    const shouldShowTick = (tickIndex: number) => {
      return xTickIndices.includes(tickIndex);
    };

    return (
      <div
        className={`w-full p-2 bg-gray-900 rounded-md shadow-sm border border-gray-800 ${
          fillHeight ? "flex-1 min-h-0 h-full flex flex-col" : ""
        }`}
      >
        <h3 className="text-base font-semibold mb-2 tracking-tight text-gray-100">
          {channelLabels ? channelLabels[0] : ""}
        </h3>
        <ResponsiveContainer width="100%" height={fillHeight ? "100%" : 320}>
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
          >
            <XAxis
              dataKey="index"
              stroke="#e0e0e0"
              tick={{ fill: "#e0e0e0", fontSize: 14 }}
              interval={0}
              tickFormatter={(value, index) => {
                return shouldShowTick(index) ? value.toString() : "";
              }}
              tickLine={false}
              axisLine={{ stroke: "#777" }}
              angle={0}
              textAnchor="middle"
              height={50}
            />
            <YAxis
              stroke="#e0e0e0"
              tick={{ fill: "#e0e0e0", fontSize: 14 }}
              domain={yDomain}
              ticks={yAxisTicks}
              type="number"
              scale="linear"
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
              animationDuration={0}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={"#82ca9d"}
              dot={false}
              strokeWidth={2}
              animationDuration={0}
              isAnimationActive={false}
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
