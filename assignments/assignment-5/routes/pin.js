const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Pin = require('../models/Pin');
const { isAuthenticated } = require('../middlewares/auth');
const pinController = require('../controllers/pinController');
router.use(isAuthenticated);

router.post('/pin-post-creation', pinController.postCreate);

router.get('/get-image/:pin', pinController.getPinImage);

// GET /user/pinPage - View a Pin
router.get('/pinPage/:pin', pinController.viewPin);

module.exports = router;