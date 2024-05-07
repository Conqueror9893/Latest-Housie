
function generateUniqueLink(joiningCode, API_URL) {
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 8);
    const hostname = process.env.HOSTNAME || `http://${API_URL}:3309`;
    return `${hostname}/game/${timestamp}-${randomString}?joiningCode=${joiningCode}`;
  }
  
  module.exports = generateUniqueLink;
  