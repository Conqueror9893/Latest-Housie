import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { Link } from "react-router-dom";
import { UserContext } from "./UserContext";
import { FaRegCopy } from "react-icons/fa";
import "../styles/gameCreation.css";
import "react-toastify/dist/ReactToastify.css";
import PassedValueModal from "./PassedValueModal";

const { FETCH_URL } = require("../constant");
const BASE_URL = FETCH_URL;

const GameCreation = ({ socket }) => {
  const [invitationData, setInvitationData] = useState(null);
  const [error, setError] = useState(null);
  // eslint-disable-next-line
  const { liveUsers, setLiveUsers } = useContext(UserContext);
  const [usernames, setUsernames] = useState([]);
  const [hostId, setHostId] = useState("");

  // getting invitation code and link
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/invitation`);
        setInvitationData(response.data);
      } catch (e) {
        setError("Failed to fetch invitation data. Please try again later.");
      }
    };

    fetchData();
  }, []);

  // getting hostId initial onLoad
  useEffect(() => {
    const fetchInitialLiveUsers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/liveUsers`);
        setLiveUsers(response.data);
        //setHostId(liveUsers[0])
      } catch (error) {
        console.error("Error fetching live users:", error);
      }
    };

    fetchInitialLiveUsers();

    // from server.js liveuser data will be fetched
    socket.on("liveUsers", (updatedLiveUsers) => {
      setLiveUsers(updatedLiveUsers);
    });

    // from server.js we get the host ID that mapped in server.js
    socket.on("hostSocketId", (hostSocketId) => {
      setHostId(hostSocketId);
    });

    // from joingameform data we get name .. and current socket.id and host id
    socket.on("userNameEntered", (userData) => {
      setUsernames((prevUsernames) => {
        const { name, socketId } = userData;
        const existingUserIndex = prevUsernames.findIndex(
          (user) => user.socketId === socketId
        );
        if (existingUserIndex !== -1) {
          prevUsernames[existingUserIndex].name = name;
          return [...prevUsernames];
        } else {
          return [...prevUsernames, { name, socketId }];
        }
      });
    });


    // someone leaves we are cleaning up/ Updating
    socket.on("disconnected", (disconnectedSocketId) => {
      setUsernames((prevUsernames) => {
        return prevUsernames.filter(
          (user) => user.socketId !== disconnectedSocketId
        );
      });
      if (disconnectedSocketId === hostId) {
        setHostId("");
      }
    });

    return () => {
      socket.off("liveUsers");
      socket.off("hostSocketId");
      socket.off("disconnected");
    };
  }, [socket, setLiveUsers, hostId]);

  // CopyTocliboard Logic
  const copyTextToClipboard = (text) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand("copy");
      toast.success("Text copied to clipboard!", {
        autoClose: 1000,
        closeOnClick: true,
      });
    } catch (error) {
      toast.error("Text not copied! Try again");
    }

    document.body.removeChild(textarea);
  };

  useEffect(() => {
    // after that we are sending the username and socket id array to server.js (for join game page display)
    socket.emit("joinGameData", usernames);
  }, [usernames, socket]);


  // when button got click we are emiting startGame to server.js
  const handleStartGame = () => {
    socket.emit("startGame");
  };
  

  return (
    <div className="center-game">
      <PassedValueModal socket={socket} />
      <div className="container mt-5">
        <div className="card">
          <div className="card-header">
            <h2 className="my-4 text-center fs-2">Create Game</h2>
          </div>
          <div className="card-body">
            {error && <p className="text-danger text-center my-5">{error}</p>}
            {invitationData && (
              <>
                <p className="my-4 text-center text-success invite-text">
                  Share this invitation link with your friends
                </p>
                <p className="fs-3 invitation__link text-center my-3">
                  Invitation Link:
                </p>
                <button
                  className="btn invite__button mb-2 text-center"
                  onClick={() =>
                    copyTextToClipboard(invitationData?.uniqueLink)
                  }
                  id="invitationLink"
                >
                  <p className="text-center invite-data">
                    {invitationData?.uniqueLink}
                  </p>
                </button>
                {/* <h3 className="text-center my-3">Live Users Joining:</h3>
                <ul id="liveUsers" className="mb-2 text-center my-3">
                  {liveUsers.map((user, index) => (
                    <li className="text-center" key={index}>
                      {user}
                    </li>
                  ))}
                </ul> */}
                <h3 className="text-center my-3">Joined Users:</h3>
                <ul className="mb-2 text-center my-3">
                  <li className="text-center text-danger">
                    {hostId && ` (Host)  ${hostId}`}
                  </li>

                  {usernames.map((user, index) => (
                    <li className="text-center text-success" key={index}>
                      {`${user.name} - ${user.socketId}`}
                    </li>
                  ))}
                </ul>

                <h3 className="text-center my-3">Joining code</h3>
                <p
                  id="joiningCode"
                  className="text-center copy-code"
                  onClick={() =>
                    copyTextToClipboard(invitationData?.joiningCode)
                  }
                >
                  {invitationData?.joiningCode} <FaRegCopy />
                </p>
                <div className="d-flex justify-content-center my-4">
                  {usernames.length > 0 ? (
                    <>
                      <Link
                        to={"/host-page"}
                        className="btn btn-success"
                        onClick={() => handleStartGame()}
                      >
                        Start Game with auto numbers generation
                      </Link>
                      <Link
                        to={"/host-manual"}
                        className="btn btn-danger ms-2"
                        onClick={() => handleStartGame()}
                      >
                        Start Game with Manual Selection
                      </Link>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-success me-2" disabled>
                        Start Game with auto numbers generation
                      </button>
                      <button className="btn btn-danger" disabled>
                        Start Game with Manual Selection
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default GameCreation;
