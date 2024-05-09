const router = require("express").Router();
const userController = require('../controllers/userController');
const ticketController = require("../controllers/ticketController")
const gameController = require("../controllers/gameController")

router.post('/addUser', userController.addUsers);
router.get('/getUsers', userController.getAllUsers);
router.put('/update-ticket',userController.updateUserTicketIdBySocketId)

router.get('/get-tickets',ticketController.getTickets)

router.get("/game/:id", gameController.redirectGame);
router.get("/invitation", gameController.generateJoiningCodeEndpoint);
router.get("/verify", gameController.verifyJoiningCodeEndpoint);

router.put("/claim-validation",userController.claimValidation)
router.get('/claim-data/:joiningCode', userController.getClaimData);
router.get('/get-winner/:joiningCode', userController.getWinner);






module.exports = router;
