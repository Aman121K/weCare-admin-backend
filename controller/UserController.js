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
            return res.status(200).send({
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
        const leadsData = [
            {
                $group: {
                    _id: "$user_id",
                    totalPrice: { $sum: "$price" },
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userData"
                }
            },
            {
                $unwind: "$userData"
            },
            {
                $project: {
                    user_id: "$_id",
                    totalPrice: 1,
                    userData: {
                        Owner_name: 1,
                        email: 1,
                        mobile: 1,
                        Gst: 1,
                    }
                }
            }
        ];

        const result = await Leads.aggregate(leadsData);
        console.log("re>>>>", result)

        return res.status(200).json({
            success: 1,
            message: "Leads data aggregated successfully",
            data: result
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
        const subAdmin = (await User.find()).length;
        const allLeads = (await Leads.find()).length;
        const toalEarning = await Leads.aggregate(pipeline);

        const FullData = {
            subAdmin: subAdmin,
            allLeads: allLeads,
            toalEarning: toalEarning[0].totalPrice,
        }
        const oneDayData = {
            subAdmin: subAdminAddedToday,
            allLeads: LeadsAddedToday,
            toalEarning: totalEarningsSingleDay[0].totalPrice,
        }

        return res.status(200).json({
            success: 1,
            message: "Data Found",
            data: { fullData: FullData, oneDayData: oneDayData }
        })

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


