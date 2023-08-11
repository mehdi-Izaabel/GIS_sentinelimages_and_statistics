import axios from "axios";

export const fetchData = async(type, params) => {
    const currentDate = new Date();


    const oneYearAgo = new Date();
    oneYearAgo.setUTCFullYear(currentDate.getUTCFullYear() - 1);


    const toDate = currentDate.toISOString();
    const fromDate = oneYearAgo.toISOString();

    console.log("Received token:", params.token);
    console.log("Received coordinates:", params.coordinates);
    console.log("jsonstringify coordinates:", JSON.stringify(params.coordinates));
    /* console.log(`{
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
*/
    /* console.log(`//VERSION=3
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
}`);*/

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
                  "type": "sentinel-2-l2a",
                  "dataFilter": {
                    "timeRange": {
                      "from": "${fromDate}",
                      "to": "${toDate}"
                    },
"maxCloudCoverage": 0
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
                    `// VERSION=3
function setup() {
  return {
    input: [{ bands: ["B04", "B08", "dataMask","SCL"] }],
    output: {
      id: "default",
      bands: 4
    }
  };
}

function sigmoid(x, k = 10) {
  return 1 / (1 + Math.exp(-k * (x - 0.5)));
}

function findColor(colValPairs, val) {
  let n = colValPairs.length;
  for (let i = 1; i < n; i++) {
    if (val <= colValPairs[i][0]) {
      return toRGB(colValPairs[i - 1][1]);
    }
  }
  return toRGB(colValPairs[n - 1][1]);
}

function toRGB(val) {
  return [val >>> 16, (val >>> 8) & 0xFF, val & 0xFF].map(x => x / 255);
}

let ndviColorMap = [
  [-1.0, 0x000000],
  [-0.2, 0xA50026],
  [0.0, 0xD73027],
  [0.1, 0xF46D43],
  [0.2, 0xFDAE61],
  [0.3, 0xFEE08B],
  [0.4, 0xFFFFBF],
  [0.5, 0xD9EF8B],
  [0.6, 0xA6D96A],
  [0.7, 0x66BD63],
  [0.8, 0x1A9850],
  [0.9, 0x006837]
];

function evaluatePixel(sample) {
  const ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
  const alpha = sample.dataMask === 1 ? 255 : 0; // Set alpha to 0 for pixels outside the area of interest

  if (ndvi >= 1) return [0.843, 0.843, 0.843, alpha];      // Grey - Full vegetation
  else {
    const contrastedNDVI = sigmoid((sample.B08 - sample.B04) / (sample.B08 + sample.B04));
    return findColor(ndviColorMap, contrastedNDVI).concat(alpha);
  }
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

        case "EVI":
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
                  "type": "sentinel-2-l2a",
                  "dataFilter": {
                    "timeRange": {
                      "from": "${fromDate}",
                      "to": "${toDate}"
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
                    `// VERSION=3
function setup() {
  return {
    input: [{ bands: ["B04", "B08","B02", "dataMask","SCL"] }],
    output: {
      id: "default",
      bands: 4
    }
  };
}
function evaluatePixel(sample) {
let EVI2 = 2.4 * (sample.B08 - sample.B04) / (sample.B08 + sample.B04 + 1.0);
const alpha = sample.dataMask === 1 ? 255 : 0;

if (EVI2<-1.1) return [0,0,0,alpha];
else if (EVI2<-0.2) return [0.75,0.75,1,alpha];
else if (EVI2<-0.1) return [0.86,0.86,0.86,alpha];
else if (EVI2<0) return [1,1,0.88,alpha];
else if (EVI2<0.025) return [1,0.98,0.8,alpha];
else if (EVI2<0.05) return [0.93,0.91,0.71,alpha];
else if (EVI2<0.075) return [0.87,0.85,0.61,alpha];
else if (EVI2<0.1) return [0.8,0.78,0.51,alpha];
else if (EVI2<0.125) return [0.74,0.72,0.42,alpha];
else if (EVI2<0.15) return [0.69,0.76,0.38,alpha];
else if (EVI2<0.175) return [0.64,0.8,0.35,alpha];
else if (EVI2<0.2) return [0.57,0.75,0.32,alpha];
else if (EVI2<0.25) return [0.5,0.7,0.28,alpha];
else if (EVI2<0.3) return [0.44,0.64,0.25,alpha];
else if (EVI2<0.35) return [0.38,0.59,0.21,alpha];
else if (EVI2<0.4) return [0.31,0.54,0.18,alpha];
else if (EVI2<0.45) return [0.25,0.49,0.14,alpha];
else if (EVI2<0.5) return [0.19,0.43,0.11,alpha];
else if (EVI2<0.55) return [0.13,0.38,0.07,alpha];
else if (EVI2<0.6) return [0.06,0.33,0.04,alpha];
else return [0,0.27,0,alpha];
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
                    console.log("hadi EVI");
                    return imageBlob;
                } else {
                    throw new Error(
                        `Error fetching ${type} image: ${response.status} - ${response.statusText}`
                    );
                }
            } catch (error) {
                throw new Error(`Error fetching ${type} image: ${error.message}`);
            }

            break;

        case "FalseColor":
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
                  "type": "sentinel-2-l2a",
                  "dataFilter": {
                    "timeRange": {
                      "from": "${fromDate}",
                      "to": "${toDate}"
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
                    `// VERSION=3
function setup() {
  return {
    input: [{ bands: ["B04", "B08","B03", "dataMask","SCL"] }],
    output: {
      id: "default",
      bands: 4
    }
  };
}
function evaluatePixel(sample) {

const alpha = sample.dataMask === 1 ? 255 : 0;
let gain = 2.5;

 if (sample.dataMask === 1){
return [sample.B08, sample.B04, sample.B03].map(a => gain * a).concat(alpha);
            }
else{
return [0,0,0,alpha];
}
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
            break;

        case "NDWI":
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
                  "type": "sentinel-2-l2a",
                  "dataFilter": {
                    "timeRange": {
                      "from": "${fromDate}",
                      "to": "${toDate}"
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
                    `// VERSION=3
function setup() {
  return {
    input: [{ bands: ["B08","B03", "dataMask","SCL"] }],
    output: {
      id: "default",
      bands: 4
    }
  };
}

var colorRamp1 = [
  	[0, 0xFFFFFF],
  	[1, 0x008000]
  ];
var colorRamp2 = [
  	[0, 0xFFFFFF],
  	[1, 0x0000CC]
  ];

let viz1 = new ColorRampVisualizer(colorRamp1);
let viz2 = new ColorRampVisualizer(colorRamp2);

function evaluatePixel(samples) {

const alpha = samples.dataMask === 1 ? 255 : 0;

  var val = index(samples.B03, samples.B08);

if (samples.dataMask === 1) {
  if (val < -0) {
    return viz1.process(-val).concat(alpha);
  } else {
    return viz2.process(Math.sqrt(Math.sqrt(val))).concat(alpha);
  }
            }else{
        return [0,0,0,alpha];                      
}
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
            break;

        case "SAVI":
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
                  "type": "sentinel-2-l2a",
                  "dataFilter": {
                    "timeRange": {
                      "from": "${fromDate}",
                      "to": "${toDate}"
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
                    `// VERSION=3
function setup() {
  return {
    input: [{ bands: ["B08","B04", "dataMask","SCL"] }],
    output: {
      id: "default",
      bands: 4
    }
  };
            }

function evaluatePixel(samples) {

const alpha = samples.dataMask === 1 ? 255 : 0;

let L = 0.428; 
let index = (samples.B08 - samples.B04) / (samples.B08 + samples.B04 + L) * (1.0 + L); 


return colorBlend   
(index,	            
     [ 0,0.1, 0.2,0.4, 0.5,0.7,1], 
     [ [0.69,0.88,0.90],   
       [0.74,0.72,0.42],
       [0.60,0.80,0.20],
       [0.13, 0.54, 0.13],
       [0, 0.50, 0],
       [0, 0.39, 0],
       [0, 0.29, 0],
     ]).concat(alpha);
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
            break;

        case "TrueColor":
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
                  "type": "sentinel-2-l2a",
                  "dataFilter": {
                    "timeRange": {
                      "from": "${fromDate}",
                      "to": "${toDate}"
                    },
          "maxCloudCoverage": 0
          
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
function setup(){
  return{
    input: ["B02", "B03", "B04", "dataMask"],
    output: {bands: 4}
  }
}

function evaluatePixel(sample){

  let gain = 2.5;
  // Return RGB
  return [sample.B04 * gain, sample.B03 * gain, sample.B02 * gain, sample.dataMask];
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
            break;

        default:
            // Invalid type
            throw new Error(`Invalid data type: ${type}`);
    }

};