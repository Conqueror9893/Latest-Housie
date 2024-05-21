import React, { useState, useEffect, useContext } from "react";
import "../styles/host.css";
import Options from "./Options";
import { UserContext } from "./UserContext";
import axios from "axios";
import { GrContactInfo } from "react-icons/gr";
import Modal from "react-modal";
import { visualizeHost2PlayerTickets } from "../utils/VisualizeTicket";
import { IoMdClose } from "react-icons/io";


const { FETCH_URL } = require("../constant");
Modal.setAppElement("#root");

const BASE_URL = FETCH_URL;

const Host = ({ socket }) => {
  const [numbers] = useState(
    Array.from({ length: 90 }, (_, index) => index + 1)
  );
  const [latestNumber, setLatestNumber] = useState(null);
  const [intervalId, setIntervalId] = useState(null);
  const [struckNumbers, setStruckNumbers] = useState([]);
  const { paused, setPaused } = useContext(UserContext);

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

  // Confirm reload or exit
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";

      // Emit an event when the user leaves the page to serevr.js
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

  // Fetch based on user selected
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

  // Get User Data when claim happened and onLoad
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

  // geting random num from server and saving
  useEffect(() => {
    // listening randomNumber from Server.js and storing locally
    socket.on("randomNumber", (randomNumber) => {
      if (!paused) {
        setLatestNumber(randomNumber);
        setStruckNumbers((prevStruckNumbers) => [
          ...prevStruckNumbers,
          randomNumber,
        ]);
      }
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

    socket.on("DecalreWinner", (data) => {
      setWinner(data);
    });

    return () => {
      clearInterval(intervalId);
      socket.off("displayUsers");

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
  }, [intervalId, paused, socket]);

  // after winner is declared we are clearing the timer
  useEffect(() => {
    if (winner) {
      clearInterval(intervalId);
    }
  }, [intervalId, winner]);

  // Checking if 5 claims was made enable the decalre winner button
  useEffect(() => {
    const { fastfive, firstRow, fullHouse, middleRow, lastRow, middle } = bingoState;
    const anyFiveTrue = (fastfive && firstRow && middleRow && lastRow && middle) ||
      (firstRow && middleRow && lastRow && middle && fullHouse) ||
      (fastfive && firstRow && middleRow && lastRow && fullHouse);
    setIsWinnerDeclared(anyFiveTrue);
  }, [bingoState]);
  

  // with 4 s interval calling emiting the getRandomNum
  const handleGenerateRandomNumber = () => {
    if (!paused && intervalId === null && winner === null) {
      const id = setInterval(() => {
        socket.emit("getRandomNumber");
      }, 4000);
      setIntervalId(id);
    }
  };

  // Pause Logic
  const handlePauseResume = () => {
    setPaused((prevPaused) => !prevPaused);
    socket.emit("setPaused", paused);
    console.log(paused);

    if (!paused && intervalId === null) {
      console.log("started");
      const id = setInterval(() => {
        socket.emit("getRandomNumber");
      }, 3000);
      setIntervalId(id);
    } else {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    socket.emit(paused ? "resume" : "pause", !paused);
  };

  const handleContactInfoClick = (user) => {
    setSelectedUser(user);
    setShowModal((prevState) => !prevState);
  };

  if (!joiningCode) {
    socket.emit("dataEntered");
  }

  socket.on("JoinCode", (JoiningCode) => {
    setJoiningCode(JoiningCode);

    socket.off("JoinCode");
  });
  
  // decalre winner by host when minimum 5 claims was made
  const declareWinner = () => {
    socket.emit("decalreWinnerByHost");
  };

  return (
    <>
    {/* Right side start Buttons  */}
      <div className="option-container">
        <button
          className="btn btn-primary"
          onClick={handleGenerateRandomNumber}
        >
          Generate Random Number
        </button>
        {winner && (
          <h2 className=" my-5 auto-host-claim text-light text-bg-success p-2">
            {winner} Won the Match
          </h2>
        )}
      </div>

      {/* Settings icon */}
      <Options
        handlePauseResume={handlePauseResume}
        paused={paused}
        handleGenerateRandomNumber={handleGenerateRandomNumber}
      />

        {/*1-90 cell Display  */}
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

      {/* User Stats Modal */}
      <div className="users-list bg-body-secondary p-5 rounded-4 shadow-sm">
        <h2>Joined Players:</h2>
        <ol className="live-users ">
          {userData.map((user, index) => (
            <div key={index} className="user">
              <li className="name fs-5">{user.name}</li>
              <GrContactInfo
                className="fs-3 contact-info-icon mx-2 mb-2"
                onClick={() => handleContactInfoClick(user)}
              />
            </div>
          ))}
            {showModal && selectedUser && (
              <>
                <Modal
                  isOpen={showModal}
                  onRequestClose={() => setShowModal(false)}
                  className="custom-modal-host"
                  overlayClassName="custom-overlay"
                >
                  <IoMdClose onClick={() => setShowModal(false)} className="fs-2 text-danger text-end "/> 

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
                              claimName = claim
                                .replace(/([A-Z])/g, " $1")
                                .trim();
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
          </ol>

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

export default Host;
