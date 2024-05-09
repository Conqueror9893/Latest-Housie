const db = require('../models');
const User = db.users

const addUsers = async (req, res) => {
  let data = {
    name: req.body.name,
    joiningcode: req.body.joiningcode,
    socketId : req.body.socketId,
    claims: req.body.claims,
    score: req.body.score
  };

  const value = await User.create(data);
  res.status(200).send(value);
};

const getAllUsers = async (req, res) => {
  const data = await User.findAll({});
  res.status(200).send(data);
};

const updateUserTicketIdBySocketId = async (req, res) => {
  try {
    const { socketId, id } = req.body;
    console.log(socketId + " - " + id);

    const user = await User.findOne({ where: { socketId } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await User.update({ ticket_id: id }, { where: { socketId } }); // Provide the where condition here

    res.json({ message: "User ticket_id updated successfully" });
  } catch (error) {
    console.error("Error updating user ticket_id:", error);
    res.status(500).json({ error: "Error updating user ticket_id" });
  }
};

const claimValidation = async (req, res) => {
  try {
    const { claim, socketId, joiningCode } = req.body; 

    // Find the user by socket ID and joining code
    const user = await User.findOne({ where: { socketId, joiningcode: joiningCode } }); 

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Define the points for each claim
    const claimPoints = {
      fastFive: 5,
      firstRow: 10,
      fullHouse: 15
      // Add other claims and their points as needed
    };

    // Calculate the new score based on the claim
    const claimScore = claimPoints[claim];
    if (!claimScore) {
      return res.status(400).json({ error: 'Invalid claim' });
    }

    const currentScore = user.score || 0;
    const updatedScore = currentScore + claimScore;

    // Update the claims object
    const updatedClaims = { ...user.claims, [claim]: true };

    // Update the user with the new claims object and score
    await User.update({ claims: updatedClaims, score: updatedScore }, { where: { id: user.id } });

    // Respond with success
    return res.status(200).json({ message: 'Claim validated successfully' });
  } catch (error) {
    console.error('Error validating claim:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get Winner

const calculateScore = (claims) => {
  const claimPoints = {
    fastFive: 5,
    firstRow: 10,
    fullHouse: 15
    // Add other claims and their points as needed
  };

  let score = 0;
  for (const claim in claims) {
    if (claims.hasOwnProperty(claim) && claims[claim] && claimPoints[claim]) {
      score += claimPoints[claim];
    }
  }
  return score;
};

// Controller to get winners by joining code
const getClaimData = async (req, res) => {
  try {
    const { joiningCode } = req.params;



    // Find all users with the given joining code
    const users = await User.findAll({ where: { joiningcode: joiningCode } });

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'No users found with the provided joining code' });
    }

    // Prepare an array to store user data
    const userData = [];

    // Loop through each user to calculate their scores and include claims
    for (const user of users) {
      const score = calculateScore(user.claims);
      userData.push({ 
        name: user.name, 
        score: score,
        claims: user.claims,
        socketId : user.socketId
      });
    }

    // Respond with the array of user data
    return res.status(200).json(userData);
  } catch (error) {
    console.error('Error fetching winners:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
const getWinner = async (req, res) => {
  try {
    const { joiningCode } = req.params;

    // Find all users with the given joining code
    const users = await User.findAll({ where: { joiningcode: joiningCode } });

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'No users found with the provided joining code' });
    }

    let winner = null;
    let highestScore = -1;

    // Loop through each user to find the winner
    for (const user of users) {
      const score = calculateScore(user.claims);
      if (score > highestScore) {
        highestScore = score;
        winner = user.name;
      }
    }

    // Respond with the winner's name
    return res.status(200).json({ winner: winner });
  } catch (error) {
    console.error('Error fetching winner:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};




module.exports = {
  addUsers,
  getAllUsers,
  updateUserTicketIdBySocketId,
  claimValidation,
  getClaimData,
  getWinner
  
};

