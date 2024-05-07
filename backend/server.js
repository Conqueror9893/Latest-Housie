const express = require("express")
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const bodyParser = require('body-parser');
const app = express();
const httpServer = http.createServer(app);


// app.js
const { generateJoiningCode, generateUniqueLink } = require('./utils');
const { API_URL, SOCKET_IO_CORS_ORIGIN } = require("./constant");



// Socket Cors Connection
const io = socketIO(httpServer, {
  cors: {
    origin:SOCKET_IO_CORS_ORIGIN,
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

// MiddleWare
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Router
const router = require("./routers/userRoutes");
app.use("/", router);

app.get("/",(req,res)=>{
    res.send("<h1>Hi</h1>")
});

// 

let liveUsers = [];
let hostSocketId = null;
let isHostAssigned = false;

let generatedNumbers = [];  
let allUsernames = [];
let hideValue = false;
let pausedCheck = true;


// 

function generateRandomNumber(callback) {
  if (generatedNumbers.length === 90) {
    // if all number got generated we are sending generateWinLogic
    io.emit("GenerateWinLogic")
    console.log("All numbers have been generated.");
    return;
  }

  let randomNumber;
  if(generatedNumbers.length !== 90){
    do {
      randomNumber = Math.floor(Math.random() * 90) + 1;
    } while (generatedNumbers.includes(randomNumber));
  
    generatedNumbers.push(randomNumber);
    console.log(generatedNumbers);
  
    callback(randomNumber);

  }
 
}
// 
io.on("connection", (socket) => {
  console.log("A user connected");

  if (!hostSocketId || !liveUsers.includes(hostSocketId)) {
    hostSocketId = socket.id;
    console.log("Host connected with socket ID:", hostSocketId);
    isHostAssigned = true;
    // Emit the hostSocketId to all clients that mapped
    io.emit("hostSocketId", hostSocketId); 
  }

  socket.on("pageReload", () => {
    //console.log('Page reloaded');
    // After page reload we are clearing the generated num 
    generatedNumbers = []; 
  });


  socket.emit("hostSocketId", hostSocketId);
  liveUsers.push(socket.id);

  // this will emit to all and in game creation we listening
  io.emit("liveUsers", liveUsers);

  socket.on("hideValue", (value) => {
    socket.emit("showPassed", value);
  });
  socket.on("hideORnot",(data)=>{
  hideValue = data;

  })
  socket.on("getShoworHide",()=>{
    io.emit("showHideOrNot", hideValue);
  })

  socket.on("setPaused",(data)=>{
    pausedCheck = data;
    })
    socket.on("getPausedValue",()=>{
      io.emit("PausedOrNot", pausedCheck);
    })

    // this is listening from host page after getting we are emitting randomNumber to host 
  socket.on("getRandomNumber", () => {
    if (generatedNumbers.length !== 90) {
      console.log("Received request for random number from client");
    }

    setTimeout(() => {
      generateRandomNumber((randomNumber) => {
        if (randomNumber !== null) {
          console.log("Generated random number:", randomNumber);
          // emiting randomNumber to Host page 
          io.emit("randomNumber", randomNumber, generatedNumbers);
          console.log("sent number to client");
        } else {
          return;
        }
      });
    }, 1000);
  });

  socket.on("manualRandom", (randomNumber) => {
    io.emit("randomNumber", randomNumber);
    generatedNumbers.push(randomNumber);
    console.log(generatedNumbers);
  });


  // this is listening from joinGameForm.js
  socket.on("dataEntered", (userData) => {
    const { joiningCode, name } = userData;
    console.log(joiningCode, name);

    // sending to all ..we r listening from game Creation page for name ,current player socket id and host id
    io.emit("userNameEntered", { name, socketId: socket.id, hostSocketId }); 
  });


  socket.on("getDisplayData",()=>{
    io.emit("displayUsers",allUsernames);
  })


  //emit comes from Game Creation this will listen from the game creation 
  socket.on("joinGameData", (usernames) => {
    const uniqueSocketIds = new Set(allUsernames.map(user => user.socketId));
  
    // Filter out duplicate usernames based on socketId it creates duplicates so 
    const uniqueUsernames = usernames.filter(user => !uniqueSocketIds.has(user.socketId));
  
    allUsernames.push(...uniqueUsernames);

    // this emit will send to join page and display the data (username and socketID)
    io.emit("joinUserName", usernames);
  });

  // we are getting this from gameplay and sending to every user who is this winner
  socket.on("winner",(winner)=>{
    // for everyone winner is sended (this is for host)
    io.emit("DecalreWinner",winner)
  })


  socket.on("FastFiveClaim", (userData) => {
    console.log(userData);
    io.emit("uniqueFastFive", { userData, allUsernames });
  });
  socket.on("FirstRowClaim", (userData) => {
    console.log(userData);
    io.emit("uniqueFirstRow", { userData, allUsernames });
  });
  socket.on("fullHouseClaim", (userData) => {
    console.log(userData);
    io.emit("uniqueFullHouse", { userData, allUsernames });
  });

  socket.on("updatePoints", ({ name, point }) => {
    io.emit("pointsUpdated", { name, point });
  });
  

  socket.on("fastFiveName2Host",(data)=>{
    // sending the name of the player who claimed fastest five (to Host)
    io.emit("NameofFastFive" ,data)
  })
  socket.on("firstRowName2Host",(data)=>{
    io.emit("NameofFirstRow" ,data)
  })
  socket.on("fullHouseName2Host",(data)=>{
    io.emit("NameofFullHouse" ,data)
  })

  console.log(liveUsers);
  
  // this is getting from manual and auto host page
  socket.on("hostExited", () => {
    // emitting to every user that host disconnected to gameplay.js
    io.emit("hostDisconnected");
  });


  // This is coming from game creation page when startGame got we are starting game for everyone
// After game starts sending username to HOST and PLAYERS
  socket.on("startGame", () => {
    console.log(allUsernames);

    // 
    io.emit("displayUsers",allUsernames);

    // joinGame
    io.emit("gameStarted");
    console.log("Game Started");
    console.log(generatedNumbers);
    generatedNumbers = [];
    console.log(generatedNumbers);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
    const disconnectedSocketId = socket.id; // Get the ID of the disconnected user

    liveUsers = liveUsers.filter((user) => user !== socket.id);
    io.emit("liveUsers", liveUsers);
    io.emit("disconnected", disconnectedSocketId);
    io.emit("displayUsers",allUsernames);



    allUsernames = allUsernames.filter(user => user.socketId !== socket.id);
    io.emit("allUsernames", allUsernames);

    if (disconnectedSocketId === hostSocketId) {
      console.log("The host disconnected.");
      hostSocketId = null;
      io.emit("hostDisconnected");
    }
  });

  app.get("/liveUsers", (req, res) => {
    io.emit("hostSocketId", hostSocketId);
    res.json(liveUsers);
  });

  socket.on("verifyJoiningCode", (receivedCode) => {
    const isValid = joiningCodeIsValid(receivedCode, generatedJoiningCode);
    if (isValid) {
      console.log("Valid joining code:", receivedCode);
    } else {
      console.log("Invalid joining code:", receivedCode);
    }
  });


});


// Starting Server
const PORT = 3309
const hostname = process.env.HOSTNAME || "192.168.10.156";
httpServer.listen(PORT, hostname, () => {
  console.log(`Server is running on http://${hostname}:${PORT}`);
});



