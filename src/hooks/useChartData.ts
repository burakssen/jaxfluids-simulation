import { useMemo } from "react";

export const useChartData = (
  values: Float64Array[],
  spatialRange: [number, number]
) => {
  return useMemo(() => {
    if (!values || values.length === 0) {
      return [];
    }

    const numPoints = values[0]?.length || 0;
    if (numPoints === 0) {
      return [];
    }

    const range = spatialRange[1] - spatialRange[0];
    const step = range / (numPoints - 1);

    const result = values.map((channelValues) => {
      const data = new Array(numPoints);
      for (let i = 0; i < numPoints; i++) {
        data[i] = {
          index: parseFloat((spatialRange[0] + i * step).toFixed(2)),
          value: channelValues[i],
        };
      }
      return data;
    });

    return result;
  }, [values, spatialRange]);
};
