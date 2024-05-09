import React, { useState, useEffect, useContext } from "react";
import "../styles/host.css";
import Options from "./Options";
import { UserContext } from "./UserContext";

const Host = ({ socket }) => {
  // eslint-disable-next-line
  const [numbers, setNumbers] = useState(
    Array.from({ length: 90 }, (_, index) => index + 1)
  );
  const [latestNumber, setLatestNumber] = useState(null);
  const [intervalId, setIntervalId] = useState(null);
  const [struckNumbers, setStruckNumbers] = useState([]);
  const { paused, setPaused } = useContext(UserContext);
  const [winner, setWinner] = useState(null);
  const [displayUsers, setDisplayUsers] = useState([]);


  const [claims, setClaims] = useState(null);

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
  }, [socket]); // Ensure socket is included in the dependencies array
  

  // Divide the numbers into groups of 10 for each row
  const rows = [];
  for (let i = 0; i < numbers.length; i += 10) {
    rows.push(numbers.slice(i, i + 10));
  }

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

    // from gamePlay.js we are getting this Decalre winner and storing the data
    socket.on("DecalreWinner", (data) => {
      setWinner(data);
    });
    
    socket.on("ClaimData",(userData)=>{
      console.log(userData);
        setClaims(userData)
    })

   

    // after game started we get the username data and socketId / 
    socket.on("displayUsers", (data) => {
      setDisplayUsers(data);
    });

    return () => {
      clearInterval(intervalId);
      socket.off("displayUsers")

      socket.off("randomNumber");
      socket.off("DecalreWinner");
      socket.off("NameofFastFive");
      socket.off("NameofFirstRow");
      socket.off("NameofFullHouse");
    };
  }, [intervalId, paused, socket]);

  // with 3 s interval calling emiting the getRandomNum
  const handleGenerateRandomNumber = () => {
    if (!paused && intervalId === null && winner === null) {
      const id = setInterval(() => {
        socket.emit("getRandomNumber");
      }, 3000);
      setIntervalId(id);
    }
  };
  
  // after winner is declared we are clearing the timer
  useEffect(() => {
    if (winner) {
      clearInterval(intervalId);
    }
  }, [intervalId, winner]);

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

  return (
    
    <>
    
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
      
      


      <Options
        handlePauseResume={handlePauseResume}
        paused={paused}
        handleGenerateRandomNumber={handleGenerateRandomNumber}
      />

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
        <div className="users-list">
        <h2>Live Users:</h2>
        <ul className="live-users">
          {displayUsers.map((user, index) => (
            <li key={index}>{user.name}</li>
          ))}
        </ul>
        </div>
        
      </div>
      
    </>
  );
};

export default Host;
