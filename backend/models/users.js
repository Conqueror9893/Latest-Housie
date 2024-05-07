module.exports = (sequelize, DataTypes) => {
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
        claims: {
          type: DataTypes.STRING,
        },
        score: {
          type: DataTypes.STRING,
        },
      },
      {
        timestamps: false,
      }
    );
    return Users;
  };