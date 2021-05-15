const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const User = require('../models/user.model');

router.post('/register', async (req, res, next) => {
    console.log(req.body);
    try {
        const { email, password } = req.body;
        if (!email || !password) throw createError.BadRequest();

        const doesExist = await User.findOne({ email });
        if (doesExist) throw createError.Conflict(`${email} is already been registered`);

        const user = new User({ email, password });
        const savedUser = await user.save();
        res.send(savedUser);
    } catch (error) {
        next(error);
    }
});

router.post('/login', (req, res, next) => {
    res.send('login route');
});

router.post('/refresh-token', (req, res, next) => {
    res.send('refresh token route');
});

router.delete('/logout', (req, res, next) => {
    res.send('logout route');
});

module.exports = router;
