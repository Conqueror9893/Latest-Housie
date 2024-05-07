import React from "react";
import Modal from "react-modal";
import { CiSettings } from "react-icons/ci";
import "../styles/home.css"; 
import { Link } from "react-router-dom";

Modal.setAppElement("#root"); 

const Options = ({ handlePauseResume, paused }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [confirmExitOpen, setConfirmExitOpen] = React.useState(false);

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };
  const handleButtonClick = (action) => {
    if (action === "Exit") {
      setConfirmExitOpen(true);
    } else if (action === "Pause" || action === "Resume") {
      handlePauseResume();
      handleClose();
      
    } else {
      handleClose();
    }
  };
  

  const handleConfirmExit = (confirmed) => {
    setConfirmExitOpen(false);
    if (confirmed) {
      window.location.href = "/";
    } else {
      setIsOpen(false);
    }
  };

  return (
    <>
      <div className="settings-icon" onClick={togglePopup}>
        <CiSettings />
      </div>

      
      <Modal
        isOpen={isOpen}
        onRequestClose={handleClose}
        contentLabel="Settings Popup"
        className="custom-modal" 
        overlayClassName="custom-overlay" 
      >
        <div className="popup-content d-flex flex-column">
          <button
            className="btn btn-primary my-4 pause-btn"
            onClick={(e) => {
              e.preventDefault();
              handleButtonClick(paused ? "Resume" : "Pause");
            }}
          >
            {paused ? "Resume" : "Pause"}
          </button>
          <Link
            to="/"
            className="btn btn-primary exit-btn"
            onClick={(e) => {
              e.preventDefault();
              handleButtonClick("Exit");
            }}
          >
            Exit
          </Link>
        </div>
      </Modal>


      {/* Confirm Exit Modal */}
      <Modal
        isOpen={confirmExitOpen}
        onRequestClose={() => handleConfirmExit(false)}
        contentLabel="Confirm Exit Popup"
        className="confirm-modal" 
        overlayClassName="confirm-overlay" 
      >
        <div className="confirm-content">
          <p className="fs-5">Are you sure you want to exit?</p>
          <div className="d-flex justify-content-center">
            <button
              className="btn btn-primary mx-2"
              onClick={() => handleConfirmExit(true)}
            >
              Yes
            </button>
            <button
              className="btn btn-danger mx-2"
              onClick={() => handleConfirmExit(false)}
            >
              No
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Options;
