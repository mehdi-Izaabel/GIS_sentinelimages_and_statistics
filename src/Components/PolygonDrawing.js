import React, { useEffect, useRef } from "react";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Fill, Stroke, Style } from "ol/style";
import Draw from "ol/interaction/Draw";
import { toLonLat } from "ol/proj";

const PolygonDrawing = ({ map, onPolygonDrawn, changeCoordinates }) => {
  const vectorSourceRef = useRef(new VectorSource());
  const drawRef = useRef(null);
  const vectorLayerRef = useRef(null);

  useEffect(() => {
    drawRef.current = new Draw({
      source: vectorSourceRef.current,
      type: "Polygon",
    });

    // Add the draw interaction to the map
    map.addInteraction(drawRef.current);

    // Event listener for when a polygon is drawn
    drawRef.current.on("drawend", (event) => {
      const feature = event.feature;
      const polygonCoordinates = feature.getGeometry().getCoordinates()[0];

      var convertedCoordinates = polygonCoordinates.map((coord) => {
        return toLonLat(coord);
      });

      console.log("Polygon Coordinates:", convertedCoordinates);
      onPolygonDrawn(convertedCoordinates);
    });

    // Clean up the draw interaction when the component unmounts
    return () => {
      if (map && drawRef.current) {
        map.removeInteraction(drawRef.current);
      }
    };
  }, [map, onPolygonDrawn, changeCoordinates]);

  useEffect(() => {
    // Create the vector layer when the component mounts
    vectorLayerRef.current = new VectorLayer({
      source: vectorSourceRef.current,
      style: new Style({
        fill: new Fill({
          color: "rgba(0, 0, 0, 0.2)",
        }),
        stroke: new Stroke({
          color: "white", // Red border color
          width: 2, // Border width
        }),
      }),
    });

    // Add the vector layer to the map
    map.addLayer(vectorLayerRef.current);
    return () => {
      map.removeLayer(vectorLayerRef.current);
    };
  }, [map]);

  return null;
};

export default PolygonDrawing;
