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
      <div className="flex flex-col flex-1 min-h-0 space-y-2">
        <h3 className="text-base font-semibold tracking-tight text-gray-100">Simulation Results</h3>
        {hasData ? (
          <Suspense fallback={<ChartLoadingPlaceholder />}>
            <div className={getGridClasses().replace(/gap-6/g, 'gap-2') + ' flex-1 min-h-0'}>
              {chartData.map((channelData, idx) => (
                <div key={idx} className="w-full h-full flex-1 min-h-0">
                  <SimulationChart
                    chartData={channelData}
                    channelLabels={[channelLabels[idx] || `Channel ${idx}`]}
                    yAxisDomain={yAxisDomain}
                    fillHeight
                  />
                </div>
              ))}
            </div>
          </Suspense>
        ) : (
          <div className="w-full p-3 bg-gray-900 rounded-md shadow-sm border border-gray-800 text-center">
            <div className="text-gray-400 text-base">
              No simulation data available. Click "Run" to start the simulation.
            </div>
          </div>
        )}
      </div>
    );
  }
);

SimulationResults.displayName = "SimulationResults";
