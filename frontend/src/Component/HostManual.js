import React, { useState, useEffect, useContext } from "react";
import "../styles/host.css";
import "../styles/gamePlay.css";

import axios from "axios";
import { GrContactInfo } from "react-icons/gr";
import Modal from "react-modal";
import { visualizeHost2PlayerTickets } from "../utils/VisualizeTicket";
import { UserContext } from "./UserContext";

const { FETCH_URL } = require("../constant");
Modal.setAppElement("#root");

const BASE_URL = FETCH_URL;

const HostManual = ({ socket }) => {
  // eslint-disable-next-line
  const [numbers, setNumbers] = useState(
    Array.from({ length: 90 }, (_, index) => index + 1)
  );
  const [latestNumber, setLatestNumber] = useState(null);
  const [struckNumbers, setStruckNumbers] = useState([]);
  const [intervalId, setIntervalId] = useState(null);

  const [winner, setWinner] = useState(null);
  const [userData, setUserData] = useState([]);
  const [joiningCode, setJoiningCode] = useState("");

  const [ticketData, setTicketData] = useState({});

  const [selectedUser, setSelectedUser] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const { strikedNumbers, disabledNumbers } = useContext(UserContext);
  const [isWinnerDeclared, setIsWinnerDeclared] = useState(false);

  const [bingoState, setBingoState] = useState({
    fastfive: false,
    firstRow: false,
    fullHouse: false,
    middleRow: false,
    lastRow: false,
    diagonalCorner:false,
    middle:false
  });

    // Divide the numbers into groups of 10 for each row
  const rows = [];
  for (let i = 0; i < numbers.length; i += 10) {
    rows.push(numbers.slice(i, i + 10));
  }

  // Confirm Exit When Reload 
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";

      // Emit an event when the user leaves the page
      socket.emit("hostExited");

      const confirmationMessage = "Are you sure you want to leave?";
      e.returnValue = confirmationMessage;
      return confirmationMessage;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [socket]); 

  // Fetch Ticket Based on the user selected
  useEffect(() => {
    const fetchTicketData = async () => {
      if (!showModal || !selectedUser) return;

      try {
        const response = await axios.get(
          `${BASE_URL}/get-tickets/${selectedUser.ticket_id}`
        );
        console.log(response.data);
        setTicketData(response.data);
      } catch (error) {
        console.error("Error fetching ticket data:", error);
      }
    };

    fetchTicketData();
  }, [showModal, selectedUser]);

  // If claim happened and on load fetching Data from server
  useEffect(() => {
    if (joiningCode) {
      setTimeout(() => {
        axios
          .get(`${BASE_URL}/claim-data/${joiningCode}`)
          .then((response) => {
            setUserData(response.data);
            console.log(response.data);
          })
          .catch((e) => {
            console.error("Error fetching claim data:", e);
          });
      }, 400);
    }
  }, [joiningCode, bingoState]);

  // socket for sending selected random number
  useEffect(() => {
    // listening randomNumber from Server.js and storing locally
    socket.on("randomNumber", (randomNumber) => {
      setLatestNumber(randomNumber);
      setStruckNumbers((prevStruckNumbers) => [
        ...prevStruckNumbers,
        randomNumber,
      ]);
    });
    socket.on("uniqueFastFive", () => {
      console.log("fast Five");
      setBingoState((prevState) => ({
        ...prevState,
        fastfive: true,
      }));
    });

    socket.on("uniqueFirstRow", () => {
      setBingoState((prevState) => ({
        ...prevState,
        firstRow: true,
      }));
    });

    socket.on("uniqueFullHouse", () => {
      setBingoState((prevState) => ({
        ...prevState,
        fullHouse: true,
      }));
    });

    socket.on("uniqueMiddleRow", () => {
      setBingoState((prevState) => ({
        ...prevState,
        middleRow: true,
      }));
    });

    socket.on("uniqueLastRow", () => {
      setBingoState((prevState) => ({
        ...prevState,
        lastRow: true,
      }));
    });
    socket.on("uniqueDiagonalCornersClaim", () => {
      setBingoState((prevState) => ({
        ...prevState,
        diagonalCorner: true,
      }));
    });
    socket.on("uniqueMiddleClaim", () => {
      setBingoState((prevState) => ({
        ...prevState,
        middle: true,
      }));
    });

    // after winner is declared from Gameplay that is listening from server.js
    socket.on("DecalreWinner", (winner) => {
      setWinner(winner);
    });

    return () => {
      clearInterval(intervalId);
      socket.off("randomNumber");
      socket.off("DecalreWinner");
      socket.off("uniqueFastFive");
      socket.off("uniqueFirstRow");
      socket.off("uniqueFullHouse");
      socket.off("uniqueMiddleRow");
      socket.off("uniqueLastRow");
      socket.off("uniqueDiagonalCornersClaim");
      socket.off("uniqueMiddleClaim");

    };
  }, [intervalId, socket]);

  // When Host AFK Auto number generation
  useEffect(() => {
    // after 10s we are calling
    const handleGenerateRandomNumber = () => {
      const id = setInterval(() => {
        // for every 3 second we are asking for randomNumber
        socket.emit("getRandomNumber");
      }, 3000);
      setIntervalId(id);
    };

    if (!winner) {
      // after 10 second of idle we are calling the handleGenerateRandomNumber
      const timerId = setTimeout(() => {
        handleGenerateRandomNumber();
      }, 10 * 1000);

      return () => {
        clearTimeout(timerId);
        clearInterval(intervalId);
      };
    }
  }, [latestNumber, socket, intervalId, winner]);

  // Checking if 5 claims was made enable the decalre winner button
  useEffect(() => {
    const { fastfive, firstRow, fullHouse, middleRow, lastRow, middle } = bingoState;
    const anyFiveTrue = (fastfive && firstRow && middleRow && lastRow && middle) ||
      (firstRow && middleRow && lastRow && middle && fullHouse) ||
      (fastfive && firstRow && middleRow && lastRow && fullHouse);
    setIsWinnerDeclared(anyFiveTrue);
  }, [bingoState]);
  

  // Modal Open
  const handleContactInfoClick = (user) => {
    setSelectedUser(user);
    setShowModal((prevState) => !prevState);
  };
  // On load joiningCode will not available at that time calling one time
  if (!joiningCode) {
    socket.emit("dataEntered");
  }

  socket.on("JoinCode", (JoiningCode) => {
    setJoiningCode(JoiningCode);
    socket.off("JoinCode");
  });

  // for everyclick of the cell we are striking
  const handleClick = (randomNumber) => {
    if (struckNumbers.includes(randomNumber)) {
      return;
    }
    setLatestNumber(randomNumber);
    setStruckNumbers([...struckNumbers, randomNumber]);

    // the striked randomnumber was send to server.js
    socket.emit("manualRandom", randomNumber);
  };
  
  // Decalre winner when 5 calims made
  const declareWinner = () => {
    socket.emit("decalreWinnerByHost");
  };

  return (
    <>

      {strikedNumbers}

      {/* table mapping  */}
      <div className="host-container">
        <p>{latestNumber}</p>
        <div className="host-table">
          <table className="host__table">
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  {row.map((number) => (
                    <td
                      key={number}
                      className={`cell-data ${
                        struckNumbers.includes(number) ? "strikethrough" : ""
                      }`}
                      onClick={() => handleClick(number)}
                    >
                      {number}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Info Stats */}
      <div className="users-list">
        <h2>Live Users:</h2>
        <ul className="live-users">
          {userData.map((user, index) => (
            <li key={index}>
              {user.name}{" "}
              <GrContactInfo
                className="fs-3"
                onClick={() => handleContactInfoClick(user)}
              />
            </li>
          ))}
          {showModal && selectedUser && (
            <>
              <Modal
                isOpen={showModal}
                onRequestClose={() => setShowModal(false)}
                className="custom-modal-host"
                overlayClassName="custom-overlay"
              >
                <div className="d-flex justify-content-evenly">
                  <h2 className="text-center ">
                    <span className="text-success text-center">
                      {selectedUser.name}'s
                    </span>{" "}
                    Stats
                  </h2>
                  <p>
                    Score:{" "}
                    <span className="bg-success text-white p-1 rounded-4">
                      {selectedUser.score}
                    </span>
                  </p>
                </div>
                <div>
                  {visualizeHost2PlayerTickets(
                    ticketData,
                    strikedNumbers,
                    disabledNumbers
                  )}
                  <ul className="claims-list">
                    <p className="fs-5">Claims:</p>
                    {selectedUser.claims &&
                      Object.entries(selectedUser.claims).map(
                        ([claim, value]) => {
                          let claimName = claim;
                          if (claim.length > 2) {
                            claimName = claim.replace(/([A-Z])/g, " $1").trim();
                            claimName = claimName
                              .split(" ")
                              .map((word) => word.charAt(0).toUpperCase())
                              .join("");
                          }
                          return (
                            value && (
                              <li
                                className="mx-3 claim-name"
                                key={claim}
                                title={claimName}
                                data-fullname={claim}
                              >
                                {claimName}
                              </li>
                            )
                          );
                        }
                      )}
                  </ul>
                </div>
              </Modal>
            </>
          )}
        </ul>

        {winner && <h2 className="text-danger">{winner} Won the Match</h2>}
        {isWinnerDeclared && (
          <button className="btn btn-warning" onClick={declareWinner}>
            Declare Winner
          </button>
        )}
      </div>
    </>
  );
};

export default HostManual;
