// UserContext.js
import React, { createContext, useState } from 'react';

const UserContext = createContext();

const UserProvider = ({ children}) => {
  const [userId] = useState(generateUserId());
  const [liveUsers, setLiveUsers] = useState([]);
  const [paused, setPaused] = useState(false);

  const [hideValue, setHideValue] = useState(true)



  function generateUserId() {
    return Math.random().toString(36).substr(2, 9);
  }

  return (
    <UserContext.Provider value={{ userId, liveUsers, setLiveUsers, paused, setPaused, hideValue,setHideValue }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
