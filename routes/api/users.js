const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const {
    check,
    validationResult
} = require('express-validator/check'); //Express validator --> Check documentation



// @route POST /api/users
// @desc Register user
// @access Public 

router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'PLease include your email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({
        min: 6
    }),
], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    //console.log(req.body);

    const {
        name,
        email,
        password
    } = req.body;

    try {
        //See if the user Exists
        let user = await User.findOne({
            email
        });

        if (user) {
            res.status(400).json({
                errors: [{
                    msg: 'User already exists'
                }]
            });
        }

        //Get user's gravatar
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })

        //Creating User model
        user = new User({
            name,
            email,
            avatar,
            password
        })

        //Encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        //Save user 
        await user.save(); // If something returns promise --> Await infront

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

        //res.send('User registered ' + token);


    } catch (err) {
        console.error(err.message); // fires a err message
        res.status(500).send('Server error');
    }

});

module.exports = router;