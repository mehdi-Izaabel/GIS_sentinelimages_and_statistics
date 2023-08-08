import axios from "axios";



const evalscript = `//VERSION=3
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
        id: "dataMask",
        bands: 1
      }]
  }
}

function evaluatePixel(samples) {
    let ndvi = (samples.B08 - samples.B04)/(samples.B08 + samples.B04)

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
        // Exclude nodata pixels, pixels where ndvi is not defined and water pixels from statistics:
        dataMask: [samples.dataMask * validNDVIMask * noWaterMask]
    }
}
  `;
export const fetchStats = async(params) => {
    const currentDate = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setUTCFullYear(currentDate.getUTCFullYear() - 1);

    const toDate = currentDate.toISOString();
    const fromDate = oneYearAgo.toISOString();



    try {
        const formData = new FormData();
        formData.append(
            "evalscript",
            evalscript
        );

        formData.append(
            "stats_request",
            `{
        "input": {
            "bounds": {
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                     ${params.coordinates}
                    ]
                },
                "properties": {
                    "crs": "http://www.opengis.net/def/crs/EPSG/0/32633"
                }
            },
            "data": [
                {
                    "type": "sentinel-2-l2a",
                    "dataFilter": {
                        "mosaickingOrder": "leastCC"
                    }
                }
            ]
        },
        "aggregation": {
            "timeRange": {
                "from": "2020-01-01T00:00:00Z",
                "to": "2020-12-31T00:00:00Z"
            },
            "aggregationInterval": {
                "of": "P30D"
            },
            "evalscript": evalscript,
            "resx": 10,
            "resy": 10
        }
    }`
        );

        const response = await axios.post(
            "https://services.sentinel-hub.com/api/v1/statistics",
            formData, {
                headers: {
                    Authorization: `Bearer ${params.token}`,
                    "Content-Type": "multipart/form-data",
                    Accept: "application/json",
                },

            }
        );

        console.log(response);

        if (response.status === 401) {
            params.refreshToken(() => fetchStats(params));
            return;
        }

        if (response.status === 200) {
            const Stats = response.data;
            console.log("Statistics:", response.data);

            return Stats;
        } else {
            throw new Error(
                `Error fetching Stats: ${response.status} - ${response.statusText}`
            );
        }
    } catch (error) {
        throw new Error(`Error fetching stats: ${error.message}`);
    }
};