const express = require('express');
const router = express.Router();
const User = require('../models/User');
router.post('/', async (req, res) => {
    const { email, firstName,lastName, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ error: "User Already Exist" })
        }
        const newUser = new User({email,firstName,lastName,password});
        await newUser.save();
        return res.json({ message: "User succesfully registered" ,user:newUser});
    }
    catch {
        return res.json({ error: "User failed to register" })
    }
})

module.exports=router