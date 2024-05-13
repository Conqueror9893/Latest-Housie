import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import ConfettiExplosion from "react-confetti-explosion";

Modal.setAppElement("#root");

function ClaimButtons({ handleClaimFastestFive, handleClaimFirstRow, handleClaimMiddleRow, handleClaimLastRow, handleClaimMiddleCell, handleClaimDiagonalCorners, handleClaimFullHouse, fastfive, firstRow, middleRow, lastRow, middleCell, diagonalCorners, fullHouse }) {
  const [showModal, setShowModal] = useState(false);
  const [fastFiveClaimed, setFastFiveClaimed] = useState(false);
  const [firstRowClaimed, setFirstRowClaimed] = useState(false);
  const [middleRowClaimed, setMiddleRowClaimed] = useState(false);
  const [lastRowClaimed, setLastRowClaimed] = useState(false);
  const [middleCellClaimed, setMiddleCellClaimed] = useState(false);
  const [diagonalCornersClaimed, setDiagonalCornersClaimed] = useState(false);
  const [fullHouseClaimed, setFullHouseClaimed] = useState(false);
  const [unclaimedCount, setUnclaimedCount] = useState(8); // Total number of claims

  const triggerConfetti = (claimFunc, claimState, setClaimedState) => {
    if (!claimState) {
      claimFunc();
      setClaimedState(true);
      setTimeout(() => {
        setShowModal(false)
      }, 50);
      return (
        <ConfettiExplosion
          width={window.innerWidth}
          height={window.innerHeight}
          zIndex={9999}
        />
      );
    }
    return null;
  };
  useEffect(()=>{
    setUnclaimedCount(prevCount => prevCount - 1);

  },[fastfive, firstRow, middleRow, lastRow, middleCell, diagonalCorners, fullHouse])

  const handleClaimAll = () => {
    setShowModal(prevState => !prevState);
  };

  // Reset all claim states when modal is closed
  const handleCloseModal = () => {
    setShowModal(false);
    setFastFiveClaimed(false);
    setFirstRowClaimed(false);
    setMiddleRowClaimed(false);
    setLastRowClaimed(false);
    setMiddleCellClaimed(false);
    setDiagonalCornersClaimed(false);
    setFullHouseClaimed(false);
  };

  return (
    <div className="d-flex gap-2 align-items-center justify-content-center">
      <button
        className="btn btn-secondary text-warning mt-4 position-relative"
        onClick={handleClaimAll}
      >
        Claims
        {unclaimedCount > 0 && <span className="badge bg-danger rounded-circle position-absolute top-0 start-100 translate-middle">{unclaimedCount}</span>}
        {fastfive && fastFiveClaimed && <ConfettiExplosion width={window.innerWidth} height={window.innerHeight} />}
        {firstRow && firstRowClaimed && <ConfettiExplosion width={window.innerWidth} height={window.innerHeight} />}
        {middleRow && middleRowClaimed && <ConfettiExplosion width={window.innerWidth} height={window.innerHeight} />}
        {lastRow && lastRowClaimed && <ConfettiExplosion width={window.innerWidth} height={window.innerHeight} />}
        {middleCell && middleCellClaimed && <ConfettiExplosion width={window.innerWidth} height={window.innerHeight} />}
        {diagonalCorners && diagonalCornersClaimed && <ConfettiExplosion width={window.innerWidth} height={window.innerHeight} />}
        {fullHouse && fullHouseClaimed && <ConfettiExplosion width={window.innerWidth} height={window.innerHeight} />}
      </button>

      <Modal
        isOpen={showModal}
        onRequestClose={handleCloseModal}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <div className="modal-header">
          <h5 className="modal-title">Claim Options</h5>
          <button className="btn btn-danger close" type="button" onClick={handleCloseModal}>
            <span className="text-danger" aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="modal-body">
          <button
            className="btn btn-secondary text-warning mt-4"
            onClick={() => triggerConfetti(handleClaimFastestFive, fastfive, setFastFiveClaimed)}
            disabled={fastfive}
          >
            Claim for Fastest Five
          </button>
          <button
            disabled={firstRow}
            className="btn btn-secondary text-warning mt-4"
            onClick={() => triggerConfetti(handleClaimFirstRow, firstRow, setFirstRowClaimed)}
          >
            Claim for First Row
          </button>
          <button
            disabled={middleRow}
            className="btn btn-secondary text-warning mt-4"
            onClick={() => triggerConfetti(handleClaimMiddleRow, middleRow, setMiddleRowClaimed)}
          >
            Claim for Middle Row
          </button>
          <button
            disabled={lastRow}
            className="btn btn-secondary text-warning mt-4"
            onClick={() => triggerConfetti(handleClaimLastRow, lastRow, setLastRowClaimed)}
          >
            Claim for Last Row
          </button>
          <button
            disabled={middleCell}
            className="btn btn-secondary text-warning mt-4"
            onClick={() => triggerConfetti(handleClaimMiddleCell, middleCell, setMiddleCellClaimed)}
          >
            Claim for Middle Cell
          </button>
          <button
            disabled={diagonalCorners}
            className="btn btn-secondary text-warning mt-4"
            onClick={() => triggerConfetti(handleClaimDiagonalCorners, diagonalCorners, setDiagonalCornersClaimed)}
          >
            Claim for Diagonal Corners
          </button>
          <button
            disabled={fullHouse}
            className="btn btn-secondary text-warning mt-4"
            onClick={() => triggerConfetti(handleClaimFullHouse, fullHouse, setFullHouseClaimed)}
          >
            Claim for Full House
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default ClaimButtons;
