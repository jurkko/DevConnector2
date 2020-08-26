const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const {
    check,
    validationResult
} = require('express-validator/check'); //Express validator --> Check documentation


// @route    GET api/auth
// @desc     Get user by token
// @access   Private
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route POST /api/auth
// @desc Authenticate user & get the token
// @access Public 


router.post('/', [
    check('email', 'PLease include your email').isEmail(),
    check('password', 'Password required').exists()
], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }


    const {
        email,
        password
    } = req.body;

    try {
        //See if the user Exists
        let user = await User.findOne({
            email
        });

        if (!user) {
            res.status(400).json({
                errors: [{
                    msg: 'Invalid credentials'
                }]
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                errors: [{
                    msg: 'Invalid credentials'
                }]
            });
        }

        //Return JSON web token 
        const payload = {
            user: {
                id: user.id,

            }
        }

        jwt.sign(payload, config.get('jwtSecret'), {
            expiresIn: 360000
        }, (err, token) => {
            try {

                console.log(token);
                res.json({
                    token
                });
            } catch (err) {
                throw err;
            }


        });




    } catch (err) {
        console.error(err.message); // fires a err message
        res.status(500).send('Server error');
    }

});


module.exports = router;