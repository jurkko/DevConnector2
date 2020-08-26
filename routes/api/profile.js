const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const {
    check,
    validationResult
} = require('express-validator/check');




// @route GET /api/profile/me
// @desc Get current users profile
// @access Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        }).populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({
                msg: 'There is no profile for this user'
            });

        }

        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});






// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private
router.post(
    '/',
    [
        auth,
        [
            check('status', 'Status is required').not().isEmpty(),
            check('skills', 'Skills is required').not().isEmpty()
        ]
    ],


    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        const {
            company,
            location,
            website,
            bio,
            skills,
            status,
            githubusername,
            youtube,
            twitter,
            instagram,
            linkedin,
            facebook
        } = req.body;

        //build profile object
        const profileFields = {


        };
        profileFields.user = req.user.id;
        if (company) profileFields.company = company;
        if (website) profileFields.company = website;
        if (location) profileFields.company = location;
        if (bio) profileFields.company = bio;
        if (status) profileFields.company = status;
        if (githubusername) profileFields.company = githubusername;
        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        };


        // Build social object
        profileFields.social = {}
        if (youtube) profileFields.social.youtube = youtube;
        if (twitter) profileFields.social.twitter = twitter;
        if (facebook) profileFields.social.facebook = facebook;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (instagram) profileFields.social.instagram = instagram;

        try {
            let profile = await Profile.findOne({
                user: req.user.id
            });


            if (profile) {
                let profile = await Profile.findOneAndUpdate({ // When we use mongoose method ==> await infront
                    user: req.user.id
                }, {
                    $set: profileFields
                }, {
                    new: true
                });

                return res.json(profile);
            }

            // Create a profile 

            profile = new Profile(profileFields);
            await Profile.save();
            res.json(profile)
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error');
        }
        console.log(profileFields.skills);


    }

)


module.exports = router;