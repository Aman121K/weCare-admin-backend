const express = require("express");
const router = express.Router();

const { addNewUser, loginUser, UpdateAgentData, allSubAdmins, overviewData } = require("../controller/UserController");
const { addLeads, showAllLeads, getInvoices, sendOTPMail, sendOTPMessage } = require("../controller/LeadsController");

router.post("/add-user", addNewUser);
router.post("/login", loginUser);
router.post("/add-lead", addLeads);
router.get("/show-all-leads", showAllLeads);
router.post("/update-agent-data", UpdateAgentData);
router.get("/all-sub-admins-data", allSubAdmins);
router.get("/overview-data", overviewData);
router.get("/getInvoice", getInvoices);
router.post("/sendOTPMail", sendOTPMail);
router.post("/sendOTPMessage", sendOTPMessage)



module.exports = router;
