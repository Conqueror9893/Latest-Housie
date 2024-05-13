// claimsLogic.js

import axios from "axios";

const { FETCH_URL } = require("../constant");

const BASE_URL = FETCH_URL;

const claimFastestFive = async (socket, tickets, strikedNumbers, joiningCode) => {
  if (!tickets.ticket) {
    alert("ticket data is not available.");
    return;
  }
  if (strikedNumbers.length >= 5) {
    const data = {
      claim: "fastFive",
      socketId: socket.id,
      joiningCode: joiningCode,
    };

    try {
      await axios.put(`${BASE_URL}/claim-validation`, data);
    } catch (e) {
      console.error("Error updating ticket:", e);
    }

    socket.emit("FastFiveClaim");

    return "You Claimed Fast Five";
  } else {
    return "Fast Five can't be claimed now";
  }
};

const claimFirstRow = async (socket, tickets, strikedNumbers, joiningCode) => {
  if (!tickets.ticket) {
    alert("ticket data is not available.");
    return;
  }

  const firstRow = tickets.ticket[0];
  let allCellsStriked = true;

  for (let i = 0; i < firstRow.length; i++) {
    if (firstRow[i] && !strikedNumbers.includes(firstRow[i])) {
      allCellsStriked = false;
      break;
    }
  }

  if (allCellsStriked) {
    const data = {
      claim: "firstRow",
      socketId: socket.id,
      joiningCode: joiningCode,
    };

    try {
      await axios.put(`${BASE_URL}/claim-validation`, data);
    } catch (e) {
      console.error("Error updating ticket:", e);
    }

    socket.emit("FirstRowClaim");

    return "You Claimed First Row";
  } else {
    return "First Row can't be claimed now";
  }
};

const claimMiddleRow = async (socket, tickets, strikedNumbers, joiningCode) => {
  if (!tickets.ticket) {
    alert("ticket data is not available.");
    return;
  }
  const middleRow = tickets.ticket[1]; 
  let allCellsStriked = true;

  for (let i = 0; i < middleRow.length; i++) {
    if (middleRow[i] && !strikedNumbers.includes(middleRow[i])) {
      allCellsStriked = false;
      break;
    }
  }

  if (allCellsStriked) {
    const data = {
      claim: "middleRow",
      socketId: socket.id,
      joiningCode: joiningCode,
    };

    try {
      await axios.put(`${BASE_URL}/claim-validation`, data);
    } catch (e) {
      console.error("Error updating ticket:", e);
    }

    socket.emit("MiddleRowClaim");

    return "You Claimed Middle Row";
  } else {
    return "Middle Row can't be claimed now";
  }
};

const claimLastRow = async (socket, tickets, strikedNumbers, joiningCode) => {
  if (!tickets.ticket) {
    alert("ticket data is not available.");
    return;
  }

  const lastRow = tickets.ticket[tickets.ticket.length - 1];
  let allCellsStriked = true;

  for (let i = 0; i < lastRow.length; i++) {
    if (lastRow[i] && !strikedNumbers.includes(lastRow[i])) {
      allCellsStriked = false;
      break;
    }
  }

  if (allCellsStriked) {
    const data = {
      claim: "lastRow",
      socketId: socket.id,
      joiningCode: joiningCode,
    };

    try {
      await axios.put(`${BASE_URL}/claim-validation`, data);
    } catch (e) {
      console.error("Error updating ticket:", e);
    }

    socket.emit("LastRowClaim");

    return "You Claimed Last Row";
  } else {
    return "Last Row can't be claimed now";
  }
};

const claimFullHouse = async (socket, tickets, strikedNumbers, joiningCode) => {
  if (!tickets.ticket) {
    alert("ticket data is not available.");
    return;
  }

  const allNumbers = tickets.ticket.flat();
  let allNumbersStriked = true;

  for (let i = 0; i < allNumbers.length; i++) {
    if (allNumbers[i] && !strikedNumbers.includes(allNumbers[i])) {
      allNumbersStriked = false;
      break;
    }
  }

  if (allNumbersStriked) {
    const data = {
      claim: "fullHouse",
      socketId: socket.id,
      joiningCode: joiningCode,
    };

    try {
      await axios.put(`${BASE_URL}/claim-validation`, data);
    } catch (e) {
      console.error("Error updating ticket:", e);
    }

    socket.emit("fullHouseClaim");

    return "You Claimed Full House";
  } else {
    return "Full House can't be claimed now";
  }
};

const claimMiddle = async (socket, tickets, strikedNumbers, joiningCode) => {
  if (!tickets.ticket) {
    alert("ticket data is not available.");
    return;
  }

  const middleCell = tickets.ticket[Math.floor(tickets.ticket.length / 2)][Math.floor(tickets.ticket[0].length / 2)];

  if (strikedNumbers.includes(middleCell)) {
    const data = {
      claim: "middle",
      socketId: socket.id,
      joiningCode: joiningCode,
    };

    try {
      await axios.put(`${BASE_URL}/claim-validation`, data);
    } catch (e) {
      console.error("Error updating ticket:", e);
    }

    socket.emit("MiddleClaim");

    return "You Claimed Middle";
  } else {
    return "Middle can't be claimed now";
  }
};

const claimDiagonalCorners = async (socket, tickets, strikedNumbers, joiningCode) => {
  if (!tickets.ticket) {
    alert("ticket data is not available.");
    return;
  }

  const topLeftCorner = tickets.ticket[0][0];
  const topRightCorner = tickets.ticket[0][tickets.ticket[0].length - 1];
  const bottomLeftCorner = tickets.ticket[tickets.ticket.length - 1][0];
  const bottomRightCorner = tickets.ticket[tickets.ticket.length - 1][tickets.ticket[0].length - 1];

  const diagonalCornersClaimed =
  (strikedNumbers.includes(topLeftCorner) && strikedNumbers.includes(bottomRightCorner)) ||
  (strikedNumbers.includes(topRightCorner) && strikedNumbers.includes(bottomLeftCorner));

if (diagonalCornersClaimed) {
  const data = {
    claim: "diagonalCorners",
    socketId: socket.id,
    joiningCode: joiningCode,
  };

    try {
      await axios.put(`${BASE_URL}/claim-validation`, data);
    } catch (e) {
      console.error("Error updating ticket:", e);
    }

    socket.emit("DiagonalCornersClaim");

    return "You Claimed Diagonal Corners";
  } else {
    return "Diagonal Corners can't be claimed now";
  }
};

export { claimFastestFive, claimFirstRow, claimMiddleRow, claimLastRow, claimFullHouse, claimMiddle,claimDiagonalCorners };
