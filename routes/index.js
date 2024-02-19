const express = require("express");
const router = express.Router();

const { addNewUser, loginUser, UpdateAgentData } = require("../controller/UserController");
const { addLeads, showAllLeads } = require("../controller/LeadsController");

router.post("/add-user", addNewUser);
router.post("/login", loginUser);
router.post("/add-lead", addLeads);
router.get("/show-all-leads", showAllLeads);
router.post("/update-agent-data", UpdateAgentData);



module.exports = router;
