const dbConfig = require("../config/dbConfig");

const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
});

sequelize
  .authenticate()
  .then(() => {
    console.log("DataBase Connected SuccessFully");
  })
  .catch((e) => {
    console.log(`Connection Failed ${e}`);
  });

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./users.js")(sequelize, DataTypes);
db.tickets = require("./tickets.js")(sequelize, DataTypes)

db.users.belongsTo(db.tickets, { foreignKey: 'ticket_id', as: 'tickets' });


db.users.sync({ force: false }).then(() => {
  console.log("Re-sync Done for Users Table");
});




module.exports = db;