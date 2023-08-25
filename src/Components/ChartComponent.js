import React, { useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const ChartComponent = ({ histogramData }) => {
    useEffect(() => {
        if (histogramData) {
            const options = {
                chart: {
                    type: "line", // Set chart type to line
                },
                title: {
                    text: "NDVI Values Over The Last Year",
                },
                xAxis: {
                    type: "datetime",
                    tickInterval: 3 * 30 * 24 * 3600 * 1000,
                    labels: {
                        formatter: function() {
                            return Highcharts.dateFormat("%b %Y", this.value);
                        },
                    },
                    title: {
                        text: "Time",
                    },
                },
                yAxis: {
                    title: {
                        text: "NDVI Values",
                    },
                },
                series: [{
                        name: "Minimum NDVI",
                        data: histogramData.map((dataPoint) => [
                            new Date(dataPoint.interval.from).getTime(), // Convert the date to timestamp
                            dataPoint.outputs.ndvi.bands.NDVI.stats.min,
                        ]),
                        visible: false,
                    },
                    {
                        name: "Maximum NDVI",
                        data: histogramData.map((dataPoint) => [
                            new Date(dataPoint.interval.from).getTime(), // Convert the date to timestamp
                            dataPoint.outputs.ndvi.bands.NDVI.stats.max,
                        ]),
                        visible: false,
                    },
                    {
                        name: "Average NDVI",
                        data: histogramData.map((dataPoint) => [
                            new Date(dataPoint.interval.from).getTime(), // Convert the date to timestamp
                            dataPoint.outputs.ndvi.bands.NDVI.stats.mean,
                        ]),
                    },
                ],
                tooltip: {
                    formatter: function() {
                        const dateFormatter = new Intl.DateTimeFormat("fr", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        });
                        return (
                            "<b>" +
                            dateFormatter.format(this.x) +
                            "</b><br/>" +
                            this.y +
                            " " +
                            this.series.name
                        );
                    },
                },
            };

            // Initialize Highcharts chart
            Highcharts.chart("chart-container", options);
        }
    }, [histogramData]);

    return <div id = "chart-container"
    className = "chart-container" / > ;
};

export default ChartComponent;