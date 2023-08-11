import axios from "axios";

export const fetchStats = async(params) => {

    console.log("received token", params.token);
    console.log("Received coordinates:", params.coordinates);
    const currentDate = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setUTCFullYear(currentDate.getUTCFullYear() - 1);

    const toDate = currentDate.toISOString();
    const fromDate = oneYearAgo.toISOString();

    try {

        const evalscript = `
//VERSION=3
function setup() {
  return {
    input: [{
      bands: [
        "B04",
        "B08",
        "SCL",
        "dataMask"
      ]
    }],
    output: [
      {
        id: "data",
        bands: 1
      },
      {
        id: "B04",
        bands: 1
      },
      {
        id: "B08",
        bands: 1
      },
      {
        id: "SCL",
        bands: 1
      },
      {
        id: "dataMask",
        bands: 1
      }
    ]
  }
}

function evaluatePixel(samples) {
    let ndvi = (samples.B08 - samples.B04) / (samples.B08 + samples.B04)

    var validNDVIMask = 1
    if (samples.B08 + samples.B04 == 0 ){
        validNDVIMask = 0
    }

    var noWaterMask = 1
    if (samples.SCL == 6 ){
        noWaterMask = 0
    }

    return {
        data: [ndvi],
        B04: [samples.B04],
        B08: [samples.B08],
        SCL: [samples.SCL],
        dataMask: [samples.dataMask * validNDVIMask * noWaterMask]
    }
}

`;
        const stats_request = {
            "input": {
                "bounds": {
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [params.coordinates]
                    },
                    "properties": {
                        "crs": "http://www.opengis.net/def/crs/EPSG/0/32633"
                    }
                },
                "data": [{
                    "type": "sentinel-2-l2a",
                    "dataFilter": {
                        "mosaickingOrder": "leastCC"
                    }
                }]
            },
            "aggregation": {
                "timeRange": {
                    "from": fromDate,
                    "to": toDate
                },
                "aggregationInterval": {
                    "of": "P30D"
                },
                "evalscript": evalscript,
                "resx": 10,
                "resy": 10
            }
        };


        const response = await axios.post(
            "https://services.sentinel-hub.com/api/v1/statistics",
            stats_request, {
                headers: {
                    Authorization: `Bearer ${params.token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
            }
        );

        console.log(response);

        if (response.status === 401) {
            params.refreshToken(() => fetchStats(params));
            return;
        }

        if (response.status === 200) {
            const statistics = response.data;
            console.log(statistics);
            return statistics;
        } else {
            throw new Error(
                `Error fetching Stats: ${response.status} - ${response.statusText}`
            );
        }
    } catch (error) {
        throw new Error(`Error fetching Stats: ${error.message}`);
    }
};