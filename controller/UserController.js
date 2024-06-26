require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../model/UserModel")
const Leads = require("../model/LeadsModel")
const { ObjectId } = require("mongodb")

exports.addNewUser = async (req, res) => {
    const { email, password, type } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return res.status(200).send({
            success: 1,
            message: "User already Exists. Please log in.",
            data: {}
        });
    }

    const addUser = new User({
        email: email,
        password: password,
        type: type,
        added_date: Date.now(),
    });
    try {
        const newUser = await addUser.save();
        const userId = newUser._id.toString();
        const userData = { ...newUser, _id: userId }
        res.status(200).send({
            success: 1, message: "user Added Successfully", data: userData
        })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
exports.loginUser = async (req, res) => {
    const { email, password, type } = req.body;
    const existingUser = await User.findOne({ email, password, type });
    try {
        if (existingUser) {
            res.status(200).send({
                success: 1, message: "User Found", data: existingUser
            })
        }
        else {
            return res.status(400).send({
                success: 0,
                message: "User does not exist.",
                data: {}
            });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
exports.UpdateAgentData = async (req, res) => {
    const { user_id, gst, pan, aadhar, farm_no, owner_name, account_no, mobile_no } = req.body;
    try {
        const getUser_id = await User.findOne({ _id: new ObjectId(user_id) });
        if (getUser_id) {
            await User.updateMany(
                { _id: new ObjectId(user_id) }, {
                $set: {
                    mobile_no: mobile_no,
                    Gst: gst,
                    Pan: pan,
                    Aadhar: aadhar,
                    Farm_no: farm_no,
                    Owner_name: owner_name,
                    Account_no: account_no,
                    added_date: Date.now(),
                }
            });
            return res.status(200).send({
                success: 1,
                message: "Data Updated Successfully.",
                data: {}
            });
            // const updateAgentData = await User
        }
        else {
            return res.status(400).send({
                success: 0,
                message: "User does not exist.",
                data: {}
            });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
exports.allSubAdmins = async (req, res) => {
    try {
        const agentUsers = await User.find({ type: 'agent' }).exec();
        console.log("agentUsers", agentUsers);
        const leadsByAgent = [];
        for (const agentUser of agentUsers) {
            const leads = await Leads.find({ agent_id: agentUser._id.toString() }).exec();
            let totalPrice = 0;
            leads.forEach(lead => {
                totalPrice += lead.price;
            });

            leadsByAgent.push({ agent: agentUser, leads, totalPrice });
        }

        console.log(leadsByAgent);
        return res.status(200).json({
            success: 1,
            message: "Leads data aggregated successfully",
            data: leadsByAgent
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
exports.overviewData = async (req, res) => {
    try {
        const pipeline = [
            {
                $group: {
                    _id: null,
                    totalPrice: { $sum: "$price" }
                }
            }
        ];

        const subAdminAddedToday = await User.countDocuments({
            added_date: {
                $gte: new Date(new Date().setHours(0, 0, 0)), // Start of the current day
                $lt: new Date(new Date().setHours(23, 59, 59)) // End of the current day
            }
        });

        const LeadsAddedToday = await Leads.countDocuments({
            added_date: {
                $gte: new Date(new Date().setHours(0, 0, 0)), // Start of the current day
                $lt: new Date(new Date().setHours(23, 59, 59)) // End of the current day
            }
        });

        const EarningsToday = [
            {
                $match: {
                    added_date: {
                        $gte: new Date(new Date().setHours(0, 0, 0)), // Start of the current day
                        $lt: new Date(new Date().setHours(23, 59, 59)) // End of the current day
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalPrice: { $sum: "$price" }
                }
            }
        ];

        const totalEarningsSingleDay = await Leads.aggregate(EarningsToday);
        const subAdmin = await User.countDocuments();
        const allLeads = await Leads.countDocuments();
        const totalEarning = await Leads.aggregate(pipeline);

        const FullData = {
            subAdmin: subAdmin,
            allLeads: allLeads,
            toalEarning: totalEarning.length > 0 ? totalEarning[0].totalPrice : 0,
        };

        const oneDayData = {
            subAdmin: subAdminAddedToday,
            allLeads: LeadsAddedToday,
            toalEarning: totalEarningsSingleDay.length > 0 ? totalEarningsSingleDay[0].totalPrice : 0,
        };

        return res.status(200).json({
            success: 1,
            message: "Data Found",
            data: { fullData: FullData, oneDayData: oneDayData }
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


