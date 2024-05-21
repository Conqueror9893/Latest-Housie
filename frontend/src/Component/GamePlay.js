import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import { toast, ToastContainer } from "react-toastify";
import { IoMdClose } from "react-icons/io";
import axios from "axios";
import "../styles/gamePlay.css";
import "react-toastify/dist/ReactToastify.css";
import Confetti from "react-confetti";
import BackgroundMusic from "./BackgroundMusic";
import img1 from "../assets/images/logo_new.png";
import ExitModal from "./ExitModal";
import backgroundMusic from "../assets/audio/BgMusic.mp3";
import ClaimButtons from "./ClaimButtons";

import {
  claimFastestFive,
  claimFirstRow,
  claimMiddleRow,
  claimLastRow,
  claimFullHouse,
  claimMiddle,
  claimDiagonalCorners,
} from "../utils/ClaimLogic.js";

import { visualizeTickets } from "../utils/VisualizeTicket";

const { FETCH_URL } = require("../constant");

const BASE_URL = FETCH_URL;

const GamePlay = ({ socket }) => {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState({});
  const [error, setError] = useState(null);
  const [generatedNumbers, setGeneratedNumbers] = useState([]);
  const [randomNumber, setRandomNumber] = useState(null);
  const [showNumberDropDown, setShowNumberDropDown] = useState(false);
  const [userData, setUserData] = useState([]);
  const [fastfive, setFastFive] = useState(false);
  const [firstRow, setFirstRow] = useState(false);
  const [fullHouse, setFullHouse] = useState(false);
  const [middleRow, setMiddleRow] = useState(false);
  const [lastRow, setLastRow] = useState(false);
  const [middleCell, setMiddleCell] = useState(false);
  const [diagonalCorners, setDiagonalCorners] = useState(false);

  const { strikedNumbers, setStrikedNumbers } = useContext(UserContext);
  const { disabledNumbers, setDisabledNumbers } = useContext(UserContext);

  const [hideValue, setHideValue] = useState(false);
  const [claimsMade, setClaimsMade] = useState(0);
  const [displayWinner, setDisplayWinner] = useState(false);
  const [paused, setPaused] = useState(true);
  const [joiningCode, setJoiningCode] = useState("");

  const [clickCounts, setClickCounts] = useState({});
  const [misClickCounts, setMisClickCounts] = useState({});

  const [gameData, setGameData] = useState({
    winner: null,
    topPlayers: [],
  });

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
    if (gameData.winner) {
      const timeoutId = setTimeout(() => {
        setDisplayWinner(true);
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [gameData.winner]);

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
      if (tickets.id && joiningCode) {
        try {
          const currentSocketId = socket.id;

          await axios.put(`${BASE_URL}/update-ticket`, {
            id: tickets.id,
            joiningCode: joiningCode,
            socketId: currentSocketId,
          });
        } catch (err) {
          console.error("Error updating ticket:", err);
        }
      }
    };

    handleUpdateTicket();
  }, [tickets.id, socket.id, joiningCode]);

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


    // After emit Fastfive Claim we get the data from server.js
    socket.on("uniqueFastFive", () => {
      setFastFive(true);
      setClaimsMade((prevClaims) => prevClaims + 1);
    });

    // After emit FirstRow Claim we get the data from server.js

    socket.on("uniqueFirstRow", () => {
      setFirstRow(true);
      setClaimsMade((prevClaims) => prevClaims + 1);
    });

    // After emit FullHouse Claim we get the data from server.js
    socket.on("uniqueFullHouse", () => {
      setFullHouse(true);
      setClaimsMade((prevClaims) => prevClaims + 1);
    });

    //
    socket.on("uniqueMiddleRow", () => {
      setMiddleRow(true);
      setClaimsMade((prevClaims) => prevClaims + 1);
    });
    socket.on("uniqueLastRow", () => {
      setLastRow(true);
      setClaimsMade((prevClaims) => prevClaims + 1);
    });
    socket.on("uniqueMiddleClaim", () => {
      setMiddleCell(true);
      setClaimsMade((prevClaims) => prevClaims + 1);
    });
    socket.on("uniqueDiagonalCornersClaim", () => {
      setDiagonalCorners(true);
      setClaimsMade((prevClaims) => prevClaims + 1);
    });
    socket.on("decalreWinnerByHostToPlayer", () => {
      setClaimsMade(7);
    });

    // after 90 number got created we are calling calculateWinner
    socket.on("GenerateWinLogic", () => {
      // after 90 num generation automatically winner will be declared even not fully calimed
      socket.emit("winner", gameData.winner);
    });


    return () => {
      socket.off("randomNumber");
      socket.off("uniqueFastFive");
      socket.off("uniqueFirstRow");
      socket.off("uniqueFullHouse");
      socket.off("uniqueMiddleRow");
      socket.off("uniqueLastRow");
      socket.off("uniqueMiddleClaim");
      socket.off("uniqueDiagonalCornersClaim");
      socket.off("decalreWinnerByHostToPlayer");
      socket.off("PausedOrNot");
      socket.off("getPausedValue");
      // if host disconnected we are calling handleHostDisconnected
      socket.off("hostDisconnected", handleHostDisconnected);
    };
    // eslint-disable-next-line
  }, [socket, claimsMade]);

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
          console.error("Error fetching claim data:", e);
        });
    }
  }, [
    fastfive,
    firstRow,
    fullHouse,
    joiningCode,
    middleCell,
    middleRow,
    lastRow,
    diagonalCorners,
  ]);

  useEffect(() => {
    if (claimsMade === 7) {
      // Emit winner event and fetch winner data
      setTimeout(() => {
        axios
          .get(`${BASE_URL}/get-winner/${joiningCode}`)
          .then((response) => {
            const winnerName = response.data.winner;
            const top3Scores = response.data.top3Scores;
            setGameData({
              ...gameData,
              winner: winnerName,
              topPlayers: top3Scores,
            });
            // Reset claimsMade
            setClaimsMade(0);
            socket.emit("winner", gameData.winner);
          })
          .catch((e) => {
            console.error("Error fetching claim data:", e);
          });
      }, 700);
    }
  }, [claimsMade, joiningCode, socket, gameData]);

  // Cell click check and pusing
  const handleCellClick = (rowIndex, cellIndex) => {
    const newTickets = { ...tickets };
    const cellNumber = newTickets.ticket[rowIndex][cellIndex];

    if (cellNumber !== null && cellNumber !== undefined) {
      if (
        !strikedNumbers.includes(cellNumber) &&
        !disabledNumbers.includes(cellNumber)
      ) {
        const updatedClickCounts = { ...clickCounts };
        updatedClickCounts[cellNumber] =
          (updatedClickCounts[cellNumber] || 0) + 1;
        setClickCounts(updatedClickCounts);

        if (
          cellNumber !== "" &&
          !generatedNumbers.includes(parseInt(cellNumber, 10))
        ) {
          const updatedMisClickCounts = { ...misClickCounts };
          updatedMisClickCounts[cellNumber] =
            (updatedMisClickCounts[cellNumber] || 0) + 1;
          setMisClickCounts(updatedMisClickCounts);

          if (updatedMisClickCounts[cellNumber] === 1) {
            toast.info("Strike Only the number that is Visible in blue box");
          } else if (updatedMisClickCounts[cellNumber] === 2) {
            if (disabledNumbers.length === 1) {
              toast.error("If you do again. You will be kicked out!");
            } else {
              toast.warn("Number Will be Disable on Next Mis-Click");
            }
          } else if (updatedMisClickCounts[cellNumber] === 3) {
            if (disabledNumbers.length === 0) {
              toast.error(`${cellNumber} will be disabled For 15 Seconds`);
              setTimeout(() => {
                toast.success(`${cellNumber} Enabled Again`);
                setDisabledNumbers([]);
              }, 15000);
            }
            setDisabledNumbers((prevDisabledNumbers) => [
              ...prevDisabledNumbers,
              cellNumber,
            ]);

            // Redirect to home page if there are two disabled numbers
            if (disabledNumbers.length + 1 === 2) {
              setTimeout(() => {
                toast.error("Exiting the game...");
              }, 2000);

              // Navigate to home page after 5 seconds
              setTimeout(() => {
                navigate("/");
              }, 4000);
            }
          }
        } else {
          if (cellNumber !== "") {
            if (!strikedNumbers.includes(cellNumber)) {
              setStrikedNumbers((prevNumbers) => [...prevNumbers, cellNumber]);
            }
          }
        }
      }
    }
  };
  const handleClaimFastestFive = async () => {
    const message = await claimFastestFive(
      socket,
      tickets,
      strikedNumbers,
      joiningCode
    );
    if (message.includes("can't")) {
      toast.error(message, {
        position: "bottom-center",
        autoClose: 5000,
        closeOnClick: true,
        draggable: true,
      });
    } else {
      toast.success(message, {
        position: "bottom-center",
        autoClose: 5000,
        closeOnClick: true,
        draggable: true,
      });
    }
  };

  const handleClaimFirstRow = async () => {
    const message = await claimFirstRow(
      socket,
      tickets,
      strikedNumbers,
      joiningCode
    );
    if (message.includes("can't")) {
      toast.error(message, {
        position: "bottom-center",
        autoClose: 5000,
        closeOnClick: true,
        draggable: true,
      });
    } else {
      toast.success(message, {
        position: "bottom-center",
        autoClose: 5000,
        closeOnClick: true,
        draggable: true,
      });
    }
  };

  const handleClaimFullHouse = async () => {
    const message = await claimFullHouse(
      socket,
      tickets,
      strikedNumbers,
      joiningCode
    );
    if (message.includes("can't")) {
      toast.error(message, {
        position: "bottom-center",
        autoClose: 5000,
        closeOnClick: true,
        draggable: true,
      });
    } else {
      toast.success(message, {
        position: "bottom-center",
        autoClose: 5000,
        closeOnClick: true,
        draggable: true,
      });
    }
  };

  const handleClaimMiddleRow = async () => {
    const message = await claimMiddleRow(
      socket,
      tickets,
      strikedNumbers,
      joiningCode
    );
    if (message.includes("can't")) {
      toast.error(message, {
        position: "bottom-center",
        autoClose: 5000,
        closeOnClick: true,
        draggable: true,
      });
    } else {
      toast.success(message, {
        position: "bottom-center",
        autoClose: 5000,
        closeOnClick: true,
        draggable: true,
      });
    }
  };

  const handleClaimLastRow = async () => {
    const message = await claimLastRow(
      socket,
      tickets,
      strikedNumbers,
      joiningCode
    );
    if (message.includes("can't")) {
      toast.error(message, {
        position: "bottom-center",
        autoClose: 5000,
        closeOnClick: true,
        draggable: true,
      });
    } else {
      toast.success(message, {
        position: "bottom-center",
        autoClose: 5000,
        closeOnClick: true,
        draggable: true,
      });
    }
  };

  const handleClaimMiddleCell = async () => {
    const message = await claimMiddle(
      socket,
      tickets,
      strikedNumbers,
      joiningCode
    );
    if (message.includes("can't")) {
      toast.error(message, {
        position: "bottom-center",
        autoClose: 5000,
        closeOnClick: true,
        draggable: true,
      });
    } else {
      toast.success(message, {
        position: "bottom-center",
        autoClose: 5000,
        closeOnClick: true,
        draggable: true,
      });
    }
  };

  const handleClaimDiagonalCorners = async () => {
    const message = await claimDiagonalCorners(
      socket,
      tickets,
      strikedNumbers,
      joiningCode
    );
    if (message.includes("can't")) {
      toast.error(message, {
        position: "bottom-center",
        autoClose: 5000,
        closeOnClick: true,
        draggable: true,
      });
    } else {
      toast.success(message, {
        position: "bottom-center",
        autoClose: 5000,
        closeOnClick: true,
        draggable: true,
      });
    }
  };

  return (
    <>
      <div className="image__container d-flex justify-content-evenly">
        <img src={img1} className="logo" alt="Hosuie Housie" />
        <div className="host-container">
          <p className="text-center fs-3">{randomNumber}</p>
        </div>
      </div>

      {claimsMade > 0 && (
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
                {user.claims.middleRow && (
                  <p>
                    <span>{user.name}</span> claimed Middle Row! +5
                  </p>
                )}
                {user.claims.lastRow && (
                  <p>
                    <span>{user.name}</span> claimed Last Row! +5
                  </p>
                )}
                {user.claims.middle && (
                  <p>
                    <span>{user.name}</span> claimed Middle Cell! +5
                  </p>
                )}
                {user.claims.diagonalCorners && (
                  <p>
                    <span>{user.name}</span> claimed Diagonal Corners! +5
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="container-play">
        {error && <div className="text-center">Error: {error}</div>}
        <div className="d-flex gap-2 align-items-center justify-content-center">
          <ClaimButtons
            handleClaimFastestFive={handleClaimFastestFive}
            handleClaimFirstRow={handleClaimFirstRow}
            handleClaimMiddleRow={handleClaimMiddleRow}
            handleClaimLastRow={handleClaimLastRow}
            handleClaimMiddleCell={handleClaimMiddleCell}
            handleClaimDiagonalCorners={handleClaimDiagonalCorners}
            handleClaimFullHouse={handleClaimFullHouse}
            fastfive={fastfive}
            firstRow={firstRow}
            middleRow={middleRow}
            lastRow={lastRow}
            middleCell={middleCell}
            diagonalCorners={diagonalCorners}
            fullHouse={fullHouse}
          />
          <ExitModal />
        </div>

        <div className="center-play">
          {visualizeTickets(
            tickets,
            strikedNumbers,
            disabledNumbers,
            handleCellClick
          )}
        </div>

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
            <div className="text-center pb-4">
              {generatedNumbers.slice(-7).map((number, index, array) => (
                <span
                  key={index}
                  className={`rounded-circle mx-2 ${
                    index === array.length - 1
                      ? "latest-number"
                      : "bg-success text-white"
                  }`}
                  style={{
                    padding: "5px",
                    minWidth: "30px",
                    display: "inline-block",
                  }}
                >
                  {number}
                </span>
              ))}
            </div>
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
      <BackgroundMusic src={backgroundMusic} />

      {gameData.winner && displayWinner && (
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
                  {/* Map through top 3 players */}
                  {gameData.topPlayers.map((player, index) => (
                    <tr key={`top-player-${index}`}>
                      <td>{player.name}</td>
                      <td>{player.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h1 className="text-white my-3">
                Winner: <span className="text-warning">{gameData.winner}</span>
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
