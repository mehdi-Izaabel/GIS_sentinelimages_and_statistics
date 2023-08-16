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
        "dataMask"
      ]
    }],
    output: [
      {
        id: "ndvi",
        bands: ["NDVI"]
      },
      
      {     
        id: "dataMask",
        bands: 1
      }]
  };
}

function evaluatePixel(samples) {
    let ndvi = (samples.B08 - samples.B04) / (samples.B08 + samples.B04);
    
        var  validNDVIMask = 1 
        if ( samples.B08 + samples.B04 == 0 ){
                validNDVIMask = 0        
    }
    return {
        ndvi : [ndvi],
        dataMask: [samples.dataMask * validNDVIMask],
    };
}

`;
        const stats_request = {
            "input": {
                "bounds": {
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [params.coordinates]
                    }
                },
                "data": [{
                    "dataFilter": {
                        maxCloudCoverage: 5,
                        mosaickingOrder: "mostRecent"
                    },
                    "type": "sentinel-2-l2a"
                }]
            },
            "aggregation": {
                "timeRange": {
                    "from": fromDate,
                    "to": toDate
                },
                "aggregationInterval": {
                    "of": "P10D"
                },
                "width": 832.838,
                "height": 575.226,
                "evalscript": evalscript,
            },
            "calculations": {
                "default": {
                    "histograms": {
                        "default": {
                            "nBins": 25,
                            "binWidth": 0.05
                        }
                    }
                }
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