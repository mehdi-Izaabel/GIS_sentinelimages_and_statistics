import React, { useEffect, useRef, useState, useContext } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { XYZ } from "ol/source";
import { toLonLat, transformExtent } from "ol/proj";
import Overlay from "ol/Overlay";
import { Image as ImageLayer } from "ol/layer";
import { ImageStatic } from "ol/source";
import Draw from "ol/interaction/Draw";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Fill, Stroke, Style } from "ol/style";
import "ol/ol.css";
import PolygonDrawing from "./PolygonDrawing";
import { AuthContext } from "../Contexts/Authcontext";
import { fetchData } from "../Requestimages/imagerequests";
import { fetchStats } from "../Requestimages/statsrequests";
import "../styles/Buttonstyles.css";
import "../styles/layerSwitcherControl.css";

const MapComponent = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [polygonCoordinates, setPolygonCoordinates] = useState([]);
  const vectorSourceRef = useRef(new VectorSource());
  const vectorLayerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const { token, refreshToken } = useContext(AuthContext);
  const [imageData, setImageData] = useState(null);
  const [currentLayer, setCurrentLayer] = useState("normal");
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  const [selectedImageType, setSelectedImageType] = useState("NDVI");
  const imageTypes = ["NDVI", "EVI", "FalseColor", "NDWI", "SAVI"];

  const baseMaps = {
    STREETS: {
      img: "https://cloud.maptiler.com/static/img/maps/streets.png",
    },
    HYBRID: {
      img: "https://cloud.maptiler.com/static/img/maps/hybrid.png",
    },
  };

  useEffect(() => {
    const initialMap = new Map({
      target: mapRef.current,
      layers: [new TileLayer({ source: new OSM() })],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    setMap(initialMap);

    return () => {
      initialMap.setTarget(null);
    };
  }, []);

  useEffect(() => {
    const trueColorLayer = new TileLayer({
      source: new XYZ({
        url: "https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=pztnjdxqdpgzcXoBlJCu",
      }),
    });

    if (map) {
      if (currentLayer === "normal") {
        map.getLayers().setAt(1, new TileLayer({ source: new OSM() }));
      } else if (currentLayer === "hybrid") {
        map.getLayers().setAt(1, trueColorLayer);
      }
    }
  }, [map, currentLayer]);

  const handleDrawingPolygon = () => {
    setIsDrawing(!isDrawing);
  };

  const handlePolygonDrawn = (coordinates) => {
    setPolygonCoordinates(coordinates);
  };

  const handleFetchData = async (imageType) => {
    try {
      console.log("Selected Image Type:", imageType);

      if (!map || polygonCoordinates.length === 0) {
        console.warn(
          "Cannot fetch data. Map or polygon coordinates are not ready."
        );
        return;
      }
      setIsLoadingImage(true);
      const imageBlob = await fetchData(imageType, {
        coordinates: polygonCoordinates,
        refreshToken,
        token,
      });

      const imageExtent = getExtentForCoordinates(polygonCoordinates);
      const imageSource = new ImageLayer({
        source: new ImageStatic({
          url: URL.createObjectURL(imageBlob),
          imageExtent,
        }),
      });

      if (vectorLayerRef.current) {
        map.removeLayer(vectorLayerRef.current);
      }

      map.addLayer(imageSource);
      setImageData(imageSource.getSource().getUrl());
      setIsLoadingImage(false);
    } catch (error) {
      console.error("Error fetching data:", error.message);
      setIsLoadingImage(false);
    }
  };

  const handleFetchStats = async () => {
    try {
      const response = await fetchStats({
        coordinates: polygonCoordinates,
        token,

        refreshToken,
      });

      console.log("Stats Response:", response);
    } catch (error) {
      console.error("Error fetching stats:", error.message);
    }
  };

  const handleImageTypeChange = (event) => {
    setSelectedImageType(event.target.value);
  };

  useEffect(() => {
    vectorLayerRef.current = new VectorLayer({
      source: vectorSourceRef.current,
      style: new Style({
        fill: new Fill({
          color: "rgba(0, 0, 0, 0.2)",
        }),
        stroke: new Stroke({
          color: "white",
          width: 2,
        }),
      }),
    });

    if (map) {
      map.addLayer(vectorLayerRef.current);
    }

    return () => {
      if (map) {
        map.removeLayer(vectorLayerRef.current);
      }
    };
  }, [map]);

  return (
    <>
      <div ref={mapRef} style={{ width: "100%", height: "100vh" }}>
        <div className="layer-switcher-container">
          <img
            src={
              currentLayer === "normal"
                ? baseMaps.HYBRID.img
                : baseMaps.STREETS.img
            }
            alt={currentLayer}
            className="layer-switcher-button"
            onClick={() =>
              setCurrentLayer(currentLayer === "normal" ? "hybrid" : "normal")
            }
          />
        </div>
      </div>
      <button className="Drawingbutton" onClick={handleDrawingPolygon}>
        {isDrawing ? "Stop Drawing" : "Start Drawing"}
      </button>
      <select
        className="selectImageType"
        value={selectedImageType}
        onChange={handleImageTypeChange}
      >
        {imageTypes.map((type) => (
          <option key={type} value={type} className="selectImageType-option">
            {type}
          </option>
        ))}
      </select>
      <button
        className={`Getimagebutton ${isLoadingImage ? "loading" : ""}`}
        onClick={() => handleFetchData(selectedImageType)}
      >
        {isLoadingImage ? <span className="spinner"></span> : "Get Image"}
      </button>

      <button className="Getstatsbutton" onClick={() => handleFetchStats()}>
        Get Statistics
      </button>

      {isDrawing && (
        <PolygonDrawing map={map} onPolygonDrawn={handlePolygonDrawn} />
      )}
    </>
  );
};

export default MapComponent;

function getExtentForCoordinates(coordinates) {
  const extent = coordinates.reduce(
    (acc, coord) => {
      acc[0] = Math.min(acc[0], coord[0]);
      acc[1] = Math.min(acc[1], coord[1]);
      acc[2] = Math.max(acc[2], coord[0]);
      acc[3] = Math.max(acc[3], coord[1]);
      return acc;
    },
    [Infinity, Infinity, -Infinity, -Infinity]
  );

  const transformedExtent = transformExtent(extent, "EPSG:4326", "EPSG:3857");
  return transformedExtent;
}
