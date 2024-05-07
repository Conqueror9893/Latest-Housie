const { generateJoiningCode, generateUniqueLink } = require('../utils');
const { SOCKET_IO_CORS_ORIGIN, API_URL } = require("../constant");

function redirectGame(req, res) {
  const { id } = req.params;
  const { joiningCode } = req.query;
  if (!joiningCode) {
    return res.status(400).send("Joining code is missing.");
  }
  const redirectUrl = `${SOCKET_IO_CORS_ORIGIN}/join-game?${id}&joiningCode=${joiningCode}`;
  res.redirect(redirectUrl);
}

// 
let generatedJoiningCode = null; 

function generateJoiningCodeIfNeeded() {
  if (!generatedJoiningCode) {
    generatedJoiningCode = generateJoiningCode();
  }
  return generatedJoiningCode;
}

const generateJoiningCodeEndpoint = (req, res) => {
  generatedJoiningCode = null;

  const joiningCode = generateJoiningCodeIfNeeded();
  const uniqueLink = generateUniqueLink(joiningCode, API_URL);
  res.json({ uniqueLink, joiningCode });
};

function joiningCodeIsValid(receivedCode, generatedCode) {
  console.log("Generated Joining Code:", generatedCode);
  console.log("Received Joining Code:", receivedCode);

  const isValid = receivedCode === generatedCode;
  console.log("Is Valid:", isValid);

  return isValid;
}

const verifyJoiningCodeEndpoint = (req, res) => {
  const { joiningCode } = req.query;

  // Compare the joining code with the generated code
  const isValid = joiningCodeIsValid(joiningCode, generatedJoiningCode);

  if (isValid) {
    res.status(200).send("Joining code is valid");
  } else {
    console.log("Invalid joining code:", joiningCode);
    res.status(400).send("Invalid joining code");
  }
};

module.exports = {
    redirectGame,
  generateJoiningCodeEndpoint,
  verifyJoiningCodeEndpoint,
};

