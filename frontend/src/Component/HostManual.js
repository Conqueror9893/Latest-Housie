import React, { useState, useEffect } from "react";
import "../styles/host.css";

const HostManual = ({ socket }) => {
  // eslint-disable-next-line
  const [numbers, setNumbers] = useState(
    Array.from({ length: 90 }, (_, index) => index + 1)
  );
  const [latestNumber, setLatestNumber] = useState(null);
  const [struckNumbers, setStruckNumbers] = useState([]);
  const [intervalId, setIntervalId] = useState(null);

  const [displayUsers, setDisplayUsers] = useState([]);
  const [winner, setWinner] = useState(null);
  const [claims, setClaims] = useState({});

  const rows = [];
  for (let i = 0; i < numbers.length; i += 10) {
    rows.push(numbers.slice(i, i + 10));
  }
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
  }, [socket]); // Ensure socket is included in the dependencies array
  

  useEffect(() => {

    // listening randomNumber from Server.js and storing locally
    socket.on("randomNumber", (randomNumber) => {
      setLatestNumber(randomNumber);
      setStruckNumbers((prevStruckNumbers) => [
        ...prevStruckNumbers,
        randomNumber,
      ]);
    });

    // after game started we get the username data and socketId / 
    socket.on("displayUsers", (data) => {
      setDisplayUsers(data);
    });
    // after winner is declared from Gameplay that is listening from server.js
    socket.on("DecalreWinner", (data) => {
      setWinner(data);
    });

    // getting the name of the fastest five claimed player from via Gameplay through server.js
    socket.on("NameofFastFive", (data) => {
      setClaims((prevClaims) => ({ ...prevClaims, fastFive: data }));
    });

    // getting the name of the first Row claimed player from via Gameplay through server.js
    socket.on("NameofFirstRow", (data) => {
      setClaims((prevClaims) => ({ ...prevClaims, firstRow: data }));
    });

    // getting the name of the Full house claimed player from via Gameplay through server.js
    socket.on("NameofFullHouse", (data) => {
      setClaims((prevClaims) => ({ ...prevClaims, fullHouse: data }));
    });

    return () => {
      clearInterval(intervalId);
      socket.off("randomNumber");
      socket.off("displayUsers")
      socket.off("DecalreWinner");
      socket.off("NameofFastFive");
      socket.off("NameofFirstRow");
      socket.off("NameofFullHouse");
    };
  }, [intervalId, socket]);

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

  return (
    <>
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

      {Object.keys(claims).length !== 0 && (
        <div className="host-claim">
          {claims.fastFive && (
            <li>
              <span className="text-success">{claims.fastFive}</span> Claimed
              the Fastest Five
            </li>
          )}
          {claims.firstRow && (
            <li>
              <span className="text-success">{claims.firstRow}</span> Claimed
              the First Row
            </li>
          )}
          {claims.fullHouse && (
            <li>
              <span className="text-success">{claims.fullHouse} </span>Claimed
              the Full House
            </li>
          )}
        </div>
      )}

      <div className="users-list">
        <h2>Live Users:</h2>
        <ul className="live-users">
          {displayUsers.map((user, index) => (
            <li key={index}>{user.name}</li>
          ))}
        </ul>

        {winner && <h2 className="text-danger">{winner} Won the Match</h2>}
      </div>
    </>
  );
};

export default HostManual;
