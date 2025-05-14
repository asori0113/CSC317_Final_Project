const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Pin = require('../models/Pin');
const { isAuthenticated } = require('../middlewares/auth');
const pinController = require('../controllers/pinController');
router.use(isAuthenticated);

// POST /pin-post-creation - save pin to database
router.post('/pin-post-creation', pinController.postCreate);

// POST /pin-save/:pin - save pin to user list
router.post('/pin-save/:pin', pinController.savePin);

// POST /pin-delete/:pin - delte pin to user(s) list
router.post('/pin-delete/:pin', pinController.deletePin);

// GET /get-image/:pin - get Pin Image
router.get('/get-image/:pin', pinController.getPinImage);

// GET /user/pinPage - View a Pin
router.get('/pinPage/:pin', pinController.viewPin);

module.exports = router;


