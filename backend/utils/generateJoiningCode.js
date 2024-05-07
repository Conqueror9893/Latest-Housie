// generateJoiningCode.js
function generateJoiningCode() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456786";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }
  
  module.exports = generateJoiningCode;
  