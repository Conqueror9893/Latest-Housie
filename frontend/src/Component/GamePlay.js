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
  const [userData, setUserData] = useState([]);
  const [fastfive, setFastFive] = useState(false);
  const [firstRow, setFirstRow] = useState(false);
  const [fullHouse, setFullHouse] = useState(false);
  const [winner, setWinner] = useState(null);

  const [hideValue, setHideValue] = useState(false);
  const [claimsMade, setClaimsMade] = useState(0);
  const [displayWinner, setDisplayWinner] = useState(false);
  const [paused, setPaused] = useState(true);
  const [joiningCode, setJoiningCode] = useState("");

  // Hide Passed value button from host
  useEffect(() => {
    socket.emit("getShoworHide");
    socket.on("showHideOrNot", (data) => {
      setHideValue(data);
    });
    return () => {
      socket.off("showHideOrNot");
    };
  }, [hideValue, socket]);

  // Delay in Display winner
  useEffect(() => {
    if (winner) {
      const timeoutId = setTimeout(() => {
        setDisplayWinner(true);
      }, 3000);

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
  
    if (!tickets || Object.keys(tickets).length === 0) {
      fetchRandomTickets();
    }
  }, [tickets]); 
  

  useEffect(() => {
    const handleUpdateTicket = async () => {
      if (tickets.id &&joiningCode) {
        try {
          const currentSocketId = socket.id;

          await axios.put(`${BASE_URL}/update-ticket`, {
            id: tickets.id,
            socketId: currentSocketId,
          });
        } catch (err) {
          console.error("Error updating ticket:", err);
        }
      }
    };

    const timer = setTimeout(() => {
      handleUpdateTicket();
    }, 500);

    return () => clearTimeout(timer);
  }, [tickets.id, socket.id,joiningCode]);

  
  
  

  // Winning logic and getting username and points
  useEffect(() => {
    

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
    // socket.emit("getPausedValue");
    // check weather paused or not
    socket.on("PausedOrNot", (pausedCheck) => {
      console.log(pausedCheck + " Paused");
      setPaused(pausedCheck);
    });



    // get random number
    socket.on("randomNumber", (randomNumber) => {
      setRandomNumber(randomNumber);
      setGeneratedNumbers((prevNumbers) => [...prevNumbers, randomNumber]);
    });

    socket.emit("getDisplayData");

    // joined user name and data is got after game starts
    socket.on("displayUsers", (userData) => {
      // setUsernames(userData);
    });

    // After emit Fastfive Claim we get the data from server.js
    socket.on("uniqueFastFive", () => {
      setFastFive(true);
      setClaimsMade((prevClaims) => prevClaims + 1); // Use an arrow function to correctly update the state
    });

    // After emit FirstRow Claim we get the data from server.js

    socket.on("uniqueFirstRow", () => {
      setFirstRow(true);
      setClaimsMade((prevClaims) => prevClaims + 1); // Use an arrow function to correctly update the state

    });

    // After emit FullHouse Claim we get the data from server.js
    socket.on("uniqueFullHouse", () => {
      setFullHouse(true);
      setClaimsMade((prevClaims) => prevClaims + 1); // Use an arrow function to correctly update the state

    });

    // after 90 number got created we are calling calculateWinner
    socket.on("GenerateWinLogic", () => {
      // calculateWinner();
      // after 90 num generation automatically winner will be declared even not fully calimed
      socket.emit("winner", winner);
    });

    socket.on("pointsUpdated", ({ name, point }) => {
      updatePoints(name, point);
    });
    socket.emit("userData2Host",userData)




    return () => {
      socket.off("randomNumber");
      socket.off("joinUserName");
      socket.off("uniqueFastFive");
      socket.off("uniqueFirstRow");
      socket.off("uniqueFullHouse");
      socket.off("pointsUpdated");
      socket.off("dataEntered");
      socket.off("JoinCode");
      socket.off("PausedOrNot")
      socket.off("getPausedValue")
      // if host disconnected we are calling handleHostDisconnected
      socket.off("hostDisconnected", handleHostDisconnected);
    };
    // eslint-disable-next-line
  }, [socket, points, claimsMade, winner]);

  if (!joiningCode) {
    socket.emit("dataEntered");
  }

  socket.on("JoinCode", (JoiningCode) => {
    setJoiningCode(JoiningCode);

    socket.off("JoinCode");
  });

  useEffect(() => {
    if (joiningCode) { 
      axios
        .get(`${BASE_URL}/claim-data/${joiningCode}`)
        .then((response) => {
          setUserData(response.data);
        })
        .catch((e) => {
          console.error('Error fetching claim data:', e);
        });
    }
  }, [fastfive, firstRow, fullHouse, joiningCode]);
  

  if (claimsMade === 3) {
    setClaimsMade(-1); 
    setTimeout(() => {
    socket.emit("winner", winner);
        axios
            .get(`${BASE_URL}/get-winner/${joiningCode}`)
            .then((response) => {
                setWinner(response.data.winner);
                console.log(response.data);
            })
            .catch((e) => {
                console.error('Error fetching claim data:', e);
            });
    }, 1500); 
}



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
  // const getUsernameBySocketId = (socketId) => {
  //   const user = usernames.find((user) => user.socketId === socketId);
  //   return user ? user.name : null;
  // };

  // Cell click check and pusing
  const handleCellClick = (rowIndex, cellIndex) => {
    const newTickets = { ...tickets };
    const cellNumber = newTickets.hostTicket[rowIndex][cellIndex];
    if (cellNumber !== null && cellNumber !== undefined) {
      if (!strikedNumbers.includes(cellNumber)) {
        if (generatedNumbers.includes(parseInt(cellNumber, 10))) {
          setStrikedNumbers((prevNumbers) => [...prevNumbers, cellNumber]);
        }
      }
    }
  };

  // Logic for fast five claim
  const claimFastestFive = async () => {
    if (!tickets.hostTicket) {
      alert("Host ticket data is not available.");
      return;
    }
    if (strikedNumbers.length >= 5) {
      // emit the current player clicked socket id

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
  const claimFirstRow = async () => {
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

      const data = {
        claim: "firstRow",
        socketId: socket.id,
        joiningCode: joiningCode,
      };

      try {
        await axios.put(`${BASE_URL}/claim-validation`, data);
        
      } catch (e) {
        console.log("Error" + e);
      }

      socket.emit("FirstRowClaim");

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
  const claimFullHouse = async () => {
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


      const data = {
        claim: "fullHouse",
        socketId: socket.id,
        joiningCode: joiningCode,
      };

      try {
        await axios.put(`${BASE_URL}/claim-validation`, data);
      
      } catch (e) {
        console.log("Error" + e);
      }

      socket.emit("fullHouseClaim");

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

      {userData && userData.length > 0 && (
  <div>
    <h2 className="mx-3">Claims:</h2>
    <div className="claims">
      {userData.map((user, index) => (
        <div key={index}>
          {user.claims.fastFive && (
            <p>
              <span>{user.name}</span> claimed Fastest Five! +5
            </p>
          )}
          {user.claims.firstRow && (
            <p>
              <span>{user.name}</span> claimed First Row! +10
            </p>
          )}
          {user.claims.fullHouse && (
            <p>
              <span>{user.name}</span> claimed Full House! +15
            </p>
          )}
        </div>
      ))}
    </div>
  </div>
)}


      <div className="container-play">
        {error && <div>Error: {error}</div>}
        <div className="d-flex gap-2 align-items-center justify-content-center">
          <button
            className="btn btn-secondary text-warning mt-4"
            onClick={claimFastestFive}
            disabled={fastfive}
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
            disabled={firstRow}
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
            disabled={fullHouse}
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
            {userData.map((user, index) => (
              <tr key={index}>
                {user.socketId === socket.id ? (
                  <td className="text-danger">{user.name} (You)</td>
                ) : (
                  <td>{user.name}</td>
                )}
                <td>{user.score} </td>
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
                  {userData.map((user) => (
                    <tr key={`${user.name}-${socket.id}`}>
                      <td>{user.name}</td>
                      <td>{user.score}</td>
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
