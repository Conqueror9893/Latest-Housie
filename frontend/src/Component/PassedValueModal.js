import React, { useState,useEffect } from "react";
import Modal from "react-modal";
import { CiSettings } from "react-icons/ci";
import "../styles/home.css"; 
// import { UserContext } from './UserContext';


Modal.setAppElement("#root"); 

const PassedValueModal = ({socket}) => {
  const [hideValue,  setHideValue] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    socket.emit("hideORnot",hideValue);
  }, [hideValue,socket]);



  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleHidePassedValueChange = () => {
    if (hideValue) {  
      setHideValue(false);
      console.log(hideValue);

    } else {
      setHideValue(true);

      console.log(hideValue);
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
        className="custom-modal"
        overlayClassName="custom-overlay"
      >
        <div className="popup-content d-flex flex-column">
          <div>
            {/* Checkbox to hide the passed value */}
            <input
              type="checkbox"
              id="hide-passed-value-checkbox"
              checked={!hideValue}
              onChange={handleHidePassedValueChange}
            />
            <label htmlFor="hide-passed-value-checkbox">Hide Passed value</label>
          </div>
          <div>
            {/* Checkbox to show the passed value */}
            <input
              type="checkbox"
              id="show-passed-value-checkbox"
              checked={hideValue}
              onChange={handleHidePassedValueChange}
            />
            <label htmlFor="show-passed-value-checkbox">Show Passed value</label>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PassedValueModal;
