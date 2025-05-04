/**
 * Pin Controller
 * Handles logic for pin-related pages and actions
 */

const Pin = require('../models/Pin');
const upload = require('../middlewares/upload');
const { validationResult } = require('express-validator');

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


// upload pic things
// async (req, res, next) => {
//     try {
//         upload.single('profileImage')(req, res, async (err) => {
//             if (err) {
//                 // Handle file upload error
//                 return res.status(400).render('user/settings', {
//                     title: 'Settings',
//                     user: req.session.user,
//                     errors: [{ msg: err.message || 'File upload error' }]
//                 });
//             }
//
//         } catch (error) {
//             next(error);
//         }
//     };
//
//     // Process profile image if uploaded
//     if (req.file) {
//         try {
//             // // Check if user already has a profile image
//             // const existingImage = await Image.findOne({ userId: userId });
//
//             if (existingImage) {
//                 // Update existing image
//                 existingImage.data = req.file.buffer;
//                 existingImage.contentType = req.file.mimetype;
//                 await existingImage.save();
//             } else {
//                 // Create new image document
//                 const newImage = new Image({
//                     userId: userId,
//                     data: req.file.buffer,
//                     contentType: req.file.mimetype
//                 });
//                 await newImage.save();
//
//                 // Update user to indicate they have a profile image
//                 user.hasProfileImage = true;
//             }
//
//             // Update session to indicate user has a profile image
//             req.session.user.hasProfileImage = true;
//         } catch (imageError) {
//             console.error('Error handling profile image:', imageError);
//             return res.status(500).render('user/settings', {
//                 title: 'Settings',
//                 user: req.session.user,
//                 errors: [{ msg: 'Error saving profile image' }]
//             });
//         }
