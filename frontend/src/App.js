import './App.css';
import GameCreation from "./Component/GameCreation"
import GamePlay from './Component/GamePlay';
import JoinGameForm from './Component/JoinGameForm';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from './Component/LandingPage';
import Host from './Component/Host';
import HostManual from './Component/HostManual';

import  {UserProvider}  from './Component/UserContext';
import { useEffect } from 'react'; 



import io from "socket.io-client"; 
import BackgroundMusic from './Component/BackgroundMusic';
const { FETCH_URL } = require("./constant");

const socket = io(FETCH_URL); 



function App() {
  
  useEffect(() => {
    socket.emit('pageReload');
  }, []);

  return (
    <> 
    <UserProvider>

    <BrowserRouter>
      <Routes>
      <Route path="*" element={<LandingPage />} />

      <Route path="/" element = {<LandingPage/>}/>

        <Route path="/create-game" element = {<GameCreation socket={socket}/>}/>
        <Route path="/join-game" element = {<JoinGameForm socket={socket}/>}/>
        <Route path="/play-game" element = {<GamePlay socket={socket}/>}/>
        <Route path="/host-page" element = {<Host socket={socket}/>}/>
        <Route path="/host-manual" element = {<HostManual socket={socket}/>}/>
        <Route path="/bg" element={<BackgroundMusic/>}/>





      </Routes>
    </BrowserRouter>
    </UserProvider>

    </>
  );
}

export default App;

