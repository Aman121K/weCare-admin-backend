require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../model/UserModel")
const { ObjectId } = require("mongodb")

exports.addNewUser = async (req, res) => {
    const { email, password, type } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return res.status(400).send({
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
    const { user_id, gst, pan, aadhar, farm_no, owner_name, account_no } = req.body;
    try {
        const getUser_id = await User.findOne({ _id: new ObjectId(user_id) });
        if (getUser_id) {
            const updateAgentData = User.updateMany(
                { _id: new ObjectId(user_id) }, {
                    $set: {
                        gst: gst,
                        pan: pan,
                        aadhar: aadhar,
                        Farm_no: farm_no,
                        Owner_name: owner_name,
                        Account_no: account_no,
                        added_date: Date.now(),
                    }
            });
            const updateAgent = await updateAgentData.save();
            console.log("updateAgent>>>>", updateAgent)
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


