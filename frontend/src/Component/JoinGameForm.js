import React, { useState, useEffect } from "react";
import "../styles/joinGameForm.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const { API_URL } = require("../constant"); 

const JoinGameForm = ({ socket }) => {
  const [joiningCode, setJoiningCode] = useState("");
  const [name, setName] = useState(""); 
  const [waitingMessageVisible, setWaitingMessageVisible] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usernames, setUsernames] = useState([]);

  const navigate = useNavigate(); 

  useEffect(() => { 
    const params = new URLSearchParams(window.location.search);
    const joiningCodeParam = params.get("joiningCode");
    if (joiningCodeParam) {
      setJoiningCode(joiningCodeParam);
    }
  }, []);

  function isFormEmpty() {
    return !joiningCode.trim() || !name.trim();
  }

  // after clicking join button we verify the users using this End Point
  const handleJoinFormSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.get(
        `http://${API_URL}:3309/verify?joiningCode=${joiningCode}`
      );
      setWaitingMessageVisible(true);


      const data ={
        name : name,
        joiningcode : joiningCode,
        socketId : socket.id
      }

      await axios.post(`http://${API_URL}:3309/addUser`,data); 
      if (response.status === 200) {
        if (joiningCode.trim() && name.trim()) {
          socket.emit("dataEntered", { joiningCode, name });
        }

        setError(null);
        setIsLoading(true);
      } else {
        setIsLoading(false);
      }
    } catch (e) {
      setIsLoading(false);
      setWaitingMessageVisible(false);
      setError("Invalid joining code. Please try again With Valid Code.");
    }

    
  };

  useEffect(() => {
    // simply redirect all the users to this path
    const handleGameStarted = () => {
      if (waitingMessageVisible) {
        navigate("/play-game");
      }
    };
    

    // listening from server.js / the name and socket id get as array from game creation page
    socket.on("joinUserName", (userData) => {
      setUsernames(userData);
    });

    if (socket) {
      // after getting gameStarted after got clicked from Gamecreation 
      socket.on("gameStarted", handleGameStarted);
      return () => {
        socket.off("gameStarted", handleGameStarted);
      };
    }
  }, [socket, navigate,waitingMessageVisible]);

  return (
    <div className="center-join">
      <div className="container">
        <div className="row justify-content-center align-items-center">
          <div className="card p-5">
            <div className="card-body">
              <h1 className="card-title text-center mb-4">Join Game</h1>
              <form onSubmit={handleJoinFormSubmit}>
                <div className="mb-3">
                  <label htmlFor="joiningCode" className="form-label">
                    Enter Joining Code:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="joiningCode"
                    name="joiningCode"
                    value={joiningCode}
                    disabled={isLoading}
                    placeholder="Joining Code"
                    onChange={(e) => setJoiningCode(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Enter Your Name:
                  </label>
                  <input
                    type="text"
                    disabled={isLoading}
                    className="form-control"
                    id="name"
                    name="name"
                    value={name}
                    required
                    placeholder="Name"
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="btn__submit">
                  <button
                    disabled={isFormEmpty() || isLoading}
                    type="submit"
                    className={`btn btn-primary mt-3 ${
                      isFormEmpty() ? "btn-half-width" : "btn-full-width"
                    }`}
                  >
                    {isLoading ? "Joining..." : "Join"}
                  </button>
                </div>
                {waitingMessageVisible && !error && (
                  <p className="text-center mt-3">
                    Hi {name}!
                    <br />
                    Waiting for the host to start the game...
                  </p>
                )}

                {error && !waitingMessageVisible && (
                  <p className="text-center text-danger mt-3">{error}</p>
                )}
              </form>
              <hr />
              <div>
                {usernames.length > 0 && (
                  <div className="joined-users">
                    <h2 className="text-center">Joined users</h2>
                    <ul>
                      {usernames.map((user, index) => (
                        <li className="text-center" key={index}>
                          {user.socketId === socket.id ? (
                            <span className="text-success">
                              {user.name} (You)
                            </span>
                          ) : (
                            <span>{user.name}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinGameForm;
