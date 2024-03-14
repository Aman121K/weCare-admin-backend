const express = require("express");
const router = express.Router();

const multer = require('multer');
const uploadController = require('../controller/uploadController');

const orderController = require('../controllers/orderController');

const {postContact, getAllUsers} = require('./routes/contact');

const { addNewUser, loginUser, UpdateAgentData, allSubAdmins, overviewData } = require("../controller/UserController");
const { addLeads, showAllLeads } = require("../controller/LeadsController");

router.post("/add-user", addNewUser);
router.post("/login", loginUser);
router.post("/add-lead", addLeads);
router.get("/show-all-leads", showAllLeads);
router.post("/update-agent-data", UpdateAgentData);
router.get("/all-sub-admins-data", allSubAdmins);
router.get("/overview-data", overviewData)

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.array('images'), uploadController.uploadImage);

router.post('/api/create_order', orderController.createOrder);

router.route("/contact").post(postContact);

router.route("/users").get(getAllUsers);

module.exports = router;
