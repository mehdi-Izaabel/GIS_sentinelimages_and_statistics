import React from "react";
import Modal from "react-modal";
import ChartComponent from "./ChartComponent";

const ChartModal = ({ isOpen, onRequestClose, histogramData }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Chart Modal"
      className="chart-modal" // Apply the chart-modal class for styling
      overlayClassName="chart-modal-overlay" // Apply any overlay styles if needed
    >
      <div className="chart-modal-content">
        {/* Apply the chart-modal-content class */}
        <h2> NDVI Statistics </h2>
        <button
          className="chart-modal-close-button" // Apply the chart-modal-close-button class
          onClick={onRequestClose}
        >
          &times;
        </button>
        <ChartComponent histogramData={histogramData} />
      </div>
    </Modal>
  );
};

export default ChartModal;
