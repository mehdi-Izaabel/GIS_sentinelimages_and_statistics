import React, { useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const ChartComponent = ({ histogramData }) => {
  useEffect(() => {
    if (histogramData) {
      const options = {
        chart: {
          type: "column",
        },
        title: {
          text: "NDVI Values",
        },
        xAxis: {
          categories: histogramData.map((dataPoint) =>
            new Date(dataPoint.interval.from).toLocaleDateString()
          ),
          title: {
            text: "Time",
          },
        },
        yAxis: {
          title: {
            text: "Count",
          },
        },
        series: [
          {
            name: "Minimum NDVI",
            data: histogramData.map(
              (dataPoint) => dataPoint.outputs.ndvi.bands.NDVI.stats.min
            ),
          },
          {
            name: "Maximum NDVI",
            data: histogramData.map(
              (dataPoint) => dataPoint.outputs.ndvi.bands.NDVI.stats.max
            ),
          },
          {
            name: "Average NDVI",
            data: histogramData.map(
              (dataPoint) => dataPoint.outputs.ndvi.bands.NDVI.stats.mean
            ),
          },
        ],
        plotOptions: {
          column: {
            stacking: "normal",
            pointPadding: 0.2,
            borderWidth: 0,
          },
        },
      };

      // Initialize Highcharts chart
      Highcharts.chart("chart-container", options);
    }
  }, [histogramData]);

  return <div id="chart-container" className="chart-container" />;
};

export default ChartComponent;
