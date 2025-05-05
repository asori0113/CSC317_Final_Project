/**
 * Pin Controller
 * Handles logic for pin-related pages and actions
 */

const Pin = require('../models/Pin');
const upload = require('../middlewares/upload');
const { validationResult } = require('express-validator');
const User = require("../models/User");


/**
 * Process registration form submission
 */

exports.postCreate = async (req, res, next) => {

    upload.single('pinImage')(req, res, async (err) => {
        if (err) {
            // Handle file upload error
            return res.status(400).render('pin/create', {
                title: 'Create Pin',
                // user: req.session.user,
                errors: [{msg: err.message || 'File upload error'}]
            });
        }
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).render('pin/create', {
                    title: 'Create',
                    errors: errors.array(),
                    createPinData: {
                        title: req.body.title,
                        description: req.body.description
                    }
                });
            }
            if (req.file) {
                // Create new pin
                const pin = new Pin({

                    title: req.body.title,
                    description: req.body.description,
                    data: req.file.buffer,
                    contentType: req.file.mimetype

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

                req.session.flashMessage = {
                    type: 'success',
                    text: 'Post created.'
                };
                res.redirect('/user/home');

            }
        }catch
            (error)
            {
                next(error);
            }
        });
    };


/**
 * Get current user's profile image
 */
// by index??
exports.getPinImage = async (req, res, next) => {
    try {
        // Get user ID from params
        const pin = req.params.pin;

        // Find image in database
        // const image = await Image.findOne({ userId: userId });

        if (!pin  || !pin.data) {
            return res.status(404).send('Image not found');
        }

        // Set the content type header and send the image data
        res.set('Content-Type', pin.contentType);
        res.send(pin.data);
    } catch (error) {
        next(error);
    }
};

// exports.getPinImageTest = async (req, res, next) => {
//     try {
//         // Get user ID from params
//         const pin = await Pin.findOne({ title: 'test'});
//
//         // Find image in database
//
//         if (!pin  || !pin.data) {
//             return res.status(404).send('Image not found');
//         }
//
//         // Set the content type header and send the image data
//         res.set('Content-Type', pin.contentType);
//         res.send(pin.data);
//     } catch (error) {
//         next(error);
//     }
// };
