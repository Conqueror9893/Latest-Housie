module.exports = (sequelize, DataTypes) => {
  const defaultClaims = {
    fastFive: false,
    firstRow: false,
    fullHouse: false,
  };

  const Users = sequelize.define(
    "user",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      joiningcode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      socketId: {
        type: DataTypes.STRING,
        allowNull: false,

      },
      claims: {
        type: DataTypes.JSON, 
        defaultValue: defaultClaims, 
      },
      score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }

    },
    {
      timestamps: false,
    }
  );
  return Users;
};
