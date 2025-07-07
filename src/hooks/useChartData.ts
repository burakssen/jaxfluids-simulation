import { useMemo } from "react";

export const useChartData = (values: Float64Array) => {
  return useMemo(() => {
    const data = new Array(values.length);
    for (let i = 0; i < values.length; i++) {
      data[i] = { index: i, value: values[i] };
    }
    return data;
  }, [values]);
};
