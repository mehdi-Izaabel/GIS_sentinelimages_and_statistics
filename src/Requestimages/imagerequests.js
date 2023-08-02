import axios from "axios";

export const fetchData = async(type, params) => {
    console.log("Received token:", params.token);
    console.log("Received coordinates:", params.coordinates);
    console.log("jsonstringify coordinates:", JSON.stringify(params.coordinates));
    console.log(`{
    "input": {
        "bounds": {
            "properties": {
                "crs": "http://www.opengis.net/def/crs/OGC/1.3/CRS84"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [${JSON.stringify(params.coordinates)}]
                
            }
        },
        "data": [
            {
                "type": "sentinel-2-l1c",
                "dataFilter": {
                    "timeRange": {
                        "from": "2018-10-01T00:00:00Z",
                        "to": "2018-12-20T00:00:00Z"
                    }
                }
            }
        ]
    },
    "output": {
        "width": 512,
        "height": 512,
        "responses": [
            {
                "identifier": "default",
                "format": {
                    "type": "image/jpeg",
                    "quality": 80
                }
            }
        ]
    }
}`);

    console.log(`//VERSION=3
function setup() {
  return {
    input: [{
      bands:["B04", "B08"],
    }],
    output: {
      id: "default",
      bands: 3,
    }
  }
}
function evaluatePixel(sample) {
    let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04)
    if (ndvi<-0.5) return [0.05,0.05,0.05]
    else if (ndvi<-0.2) return [0.75,0.75,0.75]
    else if (ndvi<-0.1) return [0.86,0.86,0.86]
    else if (ndvi<0) return [0.92,0.92,0.92]
    else if (ndvi<0.025) return [1,0.98,0.8]
    else if (ndvi<0.05) return [0.93,0.91,0.71]
    else if (ndvi<0.075) return [0.87,0.85,0.61]
    else if (ndvi<0.1) return [0.8,0.78,0.51]
    else if (ndvi<0.125) return [0.74,0.72,0.42]
    else if (ndvi<0.15) return [0.69,0.76,0.38]
    else if (ndvi<0.175) return [0.64,0.8,0.35]
    else if (ndvi<0.2) return [0.57,0.75,0.32]
    else if (ndvi<0.25) return [0.5,0.7,0.28]
    else if (ndvi<0.3) return [0.44,0.64,0.25]
    else if (ndvi<0.35) return [0.38,0.59,0.21]
    else if (ndvi<0.4) return [0.31,0.54,0.18]
    else if (ndvi<0.45) return [0.25,0.49,0.14]
    else if (ndvi<0.5) return [0.19,0.43,0.11]
    else if (ndvi<0.55) return [0.13,0.38,0.07]
    else if (ndvi<0.6) return [0.06,0.33,0.04]
    else return [0,0.27,0]
}`);

    switch (type) {
        case "NDVI":
            try {
                const formData = new FormData();
                formData.append(
                    "request",
                    `{
            "input": {
              "bounds": {
                "properties": {
                  "crs": "https://www.opengis.net/def/crs/OGC/1.3/CRS84"
                },
                "geometry": {
                  "type": "Polygon",
                  "coordinates": [${JSON.stringify(params.coordinates)}]
                }
              },
              "data": [
                {
                  "type": "sentinel-2-l1c",
                  "dataFilter": {
                    "timeRange": {
                      "from": "2018-10-01T00:00:00Z",
                      "to": "2018-12-20T00:00:00Z"
                    }
                  }
                }
              ]
            },
            "output": {
              "width": 512,
              "height": 512,
              "responses": [
                {
                  "identifier": "default",
                  "format": {
                    "type": "image/png",
                    "quality": 80
                  }
                }
              ]
            }
          }`
                );

                formData.append(
                    "evalscript",
                    `//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B04", "B08", "dataMask"] }],
    output: {
      id: "default",
      bands: 4
    }
  };
}

function evaluatePixel(sample) {
  const ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
  const alpha = sample.dataMask === 1 ? 255 : 0; // Set alpha to 0 for pixels outside the area of interest

  if (ndvi < -0.5) return [0.63, 0.02, 0.02, alpha];
  else if (ndvi < -0.2) return [0.61, 0.05, 0.03, alpha];
  else if (ndvi < -0.1) return [0.58, 0.09, 0.04, alpha];
  else if (ndvi < 0) return [0.56, 0.12, 0.05, alpha];
  else if (ndvi < 0.025) return [0.53, 0.15, 0.08, alpha];
  else if (ndvi < 0.05) return [0.73, 0.35, 0.21, alpha];
  else if (ndvi < 0.075) return [0.68, 0.38, 0.21, alpha];
  else if (ndvi < 0.1) return [0.64, 0.40, 0.21, alpha];
  else if (ndvi < 0.125) return [0.60, 0.42, 0.21, alpha];
  else if (ndvi < 0.15) return [0.56, 0.45, 0.21, alpha];
  else if (ndvi < 0.175) return [0.52, 0.47, 0.21, alpha];
  else if (ndvi < 0.2) return [0.47, 0.49, 0.21, alpha];
  else if (ndvi < 0.25) return [0.44, 0.51, 0.20, alpha];
  else if (ndvi < 0.3) return [0.39, 0.54, 0.20, alpha];
  else if (ndvi < 0.35) return [0.35, 0.56, 0.20, alpha];
  else if (ndvi < 0.4) return [0.31, 0.58, 0.20, alpha];
  else if (ndvi < 0.45) return [0.27, 0.60, 0.20, alpha];
  else if (ndvi < 0.5) return [0.23, 0.63, 0.20, alpha];
  else if (ndvi < 0.55) return [0.19, 0.65, 0.20, alpha];
  else if (ndvi < 0.6) return [0.14, 0.67, 0.20, alpha];
  else return [0, 0.27, 0, alpha];
}

`
                );

                const response = await axios.post(
                    "https://services.sentinel-hub.com/api/v1/process",
                    formData, {
                        headers: {
                            Authorization: `Bearer ${params.token}`,
                            "Content-Type": "multipart/form-data",
                            Accept: "*/*",
                        },
                        responseType: "blob",
                    }
                );

                console.log(response);

                if (response.status === 401) {
                    params.refreshToken(() => fetchData(type, params));
                    return;
                }

                if (response.status === 200) {
                    const imageBlob = response.data;
                    console.log(imageBlob);
                    return imageBlob;
                } else {
                    throw new Error(
                        `Error fetching ${type} image: ${response.status} - ${response.statusText}`
                    );
                }
            } catch (error) {
                throw new Error(`Error fetching ${type} image: ${error.message}`);
            }

        case "type1":
            // Fetch data for type1
            break;

        case "type2":
            // Fetch data for type2
            break;

        case "type3":
            // Fetch data for type3
            break;

        default:
            // Invalid type
            throw new Error(`Invalid data type: ${type}`);
    }
};