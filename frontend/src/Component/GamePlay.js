import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/gamePlay.css";
import { Link, useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import ConfettiExplosion from "react-confetti-explosion";

import img1 from "../assets/images/logo_new.png";
import { IoMdClose } from "react-icons/io";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ExitModal from "./ExitModal";

const { FETCH_URL } = require("../constant");

const BASE_URL = FETCH_URL;

const GamePlay = ({ socket }) => {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState({});
  const [error, setError] = useState(null);
  const [generatedNumbers, setGeneratedNumbers] = useState([]);
  const [randomNumber, setRandomNumber] = useState(null);
  const [showNumberDropDown, setShowNumberDropDown] = useState(false);
  const [strikedNumbers, setStrikedNumbers] = useState([]);
  const [points, setPoints] = useState({});
  const [usernames, setUsernames] = useState([]);
  const [fastfive, setFastFive] = useState(null);
  const [firstRow, setFirstRow] = useState(null);
  const [fullHouse, setFullHouse] = useState(null);
  const [winner, setWinner] = useState(null);

  const [hideValue, setHideValue] = useState(false);
  const [claimsMade, setClaimsMade] = useState(0);
  const [displayWinner, setDisplayWinner] = useState(false);
  const [paused, setPaused] = useState(false);

  // Hide Passed value button from host
  useEffect(() => {
    socket.emit("getShoworHide");
    socket.on("showHideOrNot", (data) => {
      setHideValue(data);
      console.log(data + "!@#");
    });
    console.log(hideValue + "New DATA");
    return () => {
      socket.off("showHideOrNot");
    };
  }, [hideValue, socket]);

  // Delay in Display winner
  useEffect(() => {
    if (winner) {
      const timeoutId = setTimeout(() => {
        setDisplayWinner(true);
      }, 1500);

      return () => clearTimeout(timeoutId);
    }
  }, [winner]);

  // Confirm leaving
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";

      const confirmationMessage = "Are you sure you want to leave?";
      e.returnValue = confirmationMessage;
      return confirmationMessage;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // fetch ticket from DB
  useEffect(() => {
    const fetchRandomTickets = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/get-tickets`);
        setTickets(response.data);
      } catch (e) {
        setError("Failed to fetch random tickets");
        console.error("Error fetching random tickets:", e);
      }
    };

    fetchRandomTickets();
  }, []);

  // Winning logic and getting username and points
  useEffect(() => {
    const calculateWinner = () => {
      let maxPoints = -1;
      let winner = null;

      // Iterate over points to find the user with the highest points
      for (const name in points) {
        if (points.hasOwnProperty(name)) {
          if (points[name] > maxPoints) {
            maxPoints = points[name];
            winner = name;
            socket.emit("winner", winner);
          }
        }
      }
      // after calculating points we are stting the winner
      setWinner(winner);
    };

    // if host disconnected we redirecting
    const handleHostDisconnected = () => {
      toast.info("Host has disconnected. Redirecting to home page...");
      setTimeout(() => {
        navigate("/");
      }, 5000);
    };

    // if host disconnected we are calling handleHostDisconnected comes from auto and manual Host page
    socket.on("hostDisconnected", handleHostDisconnected);

    // get paused or not value
    socket.emit("getPausedValue");
    // check weather paused or not
    socket.on("PausedOrNot", (value) => {
      setPaused(value);
    });

    // get random number
    socket.on("randomNumber", (randomNumber) => {
      setRandomNumber(randomNumber);
      setGeneratedNumbers((prevNumbers) => [...prevNumbers, randomNumber]);
    });

    
    socket.emit("getDisplayData");

    // joined user name and data is got after game starts
    socket.on("displayUsers", (userData) => {
      setUsernames(userData);
    });

    // After emit Fastfive Claim we get the data from server.js
    socket.on("uniqueFastFive", ({ userData, allUsernames }) => {
      const user = allUsernames.find((user) => user.socketId === userData);
      if (user) {
        const { name } = user;

        // sending name alone to server.js then to host
        socket.emit("fastFiveName2Host", name);
        setFastFive(name);
        updatePoints(name, 5);
      } else {
        console.error("User not found for socketId:", userData);
      }
      setClaimsMade((prevClaims) => prevClaims + 1);
    });

    // After emit FirstRow Claim we get the data from server.js

    socket.on("uniqueFirstRow", ({ userData, allUsernames }) => {
      const user = allUsernames.find((user) => user.socketId === userData);
      if (user) {
        const { name } = user;
        setFirstRow(name);

        // sending name alone to server.js then to host
        socket.emit("firstRowName2Host", name);

        updatePoints(name, 10);
      } else {
        console.error("User not found for socketId:", userData);
      }
      setClaimsMade((prevClaims) => prevClaims + 1);
    });

    // After emit FullHouse Claim we get the data from server.js
    socket.on("uniqueFullHouse", ({ userData, allUsernames }) => {
      const user = allUsernames.find((user) => user.socketId === userData);
      if (user) {
        const { name } = user;
        setFullHouse(name);

        // sending name alone to server.js then to host
        socket.emit("fullHouseName2Host", name);
        updatePoints(name, 20);
      } else {
        console.error("User not found for socketId:", userData);
      }
      setClaimsMade((prevClaims) => prevClaims + 1);
    });

    // after 90 number got created we are calling calculateWinner
    socket.on("GenerateWinLogic", () => {
      calculateWinner();
      // after 90 num generation automatically winner will be declared even not fully calimed
      socket.emit("winner", winner);
    });

    socket.on("pointsUpdated", ({ name, point }) => {
      updatePoints(name, point);
    });

    if (claimsMade === 3) {
      calculateWinner();
      // if 3 claims made we are sending winner to server.js
      socket.emit("winner", winner);
      setClaimsMade(-1);
    }

    return () => {
      socket.off("randomNumber");
      socket.off("joinUserName");
      socket.off("uniqueFastFive");
      socket.off("uniqueFirstRow");
      socket.off("uniqueFullHouse");
      socket.off("pointsUpdated");
      // if host disconnected we are calling handleHostDisconnected
      socket.off("hostDisconnected", handleHostDisconnected);
    };
    // eslint-disable-next-line
  }, [socket, usernames, points, claimsMade, winner]);

  // Fnc for Points updation
  const updatePoints = (name, increment) => {
    const updatedPoints = {
      ...points,
      [name]: (points[name] || 0) + increment,
    };
    setPoints(updatedPoints);
    // Emit updated points to server
  };
  // finiding user name by socket>id and mapping
  const getUsernameBySocketId = (socketId) => {
    const user = usernames.find((user) => user.socketId === socketId);
    return user ? user.name : null;
  };

  // Cell click check and pusing
  const handleCellClick = (rowIndex, cellIndex) => {
    const newTickets = { ...tickets };
    const cellNumber = newTickets.hostTicket[rowIndex][cellIndex];
    if (cellNumber !== null && cellNumber !== undefined) {
      if (!strikedNumbers.includes(cellNumber)) {
        if (generatedNumbers.includes(parseInt(cellNumber, 10))) {
          setStrikedNumbers((prevNumbers) => [...prevNumbers, cellNumber]);
          const currentUser = getUsernameBySocketId(socket.id);
          if (currentUser) {
            // socket.emit("updatePoints", { name: currentUser, point: 1 });
          } else {
            console.error("User not found for socketId:", socket.id);
          }
        }
      }
    }
  };

  // Logic for fast five claim
  const claimFastestFive = () => {
    if (!tickets.hostTicket) {
      alert("Host ticket data is not available.");
      return;
    }
    if (strikedNumbers.length >= 5) {
    // emit the current player clicked socket id
      socket.emit("FastFiveClaim", socket.id);
      toast.success("You Claimed Fast Five", {
        position: "bottom-center",
        autoClose: 5000,
        closeOnClick: true,
        draggable: true,
      });
    } else {
      toast.error("Fast Five can't be claimed Now", {
        position: "bottom-center",
        autoClose: 5000,
        closeOnClick: true,
        draggable: true,
      });
    }
  };

  // Logic for First row
  const claimFirstRow = () => {
    if (!tickets.hostTicket) {
      alert("Host ticket data is not available.");
      return;
    }

    const firstRow = tickets.hostTicket[0];
    let allCellsStriked = true;

    for (let i = 0; i < firstRow.length; i++) {
      if (firstRow[i] && !strikedNumbers.includes(firstRow[i])) {
        allCellsStriked = false;
        break;
      }
    }

    if (allCellsStriked) {

    // emit the current player clicked socket id
      socket.emit("FirstRowClaim", socket.id);
      toast.success("You Claimed First Row", {
        position: "bottom-center",
        autoClose: 5000,
        closeOnClick: true,
        draggable: true,
      });
    } else {
      toast.error("First Row can't be claimed Now", {
        position: "bottom-center",
        autoClose: 5000,
        closeOnClick: true,
        draggable: true,
      });
    }
  };

  // Logic for Full house
  const claimFullHouse = () => {
    if (!tickets.hostTicket) {
      alert("Host ticket data is not available.");
      return;
    }

    const allNumbers = tickets.hostTicket.flat();
    let allNumbersStriked = true;

    for (let i = 0; i < allNumbers.length; i++) {
      if (allNumbers[i] && !strikedNumbers.includes(allNumbers[i])) {
        allNumbersStriked = false;
        break;
      }
    }

    if (allNumbersStriked) {

    // emit the current player clicked socket id
      socket.emit("fullHouseClaim", socket.id);
      toast.success("You Claimed Full House", {
        position: "bottom-center",
        autoClose: 5000,
        closeOnClick: true,
        draggable: true,
      });
    } else {
      toast.error("Full House can't be claimed Now", {
        position: "bottom-center",
        autoClose: 5000,
        closeOnClick: true,
        draggable: true,
      });
    }
  };

  // Displaying tickets fnc
  const visualizeTickets = () => {
    if (tickets.hostTicket || tickets.guestTicket) {
      const ticketData = tickets.hostTicket || tickets.guestTicket;
      return (
        <div className="center-play">
          <div className="table">
            <table>
              <tbody>
                {ticketData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={`cell-data ${
                          strikedNumbers.includes(cell) ? "strikethrough" : ""
                        }`}
                        onClick={() => handleCellClick(rowIndex, cellIndex)}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="image__container d-flex justify-content-evenly">
        <img src={img1} className="logo" alt="Hosuie Housie" />
        <div className="host-container">
          <p className="text-center fs-4">{randomNumber}</p>
        </div>
      </div>

      {claimsMade !== 0 && (
        <div>
          <h2 className="mx-3">Claims:</h2>
          <div className="claims">
            {fastfive && (
              <p key={`${socket.id}-fastfive`}>
                <span>{fastfive}</span> claimed Fastest Five! +5
              </p>
            )}
            {firstRow && (
              <p key={`${socket.id}-firstRow`}>
                <span>{firstRow}</span> claimed First Row! +10
              </p>
            )}
            {fullHouse && (
              <p key={`${socket.id}-fullHouse`}>
                <span>{fullHouse}</span> claimed Full House! +15
              </p>
            )}
          </div>
        </div>
      )}

      <div className="container-play">
        {error && <div>Error: {error}</div>}
        <div className="d-flex gap-2 align-items-center justify-content-center">
          <button
            className="btn btn-secondary text-warning mt-4"
            onClick={claimFastestFive}
            disabled={fastfive !== null}
          >
            {fastfive && (
              <ConfettiExplosion
                width={window.innerWidth}
                height={window.innerHeight}
              />
            )}
            Claim for Fastest Five
          </button>
          <button
            disabled={firstRow !== null}
            className="btn btn-secondary text-warning mt-4"
            onClick={claimFirstRow}
          >
            {firstRow && (
              <ConfettiExplosion
                width={window.innerWidth}
                height={window.innerHeight}
              />
            )}
            Claim for First Row
          </button>
          <button
            disabled={fullHouse !== null}
            className="btn btn-secondary text-warning mt-4"
            onClick={claimFullHouse}
          >
            {fullHouse && (
              <ConfettiExplosion
                width={window.innerWidth}
                height={window.innerHeight}
              />
            )}
            Claim for Full House
          </button>
          <ExitModal />
        </div>

        <div className="center-play">{visualizeTickets()}</div>

        <div className="text-center">
          {hideValue && (
            <button
              className="btn btn-secondary text-center mb-3"
              onClick={() => setShowNumberDropDown((prev) => !prev)}
            >
              Show Passed Numbers
            </button>
          )}

          {showNumberDropDown && (
            <p className="text-center pb-4"> {generatedNumbers.join(", ")}</p>
          )}
        </div>

        {!paused ? (
          <div className="game-paused-popup">
            <p>Game Paused</p>
          </div>
        ) : (
          ""
        )}
      </div>

      <div className="points__table">
        <h2>Stats:</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {usernames.map((user, index) => (
              <tr key={index}>
                {user.socketId === socket.id ? (
                  <td className="text-danger">{user.name} (You)</td>
                ) : (
                  <td>{user.name}</td>
                )}
                <td>{points[user.name] || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {winner && displayWinner && (
        <div className="fullscreen-overlay">
          <h1 className="greet">Thanks for playing!</h1>
          <div className="d-flex justify-content-end close-win">
            <Link to="/" className="btn btn-danger mt-5 text-center">
              <IoMdClose />
              Exit
            </Link>
          </div>

          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            numberOfPieces={600}
            opacity={0.8}
          />
          <div className="contentt">
            <div className="table">
              <table className="my-5">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {usernames.map((user) => (
                    <tr key={`${user.name}-${user.socketId}`}>
                      <td>{user.name}</td>
                      <td>{points[user.name] || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h1 className="text-white my-3">
                Winner: <span className="text-warning">{winner}</span>
              </h1>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </>
  );
};

export default GamePlay;
