import React, { useEffect, useRef, useState, useContext } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { XYZ } from "ol/source"; // Import XYZ source for true color layer
import { fromLonLat } from "ol/proj"; // Import fromLonLat to convert coordinates
import { transformExtent } from "ol/proj"; // Import transformExtent to convert extent
import Draw from "ol/interaction/Draw";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Fill, Stroke, Style } from "ol/style";
import "ol/ol.css";
import PolygonDrawing from "./PolygonDrawing";
import { AuthContext } from "../Contexts/Authcontext";
import { fetchData } from "../Requestimages/imagerequests";

const MapComponent = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [polygonCoordinates, setPolygonCoordinates] = useState([]);
  const vectorSourceRef = useRef(new VectorSource());
  const drawRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const { token, refreshToken } = useContext(AuthContext);
  const [imageData, setImageData] = useState(null);
  const [currentLayer, setCurrentLayer] = useState("normal"); // Track the current layer

  useEffect(() => {
    // Create the map when the component mounts
    const initialMap = new Map({
      target: mapRef.current,
      layers: [new TileLayer({ source: new OSM() })],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    setMap(initialMap);

    // Clean up the map when the component unmounts
    return () => {
      initialMap.setTarget(null);
    };
  }, []);

  useEffect(() => {
    // Create true color layer
    const trueColorLayer = new TileLayer({
      source: new XYZ({
        url: "https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=pztnjdxqdpgzcXoBlJCu", // Replace with the URL of your true color tile server
      }),
    });

    // Wait for map to be set before updating layers
    if (map) {
      // Add or switch layers based on the currentLayer state
      if (currentLayer === "normal") {
        map.getLayers().setAt(1, new TileLayer({ source: new OSM() })); // Replace the layer at index 1 with OSM (default layer)
      } else if (currentLayer === "TrueColor") {
        map.getLayers().setAt(1, trueColorLayer);
      }
    }
  }, [map, currentLayer]);

  const handleDrawingPolygon = () => {
    setIsDrawing(!isDrawing); // Toggle the drawing state
  };

  const handlePolygonDrawn = (coordinates) => {
    setPolygonCoordinates(coordinates);
  };

  const handleFetchData = async () => {
    try {
      console.log("Token before fetch:", token);
      console.log("Coordinates:", polygonCoordinates);
      const imageBlob = await fetchData("NDVI", {
        coordinates: polygonCoordinates,
        refreshToken,
        token,
      });

      // Use the imageBlob as needed (e.g., to display the image)
      const imageData = URL.createObjectURL(imageBlob);
      setImageData(imageData);
    } catch (error) {
      // Handle any errors that occur during the fetch
      console.error("Error fetching data:", error.message);
    }
  };
  const handleToggleLayer = () => {
    // Toggle between normal and true color layers
    if (currentLayer === "normal") {
      setCurrentLayer("TrueColor");
    } else {
      setCurrentLayer("normal");
    }
  };
  return (
    <>
      <div ref={mapRef} style={{ width: "100%", height: "100vh" }}></div>
      <button
        style={{ position: "absolute", top: "70px", left: "10px", zIndex: 1 }}
        onClick={handleDrawingPolygon}
      >
        {isDrawing ? "Stop Drawing" : "Start Drawing"}
      </button>
      <button
        style={{ position: "absolute", top: "100px", left: "10px", zIndex: 1 }}
        onClick={handleFetchData}
      >
        Get Image
      </button>
      {/* Add a button to switch to true color layer */}
      <button
        style={{ position: "absolute", top: "130px", left: "10px", zIndex: 1 }}
        onClick={handleToggleLayer}
      >
        {currentLayer === "normal"
          ? "Switch to True Color"
          : "Switch to Normal Color"}
      </button>
      {imageData && <img src={imageData} alt="Fetched Image" />}
      {isDrawing && (
        <PolygonDrawing
          map={map}
          onPolygonDrawn={handlePolygonDrawn}
          //changeCoordinates={changecoordinates} // Use handlePolygonDrawn instead of changeCoordinates
        />
      )}
    </>
  );
};

export default MapComponent;
