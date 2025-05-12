/**
 * Pin Controller
 * Handles logic for pin-related pages and actions
 */

const Pin = require('../models/Pin');
const upload = require('../middlewares/upload');
const { validationResult } = require('express-validator');
const User = require("../models/User");


/**
 * Process creation form submission
 */

exports.postCreate = async (req, res, next) => {

    upload.single('pinImage')(req, res, async (err) => {
        if (err) {
            // Handle file upload error
            return res.status(400).render('user/create', {
                title: 'Create Pin',
                // user: req.session.user,
                errors: [{ msg: err.message || 'File upload error' }]
            });
        }
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).render('user/create', {
                    title: 'Create',
                    errors: errors.array(),
                    createPinData: {
                        title: req.body.title,
                        description: req.body.description,
                        tags: req.body.tags.split(" ")
                    }
                });
            }
            if (req.file) {
                // Create new pin
                const pin = new Pin({

                    title: req.body.title,
                    description: req.body.description,
                    data: req.file.buffer,
                    tags: req.body.tags,
                    contentType: req.file.mimetype,
                    userId: req.session.user.id

                    // TODO catch upload error

                    //     try{
                    // } catch (imageError) {
                    //     console.error('Error handling profile image:', imageError);
                    //     // return res.status(500).render('user/settings', {
                    //     //     title: 'Settings',
                    //     //     user: req.session.user,
                    //         errors: [{ msg: 'Error saving profile image' }]
                    //     });
                    // }

                });

                // Save pin to database
                await pin.save();

                // Add pin to current users pins
                const user = await User.findById(req.session.user.id);
                if (user.pinList) {
                    user.pinList.push(pin._id);
                    console.log("pin added to users list")
                    await user.save();
                }

                req.session.flashMessage = {
                    type: 'success',
                    text: 'Post created.'
                };
                res.redirect('/user/home');

            }
        } catch
        (error) {
            next(error);
        }
    });
};

exports.savePin = async (req, res, next) => {
    upload.single('pinImage')(req, res, async (err) => {
        if (err) {
            // Handle file upload error
            return res.status(400).render('user/save', {
                title: 'Save Pin',
                // user: req.session.user,
                errors: [{ msg: err.message || 'File upload error' }]
            });
        }
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).render('user/save', {
                    title: 'Save',
                    errors: errors.array(),
                    createPinData: {
                        title: req.body.title,
                        description: req.body.description,
                        tags: req.body.tags.split(" ")
                    }
                });
            }
            if (req.file) {
                // Save pin to database
                await req.file.save();

                // Add pin to current users pins
                const user = await User.findById(req.session.user.id);
                if (user.pinList) {
                    user.pinList.push(pin._id);
                    console.log("pin added to users list")
                    await user.save();
                }

                req.session.flashMessage = {
                    type: 'success',
                    text: 'Post created.'
                };
                res.redirect('/user/home');

            }
        } catch
        (error) {
            next(error);
        }
    });
};


exports.getPinImage = async (req, res, next) => {
    try {
        // Get pin ID from params
        const pinId = req.params.pin;

        // Find image in database
        const pin = await Pin.findOne({ _id: pinId });

        if (!pin || !pin.data) {
            return res.status(404).send('Image not found');
        }

        // Set the content type header and send the image data
        //res.set('Title', pin.title);
        res.set('Content-Type', pin.contentType);
        res.send(pin.data);
    } catch (error) {
        next(error);
    }
};

// View a pin after clicking it
exports.viewPin = async (req, res, next) => {
    try {
        //Find one pin with given id
        const pin = await Pin.findOne({ _id: req.params.pin });
        if (!pin || !pin.data) {
            return res.status(404).send('Image not found');
        }

        res.render('pin/pinPage', {
            title: 'Home',
            user: req.session.user,
            pin: pin
        });

    } catch (error) {
        next(error);
    }
};

