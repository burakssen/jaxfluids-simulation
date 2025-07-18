import React, { Suspense } from "react";
import SimulationChart from "../SimulationChart";

const ChartLoadingPlaceholder = React.memo(() => (
  <div className="w-full h-96 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center">
    <div className="text-gray-400">Loading chart...</div>
  </div>
));

interface SimulationResultsProps {
  chartData: Array<Array<{ index: number; value: number }>>;
  channelLabels: string[];
  hasData: boolean;
  yAxisDomain?: [number, number];
}

export const SimulationResults = React.memo<SimulationResultsProps>(
  ({ chartData, channelLabels, hasData, yAxisDomain }) => {
    const getGridClasses = () => {
      const chartCount = chartData.length;

      if (chartCount === 1) {
        return "grid grid-cols-1 gap-6";
      } else if (chartCount === 2) {
        return "grid grid-cols-1 lg:grid-cols-2 gap-6";
      } else {
        return "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6";
      }
    };

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Simulation Results</h3>
        {hasData ? (
          <Suspense fallback={<ChartLoadingPlaceholder />}>
            <div className={getGridClasses()}>
              {chartData.map((channelData, idx) => (
                <div key={idx} className="w-full">
                  <SimulationChart
                    chartData={channelData}
                    channelLabels={[channelLabels[idx] || `Channel ${idx}`]}
                    yAxisDomain={yAxisDomain}
                  />
                </div>
              ))}
            </div>
          </Suspense>
        ) : (
          <div className="w-full p-8 bg-gray-800 rounded-lg border border-gray-700 text-center">
            <div className="text-gray-400 text-lg">
              No simulation data available. Click "Run" to start the simulation.
            </div>
          </div>
        )}
      </div>
    );
  }
);

SimulationResults.displayName = "SimulationResults";
