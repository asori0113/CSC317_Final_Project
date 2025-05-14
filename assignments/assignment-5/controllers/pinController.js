/**
* Pin Controller
* Handles logic for pin-related pages and actions
*/

const Pin = require('../models/Pin');
const upload = require('../middlewares/upload');
const { validationResult } = require('express-validator');
const User = require("../models/User");
const { text } = require('express');

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
  try {
    const pin = await Pin.findOne({ _id: req.params.pin });
    const user = await User.findById(req.session.user.id);

    if (!pin || !user) {
      const error = new Error('Pin or user not found');
      error.statusCode = 404;
      return next(error);
    }

    // Prevent users from saving their own pins
    if (pin.userId.toString() === req.session.user.id) {
      const error = new Error('You cannot save your own pin.');
      error.statusCode = 400;
      return next(error);
    }

    // Avoid duplicates
    if (!user.pinList.includes(pin._id.toString())) {
      user.pinList.push(pin._id);
      await user.save();

      req.session.user.pinList = user.pinList;
      req.session.save();
    }

    res.redirect('/user/home');
  } catch (err) {
    next(err); // Pass to centralized error handler
  }
};


exports.deletePin = async (req, res, next) => {
    try {
        const userId = req.session.user?.id;
        const pinId = req.params.pin;

        console.log("deletePin called");
        console.log("userId from session:", userId);
        console.log("pinId from params:", pinId);

        if (!userId) {
            console.log("Unauthorized - no user ID");
            return res.status(401).send('Unauthorized');
        }

        const pin = await Pin.findById(pinId);
        if (!pin) {
            console.log("Pin not found in DB");
            return res.status(404).send('Pin not found');
        }

        const user = await User.findById(userId);
        const isOwner = pin.userId.toString() === userId;

        console.log("Owner of pin:", pin.userId.toString());
        console.log("Is current user the owner?", isOwner);

        if (isOwner) {
            await Pin.findByIdAndDelete(pinId);
            console.log("Pin deleted from DB");

            user.pinList = user.pinList.filter(id => id.toString() !== pinId);

            await User.updateMany(
                { pinList: pinId },
                { $pull: { pinList: pinId } }
            );
            await user.save();

            console.log("Pin removed from all users' lists");
        } else {
            user.pinList = user.pinList.filter(id => id.toString() !== pinId);
            await user.save();
            console.log("Pin unsaved from current user list");
        }

        req.session.user.pinList = user.pinList;
        req.session.save();

        req.session.flashMessage = {
            type: 'success',
            text: isOwner
                ? 'Pin deleted from platform and unsaved for all users.'
                : 'Pin unsaved from your collection.'
        };

        return res.redirect('/user/profile');
    } catch (error) {
        console.error("Error in deletePin:", error);
        return next(error);
    }
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
       const pin = await Pin.findOne({ _id: req.params.pin });

       if (!pin || !pin.data) {
           return res.status(404).send('Image not found');
       }

       const pinOwner = await User.findById(pin.userId).lean();

       const formattedTags = pin.tags.trim().split(" ").join("|");

       // remove spaces and format in to a case insensitive regex
       const related = new RegExp(formattedTags,"i");

       // don't include the featured pin
       let pins = await Pin.find({tags: related, _id: { $ne: pin._id}} );
       // TODO throw error if pins is empty
       res.render('pin/pinPage', {
           title: 'Pin Detail',
           user: req.session.user,       // That is for the logged  in user for the header
           pinOwner: pinOwner,           // This will the creator of the pin
           pin: pin,
           pins: pins
       });
   } catch (error) {
       next(error);
   }
};
