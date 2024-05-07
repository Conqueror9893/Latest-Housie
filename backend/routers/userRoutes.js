const router = require("express").Router();
const userController = require('../controllers/userController');
const ticketController = require("../controllers/ticketController")
const gameController = require("../controllers/gameController")

router.post('/addUser', userController.addUsers);
router.get('/getUsers', userController.getAllUsers);

router.get('/get-tickets',ticketController.getTickets)

router.get("/game/:id", gameController.redirectGame);
router.get("/invitation", gameController.generateJoiningCodeEndpoint);
router.get("/verify", gameController.verifyJoiningCodeEndpoint);



module.exports = router;
