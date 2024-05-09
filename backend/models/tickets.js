const { DataTypes } = require("sequelize");
const { sequelize } = require(".");

module.exports = (sequelize,DataTypes)=>{
    const Ticket = sequelize.define('tickets', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        cell1: {
          type: DataTypes.STRING,
          allowNull: true
        },
        cell2: {
          type: DataTypes.STRING,
          allowNull: true
        },
        cell3: {
          type: DataTypes.STRING,
          allowNull: true
        },
        cell4: {
          type: DataTypes.STRING,
          allowNull: true
        },
        cell5: {
          type: DataTypes.STRING,
          allowNull: true
        },
        cell6: {
          type: DataTypes.STRING,
          allowNull: true
        },
        cell7: {
          type: DataTypes.STRING,
          allowNull: true
        },
        cell8: {
          type: DataTypes.STRING,
          allowNull: true
        },
        cell9: {
          type: DataTypes.STRING,
          allowNull: true
        },
        cell10: {
          type: DataTypes.STRING,
          allowNull: true
        },
        cell11: {
          type: DataTypes.STRING,
          allowNull: true
        },
        cell12: {
          type: DataTypes.STRING,
          allowNull: true
        },
        cell13: {
          type: DataTypes.STRING,
          allowNull: true
        },
        cell14: {
          type: DataTypes.STRING,
          allowNull: true
        },
        cell15: {
          type: DataTypes.STRING,
          allowNull: true
        },
        cell16: {
          type: DataTypes.STRING,
          allowNull: true
        },
        cell17: {
          type: DataTypes.STRING,
          allowNull: true
        },
        cell18: {
          type: DataTypes.STRING,
          allowNull: true
        },
        cell19: {
          type: DataTypes.STRING,
          allowNull: true
        },
        cell20: {
          type: DataTypes.STRING,
          allowNull: true
        },
        cell21: {
          type: DataTypes.STRING,
          allowNull: true
        },
        cell22: {
          type: DataTypes.STRING,
          allowNull: true
        },
        cell23: {
          type: DataTypes.STRING,
          allowNull: true
        },
        cell24: {
          type: DataTypes.STRING,
          allowNull: true
        },
        cell25: {
          type: DataTypes.STRING,
          allowNull: true
        },
        cell26: {
          type: DataTypes.STRING,
          allowNull: true
        },
        cell27: {
          type: DataTypes.STRING,
          allowNull: true
        }
      }, {
        timestamps: false 
      });
      return Ticket;
}