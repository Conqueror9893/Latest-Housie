const db = require('../models');
const User = db.users

const addUsers = async (req, res) => {
  let data = {
    name: req.body.name,
    joiningcode: req.body.joiningcode,
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

module.exports = {
  addUsers,
  getAllUsers,
  
};

